const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHolidays() {
  try {
    const holidays = await prisma.holiday.findMany({
      where: {
        name: {
          in: ['Mardi Gras', 'Mother\'s Day', 'Father\'s Day', 'Grandparents Day'],
        },
      },
    });

    console.log('Found holidays:', holidays.length);
    console.log(JSON.stringify(holidays, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHolidays();
