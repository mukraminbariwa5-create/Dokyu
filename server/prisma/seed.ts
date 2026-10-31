/**
 * Seeds verified content (docs/CONTENT.md) plus a demo user and the Super Admin.
 * Run: pnpm db:seed
 */
import { PrismaClient, type Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { GUIDES, HOLIDAYS, OFFICES, hoursText } from '@dokyu/shared';
import { hashPassword } from '../src/lib/passwords.js';

const db = new PrismaClient();
const DEMO_USER_EMAIL = 'demo@example.com';
const ADMIN_EMAIL = 'admin@example.com';

const AGENCIES: Record<string, { name: string; officialUrl: string }> = {
  PSA: { name: 'Philippine Statistics Authority', officialUrl: 'https://psa.gov.ph' },
  NBI: { name: 'National Bureau of Investigation', officialUrl: 'https://nbi.gov.ph' },
  DFA: { name: 'Department of Foreign Affairs', officialUrl: 'https://dfa.gov.ph' },
  PhilHealth: { name: 'PhilHealth', officialUrl: 'https://www.philhealth.gov.ph' },
  PNP: { name: 'Philippine National Police', officialUrl: 'https://pnpclearance.ph' },
  PHLPost: { name: 'Philippine Postal Corporation', officialUrl: 'https://phlpost.gov.ph' },
};

async function main() {
  for (const g of GUIDES) {
    const data = {
      category: g.category,
      mono: g.mono,
      titleEn: g.title.en,
      titleTl: g.title.tl,
      agency: g.agency.en,
      content: g as unknown as Prisma.InputJsonValue,
      ftjFree: g.firstTimeJobseekerFree,
      verified: g.verified,
      lastVerifiedAt: new Date(g.lastVerified),
    };
    await db.documentGuide.upsert({
      where: { slug: g.slug },
      create: { slug: g.slug, ...data },
      update: data,
    });
  }

  for (const [code, a] of Object.entries(AGENCIES)) {
    await db.agency.upsert({
      where: { code: code.toUpperCase() },
      create: { code: code.toUpperCase(), ...a },
      update: a,
    });
  }

  for (const o of OFFICES) {
    const agency = await db.agency.findUniqueOrThrow({ where: { code: o.agency.toUpperCase() } });
    const data = {
      agencyId: agency.id,
      branchName: o.name,
      address: o.address,
      province: o.province,
      municipality: o.municipality,
      contactNumber: o.phone ?? null,
      lat: o.lat,
      lng: o.lng,
      landmark: o.landmark?.en ?? null,
      hours: {
        weekly: o.hours,
        text: hoursText(o, 'en'),
        confirmed: o.hoursConfirmed,
      } as unknown as Prisma.InputJsonValue,
      notes: o.services.en,
      lastVerifiedAt: new Date(o.lastVerified),
      sourceUrl: o.source,
    };
    await db.office.upsert({
      where: { slug: o.slug },
      create: { slug: o.slug, ...data },
      update: data,
    });
  }

  // Holidays are replaced as a set so a corrected date never leaves a stale row behind.
  await db.holiday.deleteMany({ where: { scope: 'NATIONAL' } });
  await db.holiday.createMany({
    data: HOLIDAYS.map((h) => ({
      date: new Date(`${h.date}T00:00:00Z`),
      name: h.name.en,
      type:
        h.kind === 'regular'
          ? ('REGULAR' as const)
          : h.kind === 'special'
            ? ('SPECIAL_NON_WORKING' as const)
            : ('SPECIAL_WORKING' as const),
      scope: 'NATIONAL' as const,
      sourceUrl: h.source,
    })),
  });

  // Demo accounts (plan §10). The demo user's password is public on purpose so recruiters can try the app.
  // The admin password comes from SEED_ADMIN_PASSWORD, or a random one is printed once.
  const demoPassword = 'Dokyu-demo-2026';
  await db.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    create: {
      email: DEMO_USER_EMAIL,
      passwordHash: await hashPassword(demoPassword),
      fullName: 'Juan Dela Cruz (Demo)',
      province: 'Sulu',
      municipality: 'Jolo',
      goals: ['first-job', 'passport'],
      consentAt: new Date(),
      emailVerifiedAt: new Date(),
      onboardedAt: new Date(),
    },
    update: {},
  });
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || randomBytes(12).toString('base64url');
  const admin = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    await db.user.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash: await hashPassword(adminPassword),
        fullName: 'Dokyu Admin',
        role: 'SUPER_ADMIN',
        consentAt: new Date(),
        emailVerifiedAt: new Date(),
        onboardedAt: new Date(),
      },
    });
    if (!process.env.SEED_ADMIN_PASSWORD)
      console.log(`Super Admin ${ADMIN_EMAIL} password (shown once): ${adminPassword}`);
  }

  console.log(
    `Seeded ${GUIDES.length} guides, ${OFFICES.length} offices, ${HOLIDAYS.length} holidays, demo user ${DEMO_USER_EMAIL} and admin ${ADMIN_EMAIL}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
