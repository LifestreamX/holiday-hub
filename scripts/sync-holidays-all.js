// Bulk sync holidays for all countries using Nager.Date
// Usage: node scripts/sync-holidays-all.js [year]

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const fs = require('fs');

const NAGER_API_BASE = 'https://date.nager.at/api/v3';
const prisma = new PrismaClient();

async function fetchAvailableCountries() {
  const response = await fetch(`${NAGER_API_BASE}/AvailableCountries`);
  if (!response.ok) throw new Error('Failed to fetch country list');
  return await response.json();
}

async function fetchPublicHolidays(year, countryCode) {
  const response = await fetch(
    `${NAGER_API_BASE}/PublicHolidays/${year}/${countryCode}`,
  );
  if (!response.ok) return [];
  return await response.json();
}

function convertNagerHolidayToDbFormat(nagerHoliday) {
  const [year, monthStr, dayStr] = nagerHoliday.date.split('-');
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  let category = 'public';
  if (nagerHoliday.types.includes('Public')) category = 'federal';
  else if (nagerHoliday.types.includes('Bank')) category = 'bank';
  else if (nagerHoliday.types.includes('School')) category = 'school';
  else if (nagerHoliday.types.includes('Authorities')) category = 'government';
  else if (nagerHoliday.types.includes('Optional')) category = 'optional';
  else if (nagerHoliday.types.includes('Observance')) category = 'observance';
  const calculatedHolidays = [
    'easter',
    'good friday',
    'mardi gras',
    'ash wednesday',
    'ascension',
    'pentecost',
    'corpus christi',
    'palm sunday',
  ];
  const isCalculated = calculatedHolidays.some((calc) =>
    nagerHoliday.name.toLowerCase().includes(calc),
  );
  return {
    name: nagerHoliday.name,
    description: nagerHoliday.localName || nagerHoliday.name,
    category,
    ruleType: isCalculated ? 'calculated' : 'fixed',
    month: isCalculated ? null : month,
    day: isCalculated ? null : day,
    weekday: null,
    nth: null,
    countryCode: nagerHoliday.countryCode,
  };
}

async function syncAllCountries(year) {
  const countries = await fetchAvailableCountries();
  let totalCreated = 0,
    totalUpdated = 0,
    totalHolidays = 0;
  for (const { countryCode, name } of countries) {
    try {
      const nagerHolidays = await fetchPublicHolidays(year, countryCode);
      if (!nagerHolidays.length) continue;
      let created = 0,
        updated = 0;
      for (const nagerHoliday of nagerHolidays) {
        const holidayData = convertNagerHolidayToDbFormat(nagerHoliday);
        const existingHoliday = await prisma.holiday.findFirst({
          where: {
            name: holidayData.name,
            countryCode: holidayData.countryCode,
          },
        });
        if (existingHoliday) {
          await prisma.holiday.update({
            where: { id: existingHoliday.id },
            data: holidayData,
          });
          updated++;
        } else {
          await prisma.holiday.create({ data: holidayData });
          created++;
        }
      }
      totalCreated += created;
      totalUpdated += updated;
      totalHolidays += nagerHolidays.length;
      console.log(
        `✓ ${countryCode} (${name}): ${created} created, ${updated} updated, ${nagerHolidays.length} total`,
      );
    } catch (err) {
      console.warn(`Failed to sync ${countryCode}: ${err.message}`);
    }
  }
  console.log(
    `\n✓ All countries sync complete: ${totalCreated} created, ${totalUpdated} updated, ${totalHolidays} holidays total`,
  );
  await prisma.$disconnect();
}

const year = parseInt(process.argv[2]) || new Date().getFullYear();
syncAllCountries(year);
