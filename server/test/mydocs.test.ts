/** My Docs sync: each account has one copy, saved with a version check so phones cannot overwrite each other. */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PASSWORD, createUser, db, hasTestDb, login, makeApp, resetDb } from './helpers.js';

const doc = (id: string, status = 'need') => ({
  id,
  personId: 'me',
  guide: 'nbi-clearance',
  status,
  updatedAt: '2026-10-31T00:00:00.000Z',
});
const copy = (...ids: string[]) => ({ people: [], docs: ids.map((id) => doc(id)), deleted: [] });

describe.skipIf(!hasTestDb)('My Docs sync (database)', () => {
  beforeEach(resetDb);
  afterAll(() => db.$disconnect());

  async function signedIn(email = 'ana@example.com') {
    const { app } = makeApp();
    await createUser(email);
    const { accessToken } = await login(app, email);
    return { app, auth: { Authorization: `Bearer ${accessToken}` } };
  }

  it('needs a signed-in user', async () => {
    const { app } = makeApp();
    expect((await request(app).get('/api/v1/me/docs')).status).toBe(401);
    expect((await request(app).put('/api/v1/me/docs').send({})).status).toBe(401);
  });

  it('starts empty, saves, and returns the saved copy', async () => {
    const { app, auth } = await signedIn();
    const empty = await request(app).get('/api/v1/me/docs').set(auth);
    expect(empty.body).toEqual({ data: { people: [], docs: [], deleted: [] }, version: 0 });

    const put = await request(app)
      .put('/api/v1/me/docs')
      .set(auth)
      .send({ baseVersion: 0, data: copy('a') });
    expect(put.status).toBe(200);
    expect(put.body.version).toBe(1);

    const got = await request(app).get('/api/v1/me/docs').set(auth);
    expect(got.body.version).toBe(1);
    expect(got.body.data.docs.map((d: { id: string }) => d.id)).toEqual(['a']);
  });

  it('answers 409 with the newer copy when another phone saved first', async () => {
    const { app, auth } = await signedIn();
    await request(app)
      .put('/api/v1/me/docs')
      .set(auth)
      .send({ baseVersion: 0, data: copy('a') });
    await request(app)
      .put('/api/v1/me/docs')
      .set(auth)
      .send({ baseVersion: 1, data: copy('a', 'b') });

    // A phone that last saw version 1 tries to save: refused, and told about version 2.
    const stale = await request(app)
      .put('/api/v1/me/docs')
      .set(auth)
      .send({ baseVersion: 1, data: copy('c') });
    expect(stale.status).toBe(409);
    expect(stale.body.version).toBe(2);
    expect(stale.body.data.docs).toHaveLength(2);

    // Two phones both creating the first copy: one wins, the other gets 409.
    const other = await signedIn('ben@example.com');
    const [x, y] = await Promise.all([
      request(other.app)
        .put('/api/v1/me/docs')
        .set(other.auth)
        .send({ baseVersion: 0, data: copy('x') }),
      request(other.app)
        .put('/api/v1/me/docs')
        .set(other.auth)
        .send({ baseVersion: 0, data: copy('y') }),
    ]);
    expect([x.status, y.status].sort()).toEqual([200, 409]);
  });

  it('keeps each account’s copy private', async () => {
    const ana = await signedIn('ana@example.com');
    await request(ana.app)
      .put('/api/v1/me/docs')
      .set(ana.auth)
      .send({ baseVersion: 0, data: copy('secret') });
    const { accessToken } = await login(ana.app, (await createUser('ben@example.com')).email);
    const ben = await request(ana.app)
      .get('/api/v1/me/docs')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(ben.body.version).toBe(0);
    expect(JSON.stringify(ben.body)).not.toContain('secret');
  });

  it('rejects bad data and strips phone-only fields', async () => {
    const { app, auth } = await signedIn();
    const bad = await request(app)
      .put('/api/v1/me/docs')
      .set(auth)
      .send({ baseVersion: 0, data: { people: [], docs: [{ ...doc('a'), status: 'lost' }] } });
    expect(bad.status).toBe(400);

    await request(app)
      .put('/api/v1/me/docs')
      .set(auth)
      .send({ baseVersion: 0, data: { people: [], docs: [{ ...doc('a'), reminderIds: ['r1'] }] } });
    const got = await request(app).get('/api/v1/me/docs').set(auth);
    expect(got.body.data.docs[0]).not.toHaveProperty('reminderIds');
  });

  it('is in the data download, and deleted with the account', async () => {
    const { app, auth } = await signedIn();
    await request(app)
      .put('/api/v1/me/docs')
      .set(auth)
      .send({ baseVersion: 0, data: copy('a') });
    const exported = await request(app).get('/api/v1/me/export').set(auth);
    expect(exported.body.myDocs.docs).toHaveLength(1);

    await request(app).delete('/api/v1/me').set(auth).send({ password: PASSWORD });
    expect(await db.myDocsStore.count()).toBe(0);
  });
});
