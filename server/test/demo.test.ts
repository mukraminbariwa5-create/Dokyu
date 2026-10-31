/** The public demo account: reset at every sign-in, never locked, never deleted, visitors kept apart. */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { DEMO_EMAIL } from '@dokyu/shared';
import { PASSWORD, createUser, db, hasTestDb, login, makeApp, resetDb } from './helpers.js';

describe.skipIf(!hasTestDb)('demo account (database)', () => {
  beforeEach(resetDb);
  afterAll(() => db.$disconnect());

  it('puts the profile and My Docs back to the sample at every sign-in', async () => {
    const { app } = makeApp();
    await createUser(DEMO_EMAIL);
    const first = await login(app, DEMO_EMAIL);
    expect(first.res.body.user.demo).toBe(true);
    const auth = { Authorization: `Bearer ${first.accessToken}` };

    const sample = await request(app).get('/api/v1/me/docs').set(auth);
    expect(sample.body.data.docs.length).toBeGreaterThanOrEqual(5);
    expect(sample.body.data.people).toHaveLength(1);

    // A visitor changes things...
    await request(app).patch('/api/v1/me').set(auth).send({ fullName: 'Someone Else' });
    await request(app)
      .put('/api/v1/me/docs')
      .set(auth)
      .send({ baseVersion: sample.body.version, data: { people: [], docs: [], deleted: [] } });

    // ...and the next visitor gets the clean sample again.
    const next = await login(app, DEMO_EMAIL);
    expect(next.res.body.user.fullName).toBe('Juan Dela Cruz (Demo)');
    const again = await request(app)
      .get('/api/v1/me/docs')
      .set('Authorization', `Bearer ${next.accessToken}`);
    expect(again.body.data.docs.length).toBe(sample.body.data.docs.length);
  });

  it('is never locked by wrong passwords', async () => {
    const { app } = makeApp();
    await createUser(DEMO_EMAIL);
    for (let i = 0; i < 7; i++) {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('X-Dokyu-Client', 'native')
        .send({ email: DEMO_EMAIL, password: 'wrong-password-123' });
      expect(res.status).toBe(401);
    }
    expect((await login(app, DEMO_EMAIL)).res.status).toBe(200);
  });

  it("can't be deleted, can't sign out other visitors, and only lists this visitor's device", async () => {
    const { app } = makeApp();
    await createUser(DEMO_EMAIL);
    const visitorA = await login(app, DEMO_EMAIL);
    const visitorB = await login(app, DEMO_EMAIL);
    const authB = { Authorization: `Bearer ${visitorB.accessToken}` };

    const del = await request(app).delete('/api/v1/me').set(authB).send({ password: PASSWORD });
    expect(del.status).toBe(403);
    expect(await db.user.count({ where: { email: DEMO_EMAIL } })).toBe(1);

    const sessions = await request(app).get('/api/v1/me/sessions').set(authB);
    expect(sessions.body.data).toHaveLength(1);
    expect(sessions.body.data[0].current).toBe(true);

    const all = await db.refreshToken.findMany({ select: { familyId: true } });
    const otherId = all.map((r) => r.familyId).find((f) => f !== sessions.body.data[0].id);
    const kick = await request(app).delete(`/api/v1/me/sessions/${otherId}`).set(authB);
    expect(kick.status).toBe(403);
    expect(visitorA.res.status).toBe(200);
  });

  it('sends no password-reset email for the demo account', async () => {
    const { app, mailer } = makeApp();
    await createUser(DEMO_EMAIL);
    const res = await request(app)
      .post('/api/v1/auth/forgot')
      .set('X-Dokyu-Client', 'native')
      .send({ email: DEMO_EMAIL });
    expect(res.status).toBe(202);
    expect(mailer.outbox).toHaveLength(0);
  });
});
