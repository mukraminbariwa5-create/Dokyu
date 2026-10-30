-- Guides move to one checked JSON document (packages/shared/src/guides.ts: guideSchema).
-- Existing rows get placeholder content here; `pnpm db:seed` fills in the real guides.
ALTER TABLE "DocumentGuide"
  ADD COLUMN "content" JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "DocumentGuide" SET "titleTl" = "titleEn" WHERE "titleTl" IS NULL;
ALTER TABLE "DocumentGuide"
  ALTER COLUMN "content" DROP DEFAULT,
  ALTER COLUMN "updatedAt" DROP DEFAULT,
  ALTER COLUMN "titleTl" SET NOT NULL,
  DROP COLUMN "fees",
  DROP COLUMN "officialUrl",
  DROP COLUMN "requirements",
  DROP COLUMN "sources",
  DROP COLUMN "steps",
  DROP COLUMN "summaryEn",
  DROP COLUMN "summaryTl",
  DROP COLUMN "validity",
  DROP COLUMN "warnings";
