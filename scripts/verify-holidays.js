// Verify holidays are loaded in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyHolidays() {
  try {
    console.log('\n🔍 Checking holidays in database...\n');

    const holidays = await prisma.holiday.findMany({
      where: {
        countryCode: 'US',
      },
      orderBy: [{ month: 'asc' }, { day: 'asc' }],
    });

    if (holidays.length === 0) {
      console.log('❌ No holidays found in database!');
      console.log('Run: node scripts/sync-holidays.js US 2026');
      return;
    }

    console.log(`✓ Found ${holidays.length} US holidays:\n`);

    holidays.forEach((holiday, index) => {
      const dateStr =
        holiday.month && holiday.day
          ? `${holiday.month}/${holiday.day}`
          : 'Calculated';
      console.log(
        `${index + 1}. ${holiday.name} (${dateStr}) - ${holiday.category}`,
      );
    });

    console.log('\n✅ Holidays successfully loaded!');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Sign in with your account');
    console.log('3. View holidays in the dashboard');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyHolidays();
