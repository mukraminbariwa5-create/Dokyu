/**
 * Sign-in sessions (plan §5.4): 15-minute access tokens plus rotating refresh tokens stored as hashes.
 * A "family" is one signed-in device. Every refresh replaces the token; if an old token is ever used again,
 * someone copied it, so the whole family is signed out.
 */
import { randomUUID } from 'node:crypto';
import type { PrismaClient, User } from '@prisma/client';
import type { PublicUser } from '@dokyu/shared';
import { randomToken, sha256 } from '../lib/crypto.js';
import type { Jwt } from '../lib/jwt.js';
import { audit } from './audit.js';

export const REFRESH_TOKEN_TTL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

export function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    language: u.language === 'tl' ? 'tl' : 'en',
    textSize: u.textSize === 'large' ? 'large' : 'normal',
    province: u.province,
    municipality: u.municipality,
    goals: u.goals as PublicUser['goals'],
    emailVerified: u.emailVerifiedAt !== null,
    onboarded: u.onboardedAt !== null,
  };
}

async function createRefresh(
  db: PrismaClient,
  userId: string,
  familyId: string,
  deviceLabel: string | null,
) {
  const refreshToken = randomToken();
  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * DAY_MS);
  await db.refreshToken.create({
    data: {
      userId,
      familyId,
      tokenHash: sha256(refreshToken),
      deviceLabel,
      expiresAt: refreshExpiresAt,
    },
  });
  return { refreshToken, refreshExpiresAt };
}

/** Starts a new session (a new family) after a successful sign-in. */
export async function startSession(
  db: PrismaClient,
  jwt: Jwt,
  user: Pick<User, 'id' | 'role'>,
  deviceLabel: string | null,
): Promise<IssuedTokens> {
  const familyId = randomUUID();
  const { refreshToken, refreshExpiresAt } = await createRefresh(
    db,
    user.id,
    familyId,
    deviceLabel,
  );
  const accessToken = await jwt.sign({ sub: user.id, role: user.role, sid: familyId });
  return { accessToken, refreshToken, refreshExpiresAt };
}

export type RotateResult =
  { ok: true; tokens: IssuedTokens; user: User } | { ok: false; reason: 'invalid' | 'reused' };

/** Swaps a refresh token for a new pair. Safe against two requests racing with the same token. */
export async function rotateSession(
  db: PrismaClient,
  jwt: Jwt,
  presented: string,
  ip?: string,
): Promise<RotateResult> {
  const row = await db.refreshToken.findUnique({
    where: { tokenHash: sha256(presented) },
    include: { user: true },
  });
  if (!row) return { ok: false, reason: 'invalid' };

  if (row.revokedAt) {
    // A replaced token came back: treat the device as compromised and sign it out everywhere in this family.
    await db.refreshToken.updateMany({
      where: { familyId: row.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await audit(db, {
      actorId: row.userId,
      action: 'auth.refresh_reuse',
      entity: 'User',
      entityId: row.userId,
      meta: { familyId: row.familyId },
      ip,
    });
    return { ok: false, reason: 'reused' };
  }
  if (row.expiresAt <= new Date() || row.user.deletedAt) return { ok: false, reason: 'invalid' };

  // Only one request can win this update; a loser sees count 0 and is treated like a reuse.
  const claimed = await db.refreshToken.updateMany({
    where: { id: row.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (claimed.count !== 1) {
    await db.refreshToken.updateMany({
      where: { familyId: row.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: false, reason: 'reused' };
  }

  const { refreshToken, refreshExpiresAt } = await createRefresh(
    db,
    row.userId,
    row.familyId,
    row.deviceLabel,
  );
  const accessToken = await jwt.sign({ sub: row.userId, role: row.user.role, sid: row.familyId });
  return { ok: true, tokens: { accessToken, refreshToken, refreshExpiresAt }, user: row.user };
}

/** Signs out the device that owns this refresh token. Unknown tokens are ignored. */
export async function endSessionByToken(
  db: PrismaClient,
  presented: string,
): Promise<string | null> {
  const row = await db.refreshToken.findUnique({ where: { tokenHash: sha256(presented) } });
  if (!row) return null;
  await db.refreshToken.updateMany({
    where: { familyId: row.familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return row.userId;
}

/** Signs out every device of a user (after a password reset). */
export async function endAllSessions(db: PrismaClient, userId: string): Promise<void> {
  await db.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** The user's signed-in devices: one entry per family that still has a live token. */
export async function listSessions(db: PrismaClient, userId: string, currentFamilyId: string) {
  const rows = await db.refreshToken.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  const firstSeen = await db.refreshToken.groupBy({
    by: ['familyId'],
    where: { familyId: { in: rows.map((r) => r.familyId) } },
    _min: { createdAt: true },
  });
  const started = new Map(firstSeen.map((f) => [f.familyId, f._min.createdAt]));
  return rows.map((r) => ({
    id: r.familyId,
    device: r.deviceLabel ?? 'Unknown device',
    signedInAt: started.get(r.familyId) ?? r.createdAt,
    lastActiveAt: r.createdAt,
    current: r.familyId === currentFamilyId,
  }));
}
