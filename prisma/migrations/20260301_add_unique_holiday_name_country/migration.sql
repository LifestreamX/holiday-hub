-- Migration: add unique constraint/index for holidays by (name, countryCode)
-- Generated manually by assistant; run with your normal migration tooling.

-- Creates a unique index to ensure upserts based on (name, countryCode) are deterministic.
CREATE UNIQUE INDEX IF NOT EXISTS "holidays_name_country_unique" ON "holidays" ("name", "countryCode");

-- If you use Prisma migrations, run:
--   npx prisma migrate deploy
-- or for local development:
--   npx prisma migrate dev --name add-unique-holiday-name-country
