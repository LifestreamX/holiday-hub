#!/usr/bin/env tsx
/**
 * Check user preferences for test holidays
 */

import { prisma } from '../lib/prisma';

async function main() {
  const email = process.env.TEST_EMAIL_TO;
  if (!email) {
    console.error('Set TEST_EMAIL_TO env var');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      holidayPreferences: {
        where: {
          holiday: {
            name: {
              contains: 'Test Holiday',
            },
          },
        },
        include: {
          holiday: true,
        },
      },
    },
  });

  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  console.log(`User: ${user.email}`);
  console.log(`Timezone: ${user.timezone}`);
  console.log(`\nTest Holiday Preferences:\n`);

  for (const pref of user.holidayPreferences) {
    console.log(`${pref.holiday.name} (${pref.holiday.month}/${pref.holiday.day}):`);
    console.log(`  Enabled: ${pref.enabled}`);
    console.log(`  Reminder Offsets: ${JSON.stringify(pref.reminderOffsets)}`);
    console.log(`  Reminder Time: ${pref.reminderTime}`);
    console.log(`  Delivery Method: ${pref.deliveryMethod}`);
    console.log();
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
