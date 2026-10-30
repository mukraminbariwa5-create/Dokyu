/** /api/v1/super — owner-only tools (plan §2). Phase 3 adds the guide, office and holiday editors here. */
import { Router } from 'express';
import { z } from 'zod';
import type { PrismaClient } from '@prisma/client';
import type { Jwt } from '../lib/jwt.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export function superRouter(db: PrismaClient, jwt: Jwt) {
  const r = Router();
  r.use(requireAuth(jwt), requireRole('SUPER_ADMIN'));

  r.get('/audit', async (req, res) => {
    const limit = z.coerce.number().int().min(1).max(200).catch(50).parse(req.query.limit);
    const data = await db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
    res.json({ data });
  });

  return r;
}
