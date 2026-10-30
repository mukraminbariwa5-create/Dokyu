import { Router } from 'express';
import { z } from 'zod';
import type { PrismaClient } from '@prisma/client';

const listQuery = z.object({
  q: z.string().trim().max(60).optional(),
  category: z.string().trim().max(40).optional(),
});

export function guidesRouter(db: PrismaClient) {
  const r = Router();

  r.get('/', async (req, res) => {
    const parsed = listQuery.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid query' });
    const { q, category } = parsed.data;
    const guides = await db.documentGuide.findMany({
      where: {
        published: true,
        ...(category ? { category } : {}),
        ...(q ? { OR: [{ titleEn: { contains: q, mode: 'insensitive' } }, { agency: { contains: q, mode: 'insensitive' } }] } : {}),
      },
      select: { slug: true, titleEn: true, agency: true, mono: true, category: true, fees: true, lastVerifiedAt: true },
      orderBy: { titleEn: 'asc' },
    });
    res.json({ data: guides });
  });

  r.get('/:slug', async (req, res) => {
    const slug = z.string().regex(/^[a-z0-9-]{2,60}$/).safeParse(req.params.slug);
    if (!slug.success) return res.status(400).json({ error: 'Invalid slug' });
    const guide = await db.documentGuide.findFirst({ where: { slug: slug.data, published: true } });
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json({ data: guide });
  });

  return r;
}
