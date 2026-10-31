import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';

/** Nationwide holidays from today on (plan §3.1 D). The app also ships the same list for offline use. */
export function holidaysRouter(db: PrismaClient) {
  const r = Router();
  r.get('/', async (_req, res) => {
    const today = new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);
    const rows = await db.holiday.findMany({
      where: { date: { gte: new Date(`${today}T00:00:00Z`) } },
      orderBy: { date: 'asc' },
    });
    res.json({
      data: rows.map((h) => ({
        date: h.date.toISOString().slice(0, 10),
        name: h.name,
        type: h.type,
        scope: h.scope,
        sourceUrl: h.sourceUrl,
      })),
    });
  });
  return r;
}
