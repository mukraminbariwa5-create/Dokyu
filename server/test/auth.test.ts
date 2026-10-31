/**
 * Phase 2 integration tests against a real Postgres (TEST_DATABASE_URL).
 * Covers sign-up, sign-in, lockout, refresh-token rotation, email links, roles and ownership (plan §9).
 */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { SignJWT } from 'jose';
import { MAX_FAILED_LOGINS, REFRESH_COOKIE } from '../src/routes/auth.js';
import {
  PASSWORD,
  createUser,
  db,
  hasTestDb,
  lastLinkToken,
  login,
  makeApp,
  resetDb,
} from './helpers.js';

const native = { 'X-Dokyu-Client': 'native' };

describe.skipIf(!hasTestDb)('auth (database)', () => {
  beforeEach(resetDb);
  afterAll(() => db.$disconnect());

  describe('sign-up', () => {
    it('creates an unverified account, records consent and emails a one-time confirmation link', async () => {
      const { app, mailer } = makeApp();
      const res = await request(app).post('/api/v1/auth/signup').set(native).send({
        email: ' Ana@Example.com ',
        password: PASSWORD,
        fullName: 'Ana Reyes',
        consent: true,
      });
      expect(res.status).toBe(202);

      const user = await db.user.findUniqueOrThrow({ where: { email: 'ana@example.com' } });
      expect(user.passwordHash).not.toContain(PASSWORD);
      expect(user.passwordHash.startsWith('$argon2id$')).toBe(true);
      expect(user.consentAt).not.toBeNull();
      expect(user.role).toBe('USER');

      const { res: loginRes } = await login(app, 'ana@example.com');
      expect(loginRes.body.user.emailVerified).toBe(false);

      const token = lastLinkToken(mailer, 'ana@example.com');
      expect(
        (await request(app).post('/api/v1/auth/verify-email').set(native).send({ token })).status,
      ).toBe(200);
      expect(
        (await request(app).post('/api/v1/auth/verify-email').set(native).send({ token })).status,
      ).toBe(400);
      expect(
        (await db.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerifiedAt,
      ).not.toBeNull();
    });

    it('refuses sign-up without privacy consent and explains which field is wrong', async () => {
      const { app } = makeApp();
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .set(native)
        .send({ email: 'x@example.com', password: 'short', fullName: 'X', consent: false });
      expect(res.status).toBe(400);
      expect(Object.keys(res.body.fields)).toEqual(
        expect.arrayContaining(['password', 'fullName', 'consent']),
      );
      expect(await db.user.count()).toBe(0);
    });

    it('does not reveal whether an email is already registered', async () => {
      const { app, mailer } = makeApp();
      await createUser('taken@example.com');
      const res = await request(app).post('/api/v1/auth/signup').set(native).send({
        email: 'taken@example.com',
        password: 'another-password-123',
        fullName: 'Someone Else',
        consent: true,
      });
      expect(res.status).toBe(202);
      expect(await db.user.count()).toBe(1);
      expect(mailer.outbox.at(-1)?.subject).toMatch(/already have/);
    });
  });

  describe('sign-in', () => {
    it('gives the same answer for a wrong password and an unknown email', async () => {
      const { app } = makeApp();
      await createUser('ben@example.com');
      const wrong = await login(app, 'ben@example.com', 'wrong-password');
      const unknown = await login(app, 'nobody@example.com', 'wrong-password');
      expect(wrong.res.status).toBe(401);
      expect(unknown.res.status).toBe(401);
      expect(wrong.res.body).toEqual(unknown.res.body);
    });

    it(`locks the account after ${MAX_FAILED_LOGINS} wrong passwords, even for the right password`, async () => {
      const { app } = makeApp();
      const user = await createUser('carla@example.com');
      for (let i = 0; i < MAX_FAILED_LOGINS; i++)
        await login(app, 'carla@example.com', 'wrong-password');
      const { res } = await login(app, 'carla@example.com');
      expect(res.status).toBe(429);
      expect(
        await db.auditLog.count({ where: { action: 'auth.lockout', entityId: user.id } }),
      ).toBe(1);
    });

    it('never returns the password hash or lockout fields', async () => {
      const { app } = makeApp();
      await createUser('dan@example.com');
      const { res } = await login(app, 'dan@example.com');
      const body = JSON.stringify(res.body);
      expect(body).not.toMatch(/passwordHash|failedLogins|lockedUntil/);
    });

    it('limits sign-in attempts per IP', async () => {
      const { app } = makeApp({ AUTH_RATE_LIMIT: '3' });
      for (let i = 0; i < 3; i++) await login(app, 'nobody@example.com', 'x');
      expect((await login(app, 'nobody@example.com', 'x')).res.status).toBe(429);
    });
  });

  describe('sessions', () => {
    it('answers a guest with no refresh token with 204, not an error', async () => {
      const { app } = makeApp();
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('X-Dokyu-Client', 'web')
        .send({});
      expect(res.status).toBe(204);
    });

    it('still rejects a bad refresh token with 401', async () => {
      const { app } = makeApp();
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('X-Dokyu-Client', 'native')
        .send({ refreshToken: 'not-a-real-token' });
      expect(res.status).toBe(401);
    });

    it('rotates the refresh token and signs the device out if an old token is reused', async () => {
      const { app } = makeApp();
      await createUser('eve@example.com');
      const first = await login(app, 'eve@example.com');

      const second = await request(app)
        .post('/api/v1/auth/refresh')
        .set(native)
        .send({ refreshToken: first.refreshToken });
      expect(second.status).toBe(200);
      expect(second.body.refreshToken).not.toBe(first.refreshToken);

      // A stolen copy of the first token comes back: refused, and the new token dies with it.
      const replay = await request(app)
        .post('/api/v1/auth/refresh')
        .set(native)
        .send({ refreshToken: first.refreshToken });
      expect(replay.status).toBe(401);
      const after = await request(app)
        .post('/api/v1/auth/refresh')
        .set(native)
        .send({ refreshToken: second.body.refreshToken });
      expect(after.status).toBe(401);
      expect(
        await db.auditLog.count({ where: { action: 'auth.refresh_reuse' } }),
      ).toBeGreaterThanOrEqual(1);
    });

    it('keeps the web refresh token in an httpOnly cookie, never in the response body', async () => {
      const { app } = makeApp();
      await createUser('fay@example.com');
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('X-Dokyu-Client', 'web')
        .send({ email: 'fay@example.com', password: PASSWORD });
      expect(res.status).toBe(200);
      expect(res.body.refreshToken).toBeUndefined();
      const cookie = ([] as string[])
        .concat(res.headers['set-cookie'] ?? [])
        .find((c) => c.startsWith(`${REFRESH_COOKIE}=`));
      expect(cookie).toMatch(/HttpOnly/);
      expect(cookie).toMatch(/SameSite=Strict/);

      const refreshed = await request(app)
        .post('/api/v1/auth/refresh')
        .set('X-Dokyu-Client', 'web')
        .set('Cookie', cookie!.split(';')[0]!);
      expect(refreshed.status).toBe(200);
    });

    it('rejects auth calls without the client header (CSRF guard)', async () => {
      const { app } = makeApp();
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'a@example.com', password: 'x' });
      expect(res.status).toBe(400);
    });

    it('signs the device out on logout', async () => {
      const { app } = makeApp();
      await createUser('gab@example.com');
      const { refreshToken } = await login(app, 'gab@example.com');
      expect(
        (await request(app).post('/api/v1/auth/logout').set(native).send({ refreshToken })).status,
      ).toBe(204);
      expect(
        (await request(app).post('/api/v1/auth/refresh').set(native).send({ refreshToken })).status,
      ).toBe(401);
    });
  });

  describe('password reset', () => {
    it('answers the same for unknown emails and sends nothing', async () => {
      const { app, mailer } = makeApp();
      const res = await request(app)
        .post('/api/v1/auth/forgot')
        .set(native)
        .send({ email: 'ghost@example.com' });
      expect(res.status).toBe(202);
      expect(mailer.outbox).toHaveLength(0);
    });

    it('changes the password once, signs out every device and unlocks the account', async () => {
      const { app, mailer } = makeApp();
      await createUser('hana@example.com');
      const session = await login(app, 'hana@example.com');
      await request(app)
        .post('/api/v1/auth/forgot')
        .set(native)
        .send({ email: 'hana@example.com' });
      const token = lastLinkToken(mailer, 'hana@example.com');

      const newPassword = 'a-brand-new-password';
      expect(
        (
          await request(app)
            .post('/api/v1/auth/reset')
            .set(native)
            .send({ token, password: newPassword })
        ).status,
      ).toBe(200);
      expect(
        (
          await request(app)
            .post('/api/v1/auth/reset')
            .set(native)
            .send({ token, password: 'yet-another-pass' })
        ).status,
      ).toBe(400);

      expect(
        (
          await request(app)
            .post('/api/v1/auth/refresh')
            .set(native)
            .send({ refreshToken: session.refreshToken })
        ).status,
      ).toBe(401);
      expect((await login(app, 'hana@example.com')).res.status).toBe(401);
      expect((await login(app, 'hana@example.com', newPassword)).res.status).toBe(200);
    });
  });

  describe('roles and ownership', () => {
    it('keeps users out of Super Admin routes', async () => {
      const { app } = makeApp();
      await createUser('user@example.com');
      await createUser('owner@example.com', 'SUPER_ADMIN');
      const user = await login(app, 'user@example.com');
      const owner = await login(app, 'owner@example.com');

      expect((await request(app).get('/api/v1/super/audit')).status).toBe(401);
      expect(
        (
          await request(app)
            .get('/api/v1/super/audit')
            .set('Authorization', `Bearer ${user.accessToken}`)
        ).status,
      ).toBe(403);
      expect(
        (
          await request(app)
            .get('/api/v1/super/audit')
            .set('Authorization', `Bearer ${owner.accessToken}`)
        ).status,
      ).toBe(200);
    });

    it('rejects tampered and forged access tokens', async () => {
      const { app } = makeApp();
      await createUser('ivy@example.com');
      const { accessToken } = await login(app, 'ivy@example.com');
      const [head, body, sig] = accessToken.split('.');
      const claims = JSON.parse(Buffer.from(body!, 'base64url').toString());
      const promoted = Buffer.from(JSON.stringify({ ...claims, role: 'SUPER_ADMIN' })).toString(
        'base64url',
      );
      const tampered = `${head}.${promoted}.${sig}`;
      expect(
        (await request(app).get('/api/v1/super/audit').set('Authorization', `Bearer ${tampered}`))
          .status,
      ).toBe(401);

      const forged = await new SignJWT({ role: 'SUPER_ADMIN', sid: claims.sid })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(claims.sub)
        .setIssuer('dokyu-api')
        .setAudience('dokyu-app')
        .setExpirationTime('5m')
        .sign(new TextEncoder().encode('a-different-secret-somebody-guessed-000'));
      expect(
        (await request(app).get('/api/v1/super/audit').set('Authorization', `Bearer ${forged}`))
          .status,
      ).toBe(401);
    });

    it('does not let a user make themselves Super Admin through their profile', async () => {
      const { app } = makeApp();
      const user = await createUser('jo@example.com');
      const { accessToken } = await login(app, 'jo@example.com');
      const res = await request(app)
        .patch('/api/v1/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'SUPER_ADMIN' });
      expect(res.status).toBe(400);
      expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).role).toBe('USER');
    });

    it('saves onboarding answers to the profile', async () => {
      const { app } = makeApp();
      await createUser('kai@example.com');
      const { accessToken } = await login(app, 'kai@example.com');
      const res = await request(app)
        .patch('/api/v1/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          language: 'tl',
          province: 'Sulu',
          municipality: 'Jolo',
          goals: ['first-job'],
          onboarded: true,
        });
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        language: 'tl',
        province: 'Sulu',
        goals: ['first-job'],
        onboarded: true,
      });
      const bad = await request(app)
        .patch('/api/v1/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ province: 'Atlantis' });
      expect(bad.status).toBe(400);
    });

    it("lets a user sign out their own devices but not someone else's", async () => {
      const { app } = makeApp();
      await createUser('lea@example.com');
      await createUser('max@example.com');
      const lea = await login(app, 'lea@example.com');
      const max = await login(app, 'max@example.com');

      const maxSessions = await request(app)
        .get('/api/v1/me/sessions')
        .set('Authorization', `Bearer ${max.accessToken}`);
      const maxSessionId = maxSessions.body.data[0].id as string;
      expect(maxSessions.body.data[0].current).toBe(true);

      const attack = await request(app)
        .delete(`/api/v1/me/sessions/${maxSessionId}`)
        .set('Authorization', `Bearer ${lea.accessToken}`);
      expect(attack.status).toBe(404);
      expect(
        (
          await request(app)
            .post('/api/v1/auth/refresh')
            .set(native)
            .send({ refreshToken: max.refreshToken })
        ).status,
      ).toBe(200);

      const leaSessionId = (
        await request(app)
          .get('/api/v1/me/sessions')
          .set('Authorization', `Bearer ${lea.accessToken}`)
      ).body.data[0].id;
      expect(
        (
          await request(app)
            .delete(`/api/v1/me/sessions/${leaSessionId}`)
            .set('Authorization', `Bearer ${lea.accessToken}`)
        ).status,
      ).toBe(204);
      expect(
        (
          await request(app)
            .post('/api/v1/auth/refresh')
            .set(native)
            .send({ refreshToken: lea.refreshToken })
        ).status,
      ).toBe(401);
    });
  });
});
