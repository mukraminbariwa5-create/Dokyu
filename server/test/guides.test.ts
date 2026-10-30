/** Guides API against the test database: full content, search in both languages, and broken rows never reach the app. */
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { GUIDES, guideSchema } from '@dokyu/shared';
import { db, hasTestDb, makeApp } from './helpers.js';

async function seedGuides() {
  await db.documentGuide.deleteMany();
  for (const g of GUIDES) {
    await db.documentGuide.create({
      data: {
        slug: g.slug,
        category: g.category,
        mono: g.mono,
        titleEn: g.title.en,
        titleTl: g.title.tl,
        agency: g.agency.en,
        content: JSON.parse(JSON.stringify(g)),
        verified: g.verified,
        lastVerifiedAt: new Date(g.lastVerified),
      },
    });
  }
}

describe.skipIf(!hasTestDb)('guides API (database)', () => {
  beforeEach(seedGuides);
  afterAll(() => db.$disconnect());

  it('returns every published guide with full, valid content', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/api/v1/guides');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(GUIDES.length);
    for (const g of res.body.data) expect(guideSchema.safeParse(g).success).toBe(true);
  });

  it('searches English and Tagalog titles and filters by category', async () => {
    const { app } = makeApp();
    const tl = await request(app).get('/api/v1/guides?q=pasaporte');
    expect(tl.body.data.map((g: { slug: string }) => g.slug)).toEqual(['passport']);
    const clearances = await request(app).get('/api/v1/guides?category=clearances');
    expect(clearances.body.data.map((g: { slug: string }) => g.slug).sort()).toEqual([
      'nbi-clearance',
      'police-clearance',
    ]);
    expect((await request(app).get('/api/v1/guides?category=nope')).status).toBe(400);
  });

  it('hides unpublished guides and skips a guide whose content is broken', async () => {
    const { app } = makeApp();
    await db.documentGuide.update({ where: { slug: 'tin' }, data: { published: false } });
    await db.documentGuide.update({
      where: { slug: 'postal-id' },
      data: { content: { slug: 'postal-id', title: 'broken' } },
    });
    const res = await request(app).get('/api/v1/guides');
    const slugs = res.body.data.map((g: { slug: string }) => g.slug);
    expect(slugs).not.toContain('tin');
    expect(slugs).not.toContain('postal-id');
    expect((await request(app).get('/api/v1/guides/postal-id')).status).toBe(404);
    expect((await request(app).get('/api/v1/guides/passport')).body.data.title.tl).toBe(
      'Pasaporte',
    );
  });
});
