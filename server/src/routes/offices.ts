import { Router } from 'express';
import { z } from 'zod';
import type { PrismaClient } from '@prisma/client';
import { isValidCoordinate, sortByDistance } from '../lib/geo.js';

const query = z
  .object({
    agency: z.string().trim().max(20).optional(),
    province: z.string().trim().max(60).optional(),
    municipality: z.string().trim().max(60).optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
  })
  .refine((v) => (v.lat === undefined) === (v.lng === undefined), 'lat and lng go together');

export function officesRouter(db: PrismaClient) {
  const r = Router();

  r.get('/', async (req, res) => {
    const parsed = query.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid query' });
    const { agency, province, municipality, lat, lng } = parsed.data;
    if (lat !== undefined && lng !== undefined && !isValidCoordinate(lat, lng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    const offices = await db.office.findMany({
      where: {
        active: true,
        ...(agency ? { agency: { code: agency.toUpperCase() } } : {}),
        ...(province ? { province } : {}),
        ...(municipality ? { municipality } : {}),
      },
      include: { agency: { select: { code: true, name: true } } },
    });
    // Coordinates are used only here and are never stored or logged.
    const data = lat !== undefined && lng !== undefined ? sortByDistance(offices, { lat, lng }) : offices;
    res.json({ data });
  });

  return r;
}
