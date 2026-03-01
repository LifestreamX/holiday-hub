#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Holiday counts per country:');
  const rows = await prisma.holiday.groupBy({
    by: ['countryCode'],
    _count: { id: true },
  });
  const mapped = rows.map((r) => ({
    countryCode: r.countryCode,
    count: r._count.id,
  }));
  mapped.sort((a, b) => b.count - a.count);
  console.table(mapped);

  const total = await prisma.holiday.count();
  console.log(`Total holidays in DB: ${total}`);

  const prefs = await prisma.userHolidayPreference.count({
    where: { enabled: true },
  });
  console.log(`Total enabled user preferences: ${prefs}`);

  const notificationsPending = await prisma.notification.count({
    where: { sent: false },
  });
  console.log(`Total pending notifications: ${notificationsPending}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect().finally(() => process.exit(1));
});
