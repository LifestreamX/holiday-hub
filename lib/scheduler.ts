/**
 * Holiday notification scheduler
 * Runs daily to check and send holiday notifications
 */

import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { calculateHolidayDate } from './holidayEngine';
import { getDaysBetween, getStartOfDayInTimezone } from './dateUtils';
import { sendEmail, generateHolidayEmailHTML } from './emailService';

const prisma = new PrismaClient();

/**
 * Process notifications for a single user
 */
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
    console.error(`User ${userId} not found`);
    return;
  }

  const today = getStartOfDayInTimezone(new Date(), user.timezone);
  const currentYear = today.getFullYear();

  for (const preference of user.holidayPreferences) {
    const holiday = preference.holiday;

    try {
      // Calculate holiday date
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

      // If holiday has passed, check next year
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
      }

      const daysUntil = getDaysBetween(today, holidayDate);

      // Check if we should send a notification today
      const reminderOffsets = Array.isArray(preference.reminderOffsets)
        ? preference.reminderOffsets
        : JSON.parse((preference.reminderOffsets as string) || '[]');

      if (reminderOffsets.includes(daysUntil)) {
        // Check if we've already sent this notification
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            holidayId: holiday.id,
            scheduledFor: today,
            sent: true,
          },
        });

        if (existingNotification) {
          console.log(
            `Notification already sent for ${holiday.name} to ${user.email}`,
          );
          continue;
        }

        // Send email notification
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
              scheduledFor: today,
              sent: true,
              sentAt: new Date(),
              deliveryType: 'email',
            },
          });

          console.log(
            `Sent email notification for ${holiday.name} to ${user.email} (${daysUntil} days until)`,
          );
        }
      }
    } catch (error) {
      console.error(
        `Error processing holiday ${holiday.name} for user ${user.email}:`,
        error,
      );
    }
  }
}

/**
 * Main scheduler function
 */
async function runScheduler(): Promise<void> {
  console.log('Running holiday notification scheduler...');

  try {
    // Get all users with active preferences
    const users = await prisma.user.findMany({
      where: {
        holidayPreferences: {
          some: { enabled: true },
        },
      },
      select: { id: true },
    });

    console.log(`Processing notifications for ${users.length} users`);

    for (const user of users) {
      await processUserNotifications(user.id);
    }

    console.log('Scheduler completed successfully');
  } catch (error) {
    console.error('Scheduler error:', error);
  }
}

/**
 * Start the cron job
 * Runs every day at 6 AM server time
 */
export function startScheduler(): void {
  console.log('Starting holiday notification scheduler...');

  // Run daily at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    await runScheduler();
  });

  console.log('Scheduler started - will run daily at 6:00 AM');

  // Run immediately on startup for testing
  if (process.env.NODE_ENV === 'development') {
    console.log('Running scheduler immediately (development mode)...');
    runScheduler();
  }
}

// If running directly
if (require.main === module) {
  startScheduler();

  // Keep process alive
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
