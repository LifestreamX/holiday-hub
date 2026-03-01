#!/usr/bin/env node
/*
  scripts/sync-all-2026.js
  Fetch PublicHolidays for 2026 for all countries listed by Nager.Date and upsert into DB.
  Usage: node scripts/sync-all-2026.js
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NAGER_API_BASE = 'https://date.nager.at/api/v3';
const YEAR = 2026;
const REQUEST_DELAY_MS = parseInt(process.env.REQUEST_DELAY_MS || '200', 10);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${url}`);
  return res.json();
}

async function fetchCountries() {
  return fetchJson(`${NAGER_API_BASE}/AvailableCountries`);
}
async function fetchHolidays(year, countryCode) {
  return fetchJson(`${NAGER_API_BASE}/PublicHolidays/${year}/${countryCode}`);
}

function convert(nager) {
  const [y, mS, dS] = nager.date.split('-');
  const m = parseInt(mS, 10);
  const d = parseInt(dS, 10);
  const types = Array.isArray(nager.types) ? nager.types : [];
  let category = 'public';
  if (types.includes('Public')) category = 'federal';
  else if (types.includes('Bank')) category = 'bank';
  else if (types.includes('School')) category = 'school';
  else if (types.includes('Authorities')) category = 'government';
  else if (types.includes('Optional')) category = 'optional';
  else if (types.includes('Observance')) category = 'observance';
  const calculated = [
    'easter',
    'good friday',
    'mardi gras',
    'ash wednesday',
    'ascension',
    'pentecost',
    'corpus christi',
    'palm sunday',
  ];
  const isCalculated = calculated.some((c) =>
    nager.name.toLowerCase().includes(c),
  );
  return {
    name: nager.name,
    description: nager.localName || nager.name,
    category,
    ruleType: isCalculated ? 'calculated' : 'fixed',
    month: isCalculated ? null : m,
    day: isCalculated ? null : d,
    weekday: null,
    nth: null,
    countryCode: nager.countryCode,
  };
}

async function main() {
  console.info(`Starting all-countries sync for ${YEAR}`);
  const countries = await fetchCountries();
  console.info(`Found ${countries.length} countries`);

  let totalCreated = 0;
  let totalUpdated = 0;

  for (const c of countries) {
    const cc = c.countryCode;
    try {
      const holidays = await fetchHolidays(YEAR, cc);
      if (!Array.isArray(holidays) || holidays.length === 0) {
        console.info(`${cc}: no holidays`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      let created = 0;
      let updated = 0;
      for (const nh of holidays) {
        const data = convert(nh);
        const existing = await prisma.holiday.findFirst({
          where: { name: data.name, countryCode: data.countryCode },
        });
        if (existing) {
          await prisma.holiday.update({ where: { id: existing.id }, data });
          updated++;
        } else {
          await prisma.holiday.create({ data });
          created++;
        }
      }

      totalCreated += created;
      totalUpdated += updated;
      console.info(`${cc}: +${created} / ~${updated}`);
    } catch (err) {
      console.warn(`${cc} failed: ${err.message || err}`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  console.info(
    `Sync complete — created: ${totalCreated}, updated: ${totalUpdated}`,
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal:', err);
  prisma.$disconnect().finally(() => process.exit(1));
});
