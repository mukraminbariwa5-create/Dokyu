/**
 * /api/v1/me — the signed-in user's own profile and devices. Every query is scoped to req.auth.sub,
 * so one user can never read or change another user's data (ownership checks, plan §5.4).
 */
import { Router } from 'express';
import { z } from 'zod';
import type { PrismaClient } from '@prisma/client';
import { profileUpdateSchema } from '@dokyu/shared';
import type { Jwt } from '../lib/jwt.js';
import { validate } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { audit } from '../services/audit.js';
import { listSessions, toPublicUser } from '../services/sessions.js';

export function meRouter(db: PrismaClient, jwt: Jwt) {
  const r = Router();
  r.use(requireAuth(jwt));

  r.get('/', async (req, res) => {
    const user = await db.user.findUnique({ where: { id: req.auth!.sub } });
    if (!user || user.deletedAt) {
      res.status(401).json({ error: 'Please sign in again' });
      return;
    }
    res.json({ data: toPublicUser(user) });
  });

  r.patch('/', async (req, res) => {
    const input = validate(profileUpdateSchema, req.body, res);
    if (!input) return;
    const { onboarded, ...fields } = input;
    const current = await db.user.findUnique({ where: { id: req.auth!.sub } });
    if (!current || current.deletedAt) {
      res.status(401).json({ error: 'Please sign in again' });
      return;
    }
    const user = await db.user.update({
      where: { id: current.id },
      data: {
        ...fields,
        ...(onboarded && !current.onboardedAt ? { onboardedAt: new Date() } : {}),
      },
    });
    res.json({ data: toPublicUser(user) });
  });

  /** Devices where this account is signed in. */
  r.get('/sessions', async (req, res) => {
    res.json({ data: await listSessions(db, req.auth!.sub, req.auth!.sid) });
  });

  /** Sign out one device. Only the owner's sessions match, so another user's id answers 404. */
  r.delete('/sessions/:id', async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    const ended = await db.refreshToken.updateMany({
      where: { familyId: id.data, userId: req.auth!.sub, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (ended.count === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    await audit(db, {
      actorId: req.auth!.sub,
      action: 'auth.session_revoked',
      entity: 'User',
      entityId: req.auth!.sub,
      ip: req.ip,
    });
    res.status(204).end();
  });

  return r;
}
