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

  if (!user) return;

  const tz = user.timezone || 'UTC';
  const today = getStartOfDayInTimezone(new Date(), tz);
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
      // Normalize holidayDate to the user's timezone start-of-day so comparisons are consistent
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
        holidayDate = getStartOfDayInTimezone(holidayDate, tz);
      }

      const daysUntil = getDaysBetween(today, holidayDate);

      const reminderOffsets = Array.isArray(pref.reminderOffsets)
        ? pref.reminderOffsets
        : JSON.parse((pref.reminderOffsets as string) || '[]');

      if (!reminderOffsets.includes(daysUntil)) continue;

      // Time-window check: send only when current local time is within window of reminderTime
      const windowMinutes = Number(process.env.SCHEDULER_WINDOW_MINUTES) || 15;
      const reminderTime = (pref.reminderTime as string) || '08:00';

      try {
        const nowZoned = utcToZonedTime(new Date(), tz);
        const [h, m] = reminderTime.split(':').map(Number);
        const target = new Date(nowZoned);
        target.setHours(h, m, 0, 0);

        const diffMinutes = Math.abs(
          (nowZoned.getTime() - target.getTime()) / 60000,
        );
        if (diffMinutes > windowMinutes) {
          // Not the right time for this user yet
          continue;
        }
      } catch (err) {
        console.error('Timezone parse error for user', user.id, err);
        // If timezone parsing fails, fall back to sending (avoid silent failure)
      }

      // Use the holiday date (start of day in user's timezone) as the scheduledFor
      const scheduledFor = getStartOfDayInTimezone(holidayDate, user.timezone);

      const existing = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          holidayId: holiday.id,
          scheduledFor: scheduledFor,
          sent: true,
        },
      });

      if (existing) continue;

      const emailHTML = generateHolidayEmailHTML(
        holiday.name,
        holiday.description,
        holidayDate,
        daysUntil,
      );

      const emailSent = await sendEmail({
        to: user.email,
        subject: `Reminder: ${holiday.name} ${daysUntil === 0 ? 'is today!' : `in ${daysUntil} days`}`,
        html: emailHTML,
      });

      if (emailSent) {
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
      }
    } catch (err) {
      console.error(
        'Error processing holiday preference for user',
        user.email,
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
  page = 0,
  pageSize = 100,
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
