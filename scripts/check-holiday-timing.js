const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWomensDay() {
  console.log("--- Women's Day Matcher ---");

  // Find Women's Day
  const holiday = await prisma.holiday.findFirst({
    where: { name: { contains: "Women's Day" } },
  });

  if (!holiday) {
    console.error("Women's Day not found!");
    return;
  }

  // Current system state
  const now = new Date();
  const year = now.getFullYear();

  // Rule is fixed March 8
  const holidayDate = new Date(year, 2, 8); // Month is 0-indexed

  // Calculate diff in days (ignoring time)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = holidayDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  console.log(`Holiday: ${holiday.name}`);
  console.log(`Target Date: ${holidayDate.toDateString()}`);
  console.log(`Today is: ${today.toDateString()}`);
  console.log(`Days Until: ${daysUntil}`);
  console.log('--- Eligibility Check ---');

  const offsets = [0, 1, 7, 30];
  offsets.forEach((offset) => {
    const isPast = offset > daysUntil;
    const isToday = offset === daysUntil;

    let status = '';
    if (isPast) status = '❌ PAST (Should be disabled in UI)';
    else if (isToday)
      status = '✅ MATCHES TODAY (Would trigger now if time matches)';
    else status = '⏳ FUTURE (Wait until then)';

    console.log(`${offset} days before: ${status}`);
  });
}

checkWomensDay().finally(() => prisma.$disconnect());
