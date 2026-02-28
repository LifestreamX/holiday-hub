// Server-side script to sync holidays directly to database
// Usage: node scripts/sync-holidays.js [countryCode] [year]

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const NAGER_API_BASE = 'https://date.nager.at/api/v3';

async function fetchPublicHolidays(year, countryCode) {
  const response = await fetch(
    `${NAGER_API_BASE}/PublicHolidays/${year}/${countryCode}`,
  );

  if (!response.ok) {
    throw new Error(
      `Nager.Date API error: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

function convertNagerHolidayToDbFormat(nagerHoliday) {
  // Parse date parts directly from the YYYY-MM-DD string to avoid timezone issues
  const [year, monthStr, dayStr] = nagerHoliday.date.split('-');
  const month = parseInt(monthStr, 10); // 1-12
  const day = parseInt(dayStr, 10); // 1-31

  let category = 'public';
  if (nagerHoliday.types.includes('Public')) {
    category = 'federal';
  } else if (nagerHoliday.types.includes('Bank')) {
    category = 'bank';
  } else if (nagerHoliday.types.includes('School')) {
    category = 'school';
  } else if (nagerHoliday.types.includes('Authorities')) {
    category = 'government';
  } else if (nagerHoliday.types.includes('Optional')) {
    category = 'optional';
  } else if (nagerHoliday.types.includes('Observance')) {
    category = 'observance';
  }

  // Determine if holiday is truly calculated (like Easter, Good Friday)
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

async function syncHolidays(countryCode, year) {
  try {
    console.log(
      `\nSyncing holidays for ${countryCode} (${year}) from Nager.Date...`,
    );

    const nagerHolidays = await fetchPublicHolidays(year, countryCode);

    if (!nagerHolidays || nagerHolidays.length === 0) {
      console.log('No holidays found for this country');
      return;
    }

    console.log(`Found ${nagerHolidays.length} holidays to sync`);

    let created = 0;
    let updated = 0;

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
        console.log(`  ✓ Updated: ${holidayData.name}`);
      } else {
        await prisma.holiday.create({
          data: holidayData,
        });
        created++;
        console.log(`  ✓ Created: ${holidayData.name}`);
      }
    }

    console.log(
      `\n✓ Sync complete: ${created} created, ${updated} updated (${nagerHolidays.length} total)`,
    );
  } catch (error) {
    console.error('Error syncing holidays:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const countryCode = process.argv[2] || 'US';
const year = parseInt(process.argv[3]) || new Date().getFullYear();

syncHolidays(countryCode, year);
