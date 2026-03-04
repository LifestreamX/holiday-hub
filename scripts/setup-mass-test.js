const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'tylerallen@live.com';
  console.log(`--- Automated Massive Test Suite Setup for ${email} ---`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      holidayPreferences: {
        include: { holiday: true }
      }
    }
  });

  if (!user) {
    console.error('User not found. Please log in once first.');
    return;
  }

  // Find 10 holidays for testing
  const holidays = await prisma.holiday.findMany({
    take: 10,
    orderBy: { id: 'asc' }
  });

  console.log(`Resetting/Enabling ${holidays.length} holidays for extensive email testing...`);

  // Use fixed offsets that match "today" to force emails to send now
  // We'll figure out which offset 'matches' the actual date gap below
  const nowZonedStr = new Date().toLocaleString('en-US', { timeZone: user.timezone || 'UTC' });
  const nowZoned = new Date(nowZonedStr);
  
  const h = nowZoned.getHours();
  // Round to nearest 15 for QStash window match
  const m = Math.floor(nowZoned.getMinutes() / 15) * 15;
  const currentReminderTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  console.log(`Setting all reminder times to: ${currentReminderTime} for matching.`);

  for (const holiday of holidays) {
    // Determine the actual 'daysUntil' right now to ensure at least one offset triggers
    // calculate holiday date for current year
    const holidayDate = new Date(nowZoned.getFullYear(), holiday.month - 1, holiday.day);
    const diffTime = holidayDate.getTime() - new Date(nowZoned.getFullYear(), nowZoned.getMonth(), nowZoned.getDate()).getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log(`- ${holiday.name} is ${daysUntil} days away. Adding to offsets.`);

    await prisma.userHolidayPreference.upsert({
      where: {
        userId_holidayId: {
          userId: user.id,
          holidayId: holiday.id
        }
      },
      update: {
        enabled: true,
        reminderOffsets: [0, 1, 7, 30, daysUntil], // ALWAYS include the current daysUntil to force a match
        reminderTime: currentReminderTime
      },
      create: {
        userId: user.id,
        holidayId: holiday.id,
        enabled: true,
        reminderOffsets: [0, 1, 7, 30, daysUntil],
        reminderTime: currentReminderTime
      }
    });
  }

  // Clear previous notification history for these holidays
  const deleted = await prisma.notification.deleteMany({
    where: {
      userId: user.id,
      holidayId: { in: holidays.map(h => h.id) }
    }
  });

  console.log(`Cleaned up ${deleted.count} old notification records.`);
  console.log(`✅ SETUP COMPLETE.`);
  console.log(`NOW RUN: node scripts/test-cron-signed.js`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
