#!/usr/bin/env tsx
import { prisma } from '../lib/prisma';
import { calculateHolidayDate } from '../lib/holidayEngine';
import {
  getDaysBetween,
  getStartOfDayInTimezone,
  createDateInTimezone,
} from '../lib/dateUtils';
import { utcToZonedTime } from 'date-fns-tz';

async function run() {
  const email = process.env.TEST_EMAIL_TO;
  if (!email) {
    console.error(
      'Please set TEST_EMAIL_TO environment variable to the user email to check.',
    );
    process.exit(1);
  }

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
    console.error('[dry-run] User not found for', email);
    process.exit(1);
  }

  console.log(
    '[dry-run] User:',
    user.email,
    'timezone:',
    user.timezone,
    'country:',
    user.countryCode,
  );

  const tz = user.timezone || 'UTC';
  const now = new Date();
  const today = getStartOfDayInTimezone(now, tz);

  for (const pref of user.holidayPreferences) {
    const holiday = pref.holiday;
    console.log('---');
    console.log(
      '[dry-run] Holiday:',
      holiday.name,
      holiday.countryCode,
      holiday.category,
    );

    let holidayDate: Date | null = null;
    const currentYear = today.getFullYear();

    if (holiday.ruleType === 'fixed' && holiday.month && holiday.day) {
      holidayDate = createDateInTimezone(
        currentYear,
        holiday.month,
        holiday.day,
        tz,
      );
      console.log(
        '[dry-run] Created fixed date in tz:',
        holidayDate.toISOString(),
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
        console.log(
          '[dry-run] Calculated date normalized to tz:',
          holidayDate.toISOString(),
        );
      }
    }

    if (!holidayDate) {
      console.log('[dry-run] No date for holiday, skipping');
      continue;
    }

    if (holidayDate < today) {
      // next year
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
        if (holidayDate) holidayDate = getStartOfDayInTimezone(holidayDate, tz);
      }
    }

    const daysUntil = getDaysBetween(today, holidayDate);
    console.log(
      '[dry-run] holidayDate:',
      holidayDate.toISOString(),
      'daysUntil:',
      daysUntil,
    );

    const reminderOffsets = Array.isArray(pref.reminderOffsets)
      ? pref.reminderOffsets
      : JSON.parse((pref.reminderOffsets as any) || '[]');

    console.log(
      '[dry-run] preference: enabled=',
      pref.enabled,
      'reminderOffsets=',
      reminderOffsets,
      'reminderTime=',
      pref.reminderTime,
    );

    if (!reminderOffsets.includes(daysUntil)) {
      console.log('[dry-run] Would not send: daysUntil not in reminderOffsets');
      continue;
    }

    const windowMinutes = Number(process.env.SCHEDULER_WINDOW_MINUTES) || 15;
    const reminderTime = (pref.reminderTime as string) || '08:00';

    try {
      const nowZoned = utcToZonedTime(now, tz);
      const [h, m] = reminderTime.split(':').map(Number);
      const target = new Date(nowZoned);
      target.setHours(h, m, 0, 0);
      const diffMinutes = (nowZoned.getTime() - target.getTime()) / 60000;

      console.log(
        '[dry-run] nowZoned:',
        nowZoned.toISOString(),
        'target:',
        target.toISOString(),
        'diffMinutes:',
        diffMinutes,
        'window:',
        windowMinutes,
      );

      if (Math.abs(diffMinutes) > windowMinutes) {
        console.log('[dry-run] Outside window — would not send');
      } else {
        console.log('[dry-run] INSIDE window — WOULD SEND (dry-run)');
      }
    } catch (err) {
      console.warn('[dry-run] Time parse error:', err);
    }
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('[dry-run] Error:', err);
  process.exit(1);
});
