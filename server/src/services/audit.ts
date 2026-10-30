import type { Prisma, PrismaClient } from '@prisma/client';

/** Writes one audit-log row (plan §3.1 H.5). Never pass passwords, tokens or coordinates in `meta`. */
export async function audit(
  db: PrismaClient,
  entry: {
    actorId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    meta?: Prisma.InputJsonValue;
    ip?: string;
  },
): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      meta: entry.meta,
      ip: entry.ip,
    },
  });
}
