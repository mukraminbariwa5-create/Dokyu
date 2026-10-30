/**
 * /api/v1/guides — public document guides (no sign-in needed, plan §2).
 * Every guide is checked against the shared schema before it is sent, so the app never gets a broken guide.
 */
import { Router } from 'express';
import { z } from 'zod';
import type { PrismaClient } from '@prisma/client';
import { GUIDE_CATEGORIES, guideSchema, type Guide } from '@dokyu/shared';

const listQuery = z.object({
  q: z.string().trim().max(60).optional(),
  category: z.enum(GUIDE_CATEGORIES).optional(),
});

function toGuide(content: unknown): Guide | null {
  const parsed = guideSchema.safeParse(content);
  return parsed.success ? parsed.data : null;
}

export function guidesRouter(db: PrismaClient) {
  const r = Router();

  /** All published guides with their full content (small enough to cache whole on the phone for offline use). */
  r.get('/', async (req, res) => {
    const parsed = listQuery.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query' });
      return;
    }
    const { q, category } = parsed.data;
    const rows = await db.documentGuide.findMany({
      where: {
        published: true,
        ...(category ? { category } : {}),
        ...(q
          ? {
              OR: [
                { titleEn: { contains: q, mode: 'insensitive' } },
                { titleTl: { contains: q, mode: 'insensitive' } },
                { agency: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: { content: true },
      orderBy: { titleEn: 'asc' },
    });
    const data = rows.map((r) => toGuide(r.content)).filter((g): g is Guide => g !== null);
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ data });
  });

  r.get('/:slug', async (req, res) => {
    const slug = z
      .string()
      .regex(/^[a-z0-9-]{2,60}$/)
      .safeParse(req.params.slug);
    if (!slug.success) {
      res.status(400).json({ error: 'Invalid slug' });
      return;
    }
    const row = await db.documentGuide.findFirst({
      where: { slug: slug.data, published: true },
      select: { content: true },
    });
    const guide = row ? toGuide(row.content) : null;
    if (!guide) {
      res.status(404).json({ error: 'Guide not found' });
      return;
    }
    res.json({ data: guide });
  });

  return r;
}
