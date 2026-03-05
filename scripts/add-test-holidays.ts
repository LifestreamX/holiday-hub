#!/usr/bin/env tsx
/**
 * Script to add test holidays at specific offsets for testing reminders.
 * Creates holidays for:
 * - Today (day-of testing)
 * - Tomorrow (1 day before testing)
 * - 7 days from now (7 days before testing)
 * - 30 days from now (30 days before testing)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding test holidays for offset testing...\n');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const testHolidays = [
    {
      name: 'Test Holiday - Today',
      description: 'Test holiday for day-of (offset 0) reminder testing',
      offset: 0,
    },
    {
      name: 'Test Holiday - Tomorrow',
      description: 'Test holiday for 1-day-before (offset 1) reminder testing',
      offset: 1,
    },
    {
      name: 'Test Holiday - 1 Week',
      description: 'Test holiday for 1-week-before (offset 7) reminder testing',
      offset: 7,
    },
    {
      name: 'Test Holiday - 1 Month',
      description:
        'Test holiday for 1-month-before (offset 30) reminder testing',
      offset: 30,
    },
  ];

  for (const testHol of testHolidays) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + testHol.offset);

    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    console.log(
      `Creating ${testHol.name} for ${month}/${day}/${targetDate.getFullYear()}`,
    );

    await prisma.holiday.upsert({
      where: {
        name_countryCode: {
          name: testHol.name,
          countryCode: 'US',
        },
      },
      update: {
        description: testHol.description,
        category: 'test',
        ruleType: 'fixed',
        month,
        day,
        weekday: null,
        nth: null,
      },
      create: {
        name: testHol.name,
        description: testHol.description,
        category: 'test',
        ruleType: 'fixed',
        month,
        day,
        weekday: null,
        nth: null,
        countryCode: 'US',
      },
    });

    console.log(`✓ ${testHol.name} created/updated\n`);
  }

  console.log('Test holidays added successfully!');
  console.log(
    '\nThese holidays are set to specific dates for testing different reminder offsets:',
  );
  console.log('- Enable notifications for each test holiday');
  console.log(
    '- Set reminder offsets (e.g., [0] for day-of, [1] for tomorrow)',
  );
  console.log('- Set reminder time to current time or near future');
  console.log('- Run the scheduler to test email delivery');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error adding test holidays:', error);
  process.exit(1);
});
