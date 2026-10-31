/**
 * The public demo account (demo@example.com). Its password is public so anyone can try signing in, which
 * means it is shared: every sign-in puts it back to a clean profile and a sample My Docs, so one visitor's
 * changes never greet the next one. Dates are relative to today (Manila), so the sample always shows
 * an upcoming appointment, a document ready to claim and one expiring soon.
 */
import type { PrismaClient, Prisma } from '@prisma/client';
import { DEMO_EMAIL, manilaTime, type MyDocsData } from '@dokyu/shared';

export const isDemo = (email: string) => email === DEMO_EMAIL;

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function demoDocs(now = new Date()): MyDocsData {
  const today = manilaTime(now).iso;
  const at = now.toISOString();
  return {
    people: [{ id: 'demo-ana', name: 'Ana Dela Cruz', relation: 'child', updatedAt: at }],
    docs: [
      {
        id: 'demo-nbi',
        personId: 'me',
        guide: 'nbi-clearance',
        status: 'applied',
        appointmentDate: addDays(today, 3),
        appointmentTime: '09:00',
        appointmentPlace: 'NBI Western Mindanao Regional Office, Zamboanga City',
        referenceNo: 'NBI-DEMO-0142',
        updatedAt: at,
      },
      {
        id: 'demo-police',
        personId: 'me',
        guide: 'police-clearance',
        status: 'ready',
        updatedAt: at,
      },
      {
        id: 'demo-postal',
        personId: 'me',
        guide: 'postal-id',
        status: 'have',
        expires: addDays(today, 40),
        updatedAt: at,
      },
      {
        id: 'demo-psa',
        personId: 'me',
        guide: 'psa-birth-certificate',
        status: 'have',
        notes: 'Two copies in the blue folder.',
        updatedAt: at,
      },
      { id: 'demo-passport', personId: 'me', guide: 'passport', status: 'need', updatedAt: at },
      {
        id: 'demo-ana-nid',
        personId: 'demo-ana',
        guide: 'national-id',
        status: 'preparing',
        updatedAt: at,
      },
    ],
    deleted: [],
  };
}

/** Puts the demo account back to its starting state. Language and text size are left to each visitor. */
export async function resetDemo(db: PrismaClient, userId: string) {
  const data = demoDocs() as unknown as Prisma.InputJsonValue;
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        fullName: 'Juan Dela Cruz (Demo)',
        province: 'Sulu',
        municipality: 'Jolo',
        goals: ['first-job', 'passport'],
        failedLogins: 0,
        lockedUntil: null,
      },
    }),
    db.myDocsStore.upsert({
      where: { userId },
      create: { userId, data, version: 1 },
      update: { data, version: { increment: 1 } },
    }),
  ]);
}
