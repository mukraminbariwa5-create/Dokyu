/**
 * /api/v1/auth — sign-up, sign-in, sessions and email links (plan §5.3, §5.4).
 *
 * Web clients keep the refresh token in an httpOnly cookie that JavaScript can't read. The Android app keeps it
 * in the device's secure storage, so it gets the token in the response body instead. Every request must say
 * which kind of client it is in the X-Dokyu-Client header; a cross-site form can't set that header, which
 * blocks CSRF on the cookie-based routes.
 */
import { Router, type CookieOptions, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import type { PrismaClient } from '@prisma/client';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from '@dokyu/shared';
import type { Env } from '../env.js';
import { randomToken, sha256 } from '../lib/crypto.js';
import { deviceLabel } from '../lib/device.js';
import { ACCESS_TOKEN_TTL_SECONDS, type Jwt } from '../lib/jwt.js';
import type { Mailer } from '../lib/mailer.js';
import { getDummyHash, hashPassword, verifyPassword } from '../lib/passwords.js';
import { validate } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { audit } from '../services/audit.js';
import {
  endAllSessions,
  endSessionByToken,
  rotateSession,
  startSession,
  toPublicUser,
  type IssuedTokens,
} from '../services/sessions.js';

export const REFRESH_COOKIE = 'dokyu_rt';
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;
const VERIFY_LINK_HOURS = 24;
const RESET_LINK_MINUTES = 30;

type Client = 'web' | 'native';

function clientOf(req: Request): Client | null {
  const v = req.get('x-dokyu-client');
  return v === 'web' || v === 'native' ? v : null;
}

export function authRouter(env: Env, db: PrismaClient, jwt: Jwt, mailer: Mailer) {
  const r = Router();
  const cookieBase: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
  };

  // Brute-force protection per IP, on top of the per-account lockout below.
  const limiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: env.AUTH_RATE_LIMIT,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
  });

  // Every auth call must declare its client type (CSRF guard, see the comment at the top).
  r.use((req, res, next) => {
    if (req.method === 'POST' && !clientOf(req)) {
      res.status(400).json({ error: 'Missing X-Dokyu-Client header' });
      return;
    }
    next();
  });

  function sendSession(
    req: Request,
    res: Response,
    status: number,
    tokens: IssuedTokens,
    user: Parameters<typeof toPublicUser>[0],
  ) {
    const client = clientOf(req);
    if (client === 'web')
      res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
        ...cookieBase,
        expires: tokens.refreshExpiresAt,
      });
    res.status(status).json({
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      ...(client === 'native' ? { refreshToken: tokens.refreshToken } : {}),
    });
  }

  function presentedRefresh(req: Request): string | undefined {
    const fromCookie: unknown = req.cookies?.[REFRESH_COOKIE];
    if (typeof fromCookie === 'string' && fromCookie) return fromCookie;
    const fromBody: unknown = (req.body as { refreshToken?: unknown } | undefined)?.refreshToken;
    return clientOf(req) === 'native' && typeof fromBody === 'string' ? fromBody : undefined;
  }

  async function sendEmailLink(
    userId: string,
    email: string,
    type: 'VERIFY_EMAIL' | 'RESET_PASSWORD',
  ) {
    // Only one live link of each kind at a time.
    await db.emailToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });
    const token = randomToken();
    const minutes = type === 'VERIFY_EMAIL' ? VERIFY_LINK_HOURS * 60 : RESET_LINK_MINUTES;
    await db.emailToken.create({
      data: {
        userId,
        type,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + minutes * 60_000),
      },
    });
    const path = type === 'VERIFY_EMAIL' ? 'verify-email' : 'reset-password';
    const link = `${env.APP_URL}/${path}?token=${token}`;
    await mailer.send(
      type === 'VERIFY_EMAIL'
        ? {
            to: email,
            subject: 'Confirm your Dokyu email',
            text: `Open this link to confirm your email (valid for ${VERIFY_LINK_HOURS} hours):\n${link}`,
          }
        : {
            to: email,
            subject: 'Reset your Dokyu password',
            text: `Open this link to choose a new password (valid for ${RESET_LINK_MINUTES} minutes):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
          },
    );
  }

  /** Finds a live email link and marks it used. Returns the user id, or null. */
  async function consumeEmailLink(token: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD') {
    const row = await db.emailToken.findUnique({ where: { tokenHash: sha256(token) } });
    if (!row || row.type !== type || row.usedAt || row.expiresAt <= new Date()) return null;
    const claimed = await db.emailToken.updateMany({
      where: { id: row.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    return claimed.count === 1 ? row.userId : null;
  }

  /**
   * Sign-up never says whether an email is already registered (that would let anyone check who uses Dokyu).
   * New emails get a confirmation link; existing ones get a "you already have an account" notice.
   * The app then signs in with the same email and password.
   */
  r.post('/signup', limiter, async (req, res) => {
    const input = validate(signupSchema, req.body, res);
    if (!input) return;
    const passwordHash = await hashPassword(input.password); // hashed either way, so timing is the same
    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) {
      await mailer.send({
        to: input.email,
        subject: 'You already have a Dokyu account',
        text: `Someone tried to create a Dokyu account with this email. If it was you, sign in instead, or reset your password at ${env.APP_URL}/forgot-password.`,
      });
    } else {
      const user = await db.user.create({
        data: {
          email: input.email,
          passwordHash,
          fullName: input.fullName,
          language: input.language,
          consentAt: new Date(),
        },
      });
      await audit(db, {
        actorId: user.id,
        action: 'auth.signup',
        entity: 'User',
        entityId: user.id,
        ip: req.ip,
      });
      await sendEmailLink(user.id, user.email, 'VERIFY_EMAIL');
    }
    res.status(202).json({ message: 'Check your email to confirm your account, then sign in.' });
  });

  r.post('/login', limiter, async (req, res) => {
    const input = validate(loginSchema, req.body, res);
    if (!input) return;
    const user = await db.user.findUnique({ where: { email: input.email } });
    const wrong = () => res.status(401).json({ error: 'Email or password is incorrect' });

    if (!user || user.deletedAt) {
      await verifyPassword(await getDummyHash(), input.password);
      wrong();
      return;
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      res.status(429).json({
        error: `Too many wrong passwords. Try again in ${minutes} minute(s) or reset your password.`,
      });
      return;
    }
    if (!(await verifyPassword(user.passwordHash, input.password))) {
      const failed = user.failedLogins + 1;
      const lock = failed >= MAX_FAILED_LOGINS;
      await db.user.update({
        where: { id: user.id },
        data: lock
          ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) }
          : { failedLogins: failed },
      });
      if (lock)
        await audit(db, {
          actorId: user.id,
          action: 'auth.lockout',
          entity: 'User',
          entityId: user.id,
          ip: req.ip,
        });
      wrong();
      return;
    }

    const fresh = await db.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null },
    });
    const tokens = await startSession(
      db,
      jwt,
      fresh,
      deviceLabel(req.get('user-agent'), clientOf(req) ?? undefined),
    );
    await audit(db, {
      actorId: user.id,
      action: 'auth.login',
      entity: 'User',
      entityId: user.id,
      ip: req.ip,
    });
    sendSession(req, res, 200, tokens, fresh);
  });

  r.post('/refresh', async (req, res) => {
    const presented = presentedRefresh(req);
    // A guest with no session at all is not an error: answer "no session" so the browser console stays clean.
    if (!presented) {
      res.status(204).end();
      return;
    }
    const result = await rotateSession(db, jwt, presented, req.ip);
    if (!result.ok) {
      res.clearCookie(REFRESH_COOKIE, cookieBase);
      res.status(401).json({ error: 'Please sign in again' });
      return;
    }
    sendSession(req, res, 200, result.tokens, result.user);
  });

  r.post('/logout', async (req, res) => {
    const presented = presentedRefresh(req);
    if (presented) {
      const userId = await endSessionByToken(db, presented);
      if (userId)
        await audit(db, {
          actorId: userId,
          action: 'auth.logout',
          entity: 'User',
          entityId: userId,
          ip: req.ip,
        });
    }
    res.clearCookie(REFRESH_COOKIE, cookieBase);
    res.status(204).end();
  });

  r.post('/verify-email', limiter, async (req, res) => {
    const input = validate(verifyEmailSchema, req.body, res);
    if (!input) return;
    const userId = await consumeEmailLink(input.token, 'VERIFY_EMAIL');
    if (!userId) {
      res.status(400).json({
        error: 'This link is invalid or has expired. Ask for a new one from your account page.',
      });
      return;
    }
    await db.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
    await audit(db, {
      actorId: userId,
      action: 'auth.email_verified',
      entity: 'User',
      entityId: userId,
      ip: req.ip,
    });
    res.json({ message: 'Email confirmed' });
  });

  r.post('/resend-verification', limiter, requireAuth(jwt), async (req, res) => {
    const user = await db.user.findUnique({ where: { id: req.auth!.sub } });
    if (user && !user.emailVerifiedAt && !user.deletedAt)
      await sendEmailLink(user.id, user.email, 'VERIFY_EMAIL');
    res
      .status(202)
      .json({ message: 'If your email is not confirmed yet, a new link is on its way.' });
  });

  /** Always answers the same way, whether or not the email has an account. */
  r.post('/forgot', limiter, async (req, res) => {
    const input = validate(forgotPasswordSchema, req.body, res);
    if (!input) return;
    const user = await db.user.findUnique({ where: { email: input.email } });
    if (user && !user.deletedAt) await sendEmailLink(user.id, user.email, 'RESET_PASSWORD');
    res
      .status(202)
      .json({ message: 'If that email has a Dokyu account, a reset link is on its way.' });
  });

  r.post('/reset', limiter, async (req, res) => {
    const input = validate(resetPasswordSchema, req.body, res);
    if (!input) return;
    const userId = await consumeEmailLink(input.token, 'RESET_PASSWORD');
    if (!userId) {
      res.status(400).json({ error: 'This link is invalid or has expired. Ask for a new one.' });
      return;
    }
    const user = await db.user.update({
      where: { id: userId },
      data: {
        passwordHash: await hashPassword(input.password),
        passwordChangedAt: new Date(),
        failedLogins: 0,
        lockedUntil: null,
      },
    });
    // Opening the link proves the user owns the email.
    if (!user.emailVerifiedAt)
      await db.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
    await endAllSessions(db, userId);
    await audit(db, {
      actorId: userId,
      action: 'auth.password_reset',
      entity: 'User',
      entityId: userId,
      ip: req.ip,
    });
    res.json({ message: 'Password changed. Please sign in with your new password.' });
  });

  return r;
}
