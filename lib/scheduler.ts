import { PrismaClient } from '@prisma/client';
import { calculateHolidayDate } from './holidayEngine';
import { getDaysBetween, getStartOfDayInTimezone } from './dateUtils';
import { utcToZonedTime } from 'date-fns-tz';
import { sendEmail, generateHolidayEmailHTML } from './emailService';

const prisma = new PrismaClient();

export async function processUserNotifications(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      holidayPreferences: {
        where: { enabled: true },
        include: { holiday: true },
      },
    },
  });

  if (!user) {
    console.warn(`[scheduler] No user found for ID: ${userId}`);
    return;
  }

  const tz = user.timezone || 'UTC';
  const now = new Date();
  const today = getStartOfDayInTimezone(now, tz);
  const currentYear = today.getFullYear();

  for (const pref of user.holidayPreferences) {
    const holiday = pref.holiday;
    try {
      let holidayDate = calculateHolidayDate(
        {
          id: holiday.id,
          name: holiday.name,
          ruleType: holiday.ruleType as 'fixed' | 'nth_weekday' | 'calculated',
          month: holiday.month || undefined,
          day: holiday.day || undefined,
          weekday: holiday.weekday || undefined,
          nth: holiday.nth || undefined,
        },
        currentYear,
      );

      if (!holidayDate) {
        console.log(
          `[scheduler] Skipping holiday: ${holiday.name} (no date calculated)`,
        );
        continue;
      }

      // Normalize holidayDate to the user''s timezone start-of-day so comparisons are consistent
      holidayDate = getStartOfDayInTimezone(holidayDate, tz);

      if (holidayDate < today) {
        holidayDate = calculateHolidayDate(
          {
            id: holiday.id,
            name: holiday.name,
            ruleType: holiday.ruleType as
              | 'fixed'
              | 'nth_weekday'
              | 'calculated',
            month: holiday.month || undefined,
            day: holiday.day || undefined,
            weekday: holiday.weekday || undefined,
            nth: holiday.nth || undefined,
          },
          currentYear + 1,
        );
        if (!holidayDate) {
          console.log(
            `[scheduler] Skipping holiday (next year): ${holiday.name} (no date calculated)`,
          );
          continue;
        }
        holidayDate = getStartOfDayInTimezone(holidayDate, tz);
      }

      const daysUntil = getDaysBetween(today, holidayDate);

      const reminderOffsets = Array.isArray(pref.reminderOffsets)
        ? pref.reminderOffsets
        : JSON.parse((pref.reminderOffsets as string) || '[]');

      if (!reminderOffsets.includes(daysUntil)) {
        console.log(
          `[scheduler] Skipping holiday: ${holiday.name} (daysUntil: ${daysUntil} not in reminderOffsets)`,
        );
        continue;
      }

      // Time-window check: send only when current local time is within window of reminderTime
      const windowMinutes = Number(process.env.SCHEDULER_WINDOW_MINUTES) || 15;
      const reminderTime = (pref.reminderTime as string) || '08:00';

      try {
        const nowZoned = utcToZonedTime(now, tz);
        const [h, m] = reminderTime.split(':').map(Number);
        const target = new Date(nowZoned);
        target.setHours(h, m, 0, 0);

        const diffMinutes = Math.abs(
          (nowZoned.getTime() - target.getTime()) / 60000,
        );

        if (diffMinutes > windowMinutes) {
          console.log(
            `[scheduler] Skipping holiday: ${holiday.name} (outside reminder time window)`,
          );
          continue;
        }
      } catch (err) {
        console.warn(
          `[scheduler] Timezone parse error for user ${user.email}:`,
          err,
        );
        // If timezone parsing fails, fall back to sending (avoid silent failure)
      }

      // Use the holiday date (start of day in user''s timezone) as the scheduledFor
      const scheduledFor = getStartOfDayInTimezone(holidayDate, user.timezone);

      const existing = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          holidayId: holiday.id,
          scheduledFor: scheduledFor,
          sent: true,
        },
      });

      if (existing) {
        console.log(
          `[scheduler] Skipping holiday: ${holiday.name} (already sent)`,
        );
        continue;
      }

      const emailHTML = generateHolidayEmailHTML(
        holiday.name,
        holiday.description,
        holidayDate,
        daysUntil,
      );

      console.log(
        `[scheduler] Sending email for holiday: ${holiday.name} to ${user.email}`,
      );
      const emailSent = await sendEmail({
        to: user.email,
        subject: `Reminder: ${holiday.name} ${daysUntil === 0 ? 'is today!' : `in ${daysUntil} days`}`,
        html: emailHTML,
      });

      if (emailSent) {
        console.log(
          `[scheduler] Email sent and notification recorded for ${holiday.name} (${user.email})`,
        );
        await prisma.notification.create({
          data: {
            userId: user.id,
            holidayId: holiday.id,
            scheduledFor: scheduledFor,
            sent: true,
            sentAt: new Date(),
            deliveryType: 'email',
          },
        });
      } else {
        console.warn(
          `[scheduler] Email send failed for ${holiday.name} (${user.email})`,
        );
      }
    } catch (err) {
      console.error(
        `[scheduler] Error processing holiday: ${holiday.name} for user ${user.email}:`,
        err,
      );
    }
  }
}

export async function processAllUsers(pageSize = 100): Promise<number> {
  let page = 0;
  let processed = 0;
  while (true) {
    const users = await prisma.user.findMany({
      skip: page * pageSize,
      take: pageSize,
      where: { holidayPreferences: { some: { enabled: true } } },
      select: { id: true },
    });

    if (users.length === 0) break;

    const promises = users.map((u) => processUserNotifications(u.id));
    await Promise.allSettled(promises);
    processed += users.length;
    page++;
  }

  return processed;
}

export async function processUsersPage(
  page: number,
  pageSize: number,
): Promise<number> {
  const users = await prisma.user.findMany({
    skip: page * pageSize,
    take: pageSize,
    where: { holidayPreferences: { some: { enabled: true } } },
    select: { id: true },
  });

  if (users.length === 0) return 0;

  const promises = users.map((u) => processUserNotifications(u.id));
  await Promise.allSettled(promises);
  return users.length;
}
