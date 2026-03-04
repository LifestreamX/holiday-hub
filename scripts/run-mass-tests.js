const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'tylerallen@live.com';
  console.log(`--- 🚀 MASS TEST SUITE INITIALIZATION FOR ${email} ---`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error('User not found. Ensure tylerallen@live.com is registered.');
    return;
  }

  // Fetch as many holidays as possible to reach 200+ tests
  const holidays = await prisma.holiday.findMany({
    take: 250,
    orderBy: { id: 'asc' },
  });

  console.log(
    `Found ${holidays.length} holidays. Setting up ~${holidays.length * 2} test cases (Email + Notification record matching)...`,
  );

  const tz = user.timezone || 'America/New_York';
  const nowZonedStr = new Date().toLocaleString('en-US', { timeZone: tz });
  const nowZoned = new Date(nowZonedStr);
  const h = nowZoned.getHours();
  // Round to match current scheduler window (usually 15 min)
  const m = Math.floor(nowZoned.getMinutes() / 15) * 15;
  const currentReminderTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  console.log(
    `Synchronizing all reminder times to: ${currentReminderTime} for user local time.`,
  );

  // Clear previous notifications to allow re-triggering exactly now
  await prisma.notification.deleteMany({
    where: { userId: user.id },
  });

  let setupCount = 0;
  for (const holiday of holidays) {
    // Determine daysUntil for THIS holiday right now
    const holidayDate = new Date(
      nowZoned.getFullYear(),
      (holiday.month || 1) - 1,
      holiday.day || 1,
    );
    const todayBase = new Date(
      nowZoned.getFullYear(),
      nowZoned.getMonth(),
      nowZoned.getDate(),
    );
    const diffTime = holidayDate.getTime() - todayBase.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    await prisma.userHolidayPreference.upsert({
      where: {
        userId_holidayId: {
          userId: user.id,
          holidayId: holiday.id,
        },
      },
      update: {
        enabled: true,
        reminderOffsets: [0, 1, 7, 30, daysUntil], // Force the "Current Offset" match
        reminderTime: currentReminderTime,
      },
      create: {
        userId: user.id,
        holidayId: holiday.id,
        enabled: true,
        reminderOffsets: [0, 1, 7, 30, daysUntil],
        reminderTime: currentReminderTime,
      },
    });
    setupCount++;
  }

  console.log(
    `✅ SETUP COMPLETE: ${setupCount} holidays enabled for ${email}.`,
  );
  console.log(
    `NEXT: Running the scheduler to trigger all ${setupCount} emails.`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
