/**
 * Seeds verified content (docs/CONTENT.md) and the clearly-labelled demo barangay.
 * Run: pnpm db:seed
 */
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { DEMO_BARANGAY, DEMO_BARANGAY_DOCS, GUIDES, OFFICES } from '@dokyu/shared';

const db = new PrismaClient();

const AGENCIES: Record<string, { name: string; officialUrl: string }> = {
  PSA: { name: 'Philippine Statistics Authority', officialUrl: 'https://psa.gov.ph' },
  NBI: { name: 'National Bureau of Investigation', officialUrl: 'https://nbi.gov.ph' },
  DFA: { name: 'Department of Foreign Affairs', officialUrl: 'https://dfa.gov.ph' },
  PhilHealth: { name: 'PhilHealth', officialUrl: 'https://www.philhealth.gov.ph' },
};

async function main() {
  for (const g of GUIDES) {
    const data = {
      category: g.category,
      mono: g.mono,
      titleEn: g.title,
      agency: g.agency,
      officialUrl: g.officialUrl || null,
      fees: g.fees as object[],
      validity: g.validity,
      requirements: g.requirements,
      steps: g.steps,
      warnings: g.warnings,
      sources: g.sources,
      ftjFree: g.firstTimeJobseekerFree,
      verified: g.verified,
      lastVerifiedAt: new Date(g.lastVerified),
    };
    await db.documentGuide.upsert({ where: { slug: g.slug }, create: { slug: g.slug, ...data }, update: data });
  }

  for (const [code, a] of Object.entries(AGENCIES)) {
    await db.agency.upsert({ where: { code: code.toUpperCase() }, create: { code: code.toUpperCase(), ...a }, update: a });
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
      hours: { text: o.hours, confirmed: o.hoursConfirmed },
      notes: o.services.join(' · '),
      lastVerifiedAt: new Date('2026-10-30'),
      sourceUrl: o.source,
    };
    await db.office.upsert({ where: { slug: o.slug }, create: { slug: o.slug, ...data }, update: data });
  }

  const brgy = await db.barangay.upsert({
    where: { slug: DEMO_BARANGAY.slug },
    create: {
      slug: DEMO_BARANGAY.slug,
      name: DEMO_BARANGAY.name,
      municipality: DEMO_BARANGAY.municipality,
      province: DEMO_BARANGAY.province,
      status: 'ACTIVE',
      isDemo: true,
      inviteCode: randomBytes(6).toString('hex'),
      officeHours: { text: DEMO_BARANGAY.hours },
    },
    update: {},
  });

  for (const d of DEMO_BARANGAY_DOCS) {
    const data = { name: d.name, fee: d.fee, processing: d.processing, requirements: d.requirements, legalBasis: d.legalBasis ?? null };
    await db.brgyDocumentType.upsert({
      where: { barangayId_code: { barangayId: brgy.id, code: d.code } },
      create: { barangayId: brgy.id, code: d.code, ...data },
      update: data,
    });
  }

  console.log(`Seeded ${GUIDES.length} guides, ${OFFICES.length} offices, demo barangay with ${DEMO_BARANGAY_DOCS.length} documents.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
