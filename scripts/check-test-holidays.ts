#!/usr/bin/env tsx
/**
 * Quick script to check what dates are in the DB for test holidays
 */

import { prisma } from '../lib/prisma';

async function main() {
  const testHolidays = await prisma.holiday.findMany({
    where: {
      name: {
        contains: 'Test Holiday',
      },
    },
    orderBy: {
      month: 'asc',
    },
  });

  console.log('Test Holidays in Database:\n');
  for (const h of testHolidays) {
    console.log(`${h.name}:`);
    console.log(`  ID: ${h.id}`);
    console.log(`  Rule: ${h.ruleType}`);
    console.log(`  Month: ${h.month}, Day: ${h.day}`);
    console.log(`  Country: ${h.countryCode}`);
    console.log();
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
