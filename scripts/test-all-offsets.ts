#!/usr/bin/env tsx
/**
 * Comprehensive test of notification system with all offsets.
 * This script will check if notifications would be sent for each test holiday
 * at each offset, and provide detailed diagnostics.
 */

import { prisma } from '../lib/prisma';
import { calculateHolidayDate } from '../lib/holidayEngine';
import {
  getDaysBetween,
  getStartOfDayInTimezone,
  createDateInTimezone,
} from '../lib/dateUtils';
import { utcToZonedTime } from 'date-fns-tz';

async function main() {
  const email = process.env.TEST_EMAIL_TO;
  if (!email) {
    console.error(
      'Please set TEST_EMAIL_TO environment variable to your test user email.',
    );
    console.error(
      'Example: TEST_EMAIL_TO=your@email.com npx tsx scripts/test-all-offsets.ts',
    );
    process.exit(1);
  }

  console.log('='.repeat(80));
  console.log('NOTIFICATION SYSTEM TEST - ALL OFFSETS');
  console.log('='.repeat(80));
  console.log();

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      holidayPreferences: {
        where: { enabled: true },
        include: { holiday: true },
      },
    },
  });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    console.error('Please create a user account first.');
    process.exit(1);
  }

  console.log(`User: ${user.email}`);
  console.log(`Timezone: ${user.timezone}`);
  console.log(`Country: ${user.countryCode}`);
  console.log();

  const tz = user.timezone || 'UTC';
  const now = new Date();
  const today = getStartOfDayInTimezone(now, tz);
  const currentYear = today.getFullYear();

  console.log(`Current time (UTC): ${now.toISOString()}`);
  console.log(`Today (${tz}): ${today.toISOString()}`);
  console.log();

  // Test holidays we're looking for
  const testHolidayNames = [
    'Test Holiday - Today',
    'Test Holiday - Tomorrow',
    'Test Holiday - 1 Week',
    'Test Holiday - 1 Month',
  ];

  const testPrefs = user.holidayPreferences.filter((p) =>
    testHolidayNames.includes(p.holiday.name),
  );

  if (testPrefs.length === 0) {
    console.error('❌ No test holiday preferences found!');
    console.error('Please:');
    console.error('1. Run: npx tsx scripts/add-test-holidays.ts');
    console.error('2. Enable notifications for test holidays in the dashboard');
    console.error('3. Set reminder offsets and time in holiday settings');
    process.exit(1);
  }

  console.log(`Found ${testPrefs.length} test holiday preferences\n`);

  for (const pref of testPrefs) {
    const holiday = pref.holiday;
    console.log('─'.repeat(80));
    console.log(`🎉 ${holiday.name}`);
    console.log('─'.repeat(80));

    let holidayDate: Date | null = null;

    if (holiday.ruleType === 'fixed' && holiday.month && holiday.day) {
      holidayDate = createDateInTimezone(
        currentYear,
        holiday.month,
        holiday.day,
        tz,
      );
    } else {
      holidayDate = calculateHolidayDate(
        {
          id: holiday.id,
          name: holiday.name,
          ruleType: holiday.ruleType as any,
          month: holiday.month ?? undefined,
          day: holiday.day ?? undefined,
          weekday: holiday.weekday ?? undefined,
          nth: holiday.nth ?? undefined,
        },
        currentYear,
      );
      if (holidayDate) {
        holidayDate = getStartOfDayInTimezone(holidayDate, tz);
      }
    }

    if (!holidayDate) {
      console.log('❌ Could not calculate holiday date\n');
      continue;
    }

    // If holiday passed, try next year
    if (holidayDate < today) {
      if (holiday.ruleType === 'fixed' && holiday.month && holiday.day) {
        holidayDate = createDateInTimezone(
          currentYear + 1,
          holiday.month,
          holiday.day,
          tz,
        );
      } else {
        holidayDate = calculateHolidayDate(
          {
            id: holiday.id,
            name: holiday.name,
            ruleType: holiday.ruleType as any,
            month: holiday.month ?? undefined,
            day: holiday.day ?? undefined,
            weekday: holiday.weekday ?? undefined,
            nth: holiday.nth ?? undefined,
          },
          currentYear + 1,
        );
        if (holidayDate) {
          holidayDate = getStartOfDayInTimezone(holidayDate, tz);
        }
      }
    }

    if (!holidayDate) {
      console.log('❌ Could not calculate holiday date (next year)\n');
      continue;
    }

    const daysUntil = getDaysBetween(today, holidayDate);

    console.log(`📅 Holiday Date: ${holidayDate.toDateString()}`);
    console.log(`📊 Days Until: ${daysUntil}`);
    console.log();

    const reminderOffsets = Array.isArray(pref.reminderOffsets)
      ? pref.reminderOffsets
      : JSON.parse((pref.reminderOffsets as any) || '[]');

    console.log(
      `🔔 Configured Reminder Offsets: [${reminderOffsets.join(', ')}]`,
    );
    console.log(`⏰ Reminder Time: ${pref.reminderTime}`);
    console.log();

    // Check each configured offset
    for (const offset of reminderOffsets) {
      console.log(`  Offset ${offset}:`);

      if (offset === daysUntil) {
        console.log(`    ✅ MATCHES current daysUntil (${daysUntil})`);

        // Check time window
        const windowMinutes =
          Number(process.env.SCHEDULER_WINDOW_MINUTES) || 15;
        const reminderTime = (pref.reminderTime as string) || '08:00';

        try {
          const nowZoned = utcToZonedTime(now, tz);
          const [h, m] = reminderTime.split(':').map(Number);
          const target = new Date(nowZoned);
          target.setHours(h, m, 0, 0);
          const diffMinutes = (nowZoned.getTime() - target.getTime()) / 60000;

          console.log(`    Current time (zoned): ${nowZoned.toTimeString()}`);
          console.log(`    Target time: ${target.toTimeString()}`);
          console.log(`    Difference: ${Math.round(diffMinutes)} minutes`);
          console.log(`    Window: ±${windowMinutes} minutes`);

          if (Math.abs(diffMinutes) <= windowMinutes) {
            console.log(`    ✅ INSIDE TIME WINDOW - Would send notification!`);

            // Check if already sent
            const scheduledFor = getStartOfDayInTimezone(holidayDate, tz);
            const existing = await prisma.notification.findFirst({
              where: {
                userId: user.id,
                holidayId: holiday.id,
                scheduledFor: scheduledFor,
                offset: offset,
                sent: true,
              },
            });

            if (existing) {
              console.log(`    ⚠️  Already sent notification for this offset`);
              console.log(`       Sent at: ${existing.sentAt?.toISOString()}`);
            } else {
              console.log(`    ✅ No previous notification - READY TO SEND`);
            }
          } else {
            console.log(
              `    ⏸️  OUTSIDE TIME WINDOW - Won't send until ${reminderTime} (${tz})`,
            );
          }
        } catch (err) {
          console.log(`    ⚠️  Time parse error: ${err}`);
        }
      } else {
        console.log(
          `    ⏸️  Does not match current daysUntil (${daysUntil} != ${offset})`,
        );
      }

      console.log();
    }

    if (!reminderOffsets.includes(daysUntil)) {
      console.log(
        `  ⚠️  Current daysUntil (${daysUntil}) is NOT in configured offsets`,
      );
      console.log(`     Add offset ${daysUntil} to receive notifications now.`);
      console.log();
    }
  }

  console.log('='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
  console.log();
  console.log('Legend:');
  console.log('  ✅ = Ready to send / Configured correctly');
  console.log('  ⏸️  = Waiting for condition to be met');
  console.log('  ⚠️  = Warning / Already sent');
  console.log('  ❌ = Error / Not configured');
  console.log();

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error running test:', error);
  process.exit(1);
});
