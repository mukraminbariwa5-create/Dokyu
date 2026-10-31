/** Privacy promise (plan §5.4): download my data, delete my account, and the holidays list. */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { HOLIDAYS } from '@dokyu/shared';
import { PASSWORD, createUser, db, hasTestDb, login, makeApp, resetDb } from './helpers.js';

describe.skipIf(!hasTestDb)('privacy and holidays (database)', () => {
  beforeEach(resetDb);
  afterAll(() => db.$disconnect());

  it('exports only the signed-in user’s data as a downloadable file', async () => {
    const { app } = makeApp();
    await createUser('ana@example.com');
    await createUser('ben@example.com');
    const { accessToken } = await login(app, 'ana@example.com');
    const res = await request(app)
      .get('/api/v1/me/export')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('dokyu-my-data.json');
    expect(res.body.profile.email).toBe('ana@example.com');
    expect(JSON.stringify(res.body)).not.toContain('ben@example.com');
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('needs the right password to delete, then removes the account and its sessions', async () => {
    const { app } = makeApp();
    const user = await createUser('ana@example.com');
    const { accessToken, refreshToken } = await login(app, 'ana@example.com');
    const auth = { Authorization: `Bearer ${accessToken}` };

    const wrong = await request(app)
      .delete('/api/v1/me')
      .set(auth)
      .send({ password: 'nope-nope-nope' });
    expect(wrong.status).toBe(403);
    expect(await db.user.count({ where: { id: user.id } })).toBe(1);

    const ok = await request(app).delete('/api/v1/me').set(auth).send({ password: PASSWORD });
    expect(ok.status).toBe(204);
    expect(await db.user.count({ where: { id: user.id } })).toBe(0);
    expect(await db.refreshToken.count({ where: { userId: user.id } })).toBe(0);

    const refresh = await request(app)
      .post('/api/v1/auth/refresh')
      .set('X-Dokyu-Client', 'native')
      .send({ refreshToken });
    expect(refresh.status).toBe(401);
    const log = await db.auditLog.findFirst({ where: { action: 'account.deleted' } });
    expect(log?.entityId).toBe(user.id);
    expect(JSON.stringify(log)).not.toContain('ana@example.com');
  });

  it('refuses export and delete without a session', async () => {
    const { app } = makeApp();
    expect((await request(app).get('/api/v1/me/export')).status).toBe(401);
    expect((await request(app).delete('/api/v1/me').send({ password: PASSWORD })).status).toBe(401);
  });

  it('lists upcoming holidays in date order', async () => {
    const { app } = makeApp();
    await db.holiday.deleteMany();
    await db.holiday.createMany({
      data: HOLIDAYS.map((h) => ({
        date: new Date(`${h.date}T00:00:00Z`),
        name: h.name.en,
        type:
          h.kind === 'regular'
            ? 'REGULAR'
            : h.kind === 'special'
              ? 'SPECIAL_NON_WORKING'
              : 'SPECIAL_WORKING',
        scope: 'NATIONAL',
        sourceUrl: h.source,
      })),
    });
    const res = await request(app).get('/api/v1/holidays');
    expect(res.status).toBe(200);
    const dates = res.body.data.map((h: { date: string }) => h.date);
    expect(dates).toEqual([...dates].sort());
    expect(
      dates.every(
        (d: string) => d >= new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10),
      ),
    ).toBe(true);
  });
});
