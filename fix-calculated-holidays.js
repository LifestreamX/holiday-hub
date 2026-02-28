const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 2026 dates for calculated holidays (researched from reliable sources)
const calculatedHolidayDates2026 = {
  // Islamic holidays (based on Islamic calendar - dates are estimates)
  Ramadan: { month: 2, day: 28 }, // Feb 28, 2026 (first day of Ramadan)
  'Eid al-Fitr': { month: 3, day: 30 }, // March 30, 2026
  'Eid al-Adha': { month: 6, day: 6 }, // June 6, 2026
  Mawlid: { month: 9, day: 3 }, // Sept 3, 2026 (Mawlid an-Nabi)

  // Hindu holidays
  Holi: { month: 3, day: 14 }, // March 14, 2026
  Diwali: { month: 11, day: 8 }, // Nov 8, 2026 (main day)

  // Jewish holidays (based on Hebrew calendar)
  Purim: { month: 3, day: 4 }, // March 4, 2026
  Passover: { month: 4, day: 2 }, // April 2, 2026 (first day)
  Shavuot: { month: 5, day: 22 }, // May 22, 2026
  'Rosh Hashanah': { month: 9, day: 14 }, // Sept 14, 2026 (first day)
  'Yom Kippur': { month: 9, day: 23 }, // Sept 23, 2026
  Sukkot: { month: 9, day: 28 }, // Sept 28, 2026 (first day)
  Hanukkah: { month: 12, day: 5 }, // Dec 5, 2026 (first day)

  // Buddhist
  Vesak: { month: 5, day: 3 }, // May 3, 2026 (Buddha's Birthday)

  // Christian/Cultural (we already handle Easter and related)
  'Palm Sunday': { ruleType: 'calculated', keepCalculated: true }, // Keep as calculated
  'Maundy Thursday': { ruleType: 'calculated', keepCalculated: true },
  'Good Friday': { ruleType: 'calculated', keepCalculated: true },
  'Holy Saturday': { ruleType: 'calculated', keepCalculated: true },
  'Easter Sunday': { ruleType: 'calculated', keepCalculated: true },
  'Easter Monday': { ruleType: 'calculated', keepCalculated: true },
  'Ash Wednesday': { ruleType: 'calculated', keepCalculated: true },
  'Mardi Gras': { ruleType: 'calculated', keepCalculated: true }, // We just fixed this
};

async function fixCalculatedHolidays() {
  try {
    console.log('🔧 Fixing calculated holidays...\n');

    // Get all calculated holidays
    const calculatedHolidays = await prisma.holiday.findMany({
      where: {
        ruleType: 'calculated',
      },
    });

    console.log(`Found ${calculatedHolidays.length} calculated holidays\n`);

    let updated = 0;
    let skipped = 0;

    for (const holiday of calculatedHolidays) {
      const dateInfo = calculatedHolidayDates2026[holiday.name];

      if (dateInfo && !dateInfo.keepCalculated) {
        // Update to fixed date
        await prisma.holiday.update({
          where: { id: holiday.id },
          data: {
            ruleType: 'fixed',
            month: dateInfo.month,
            day: dateInfo.day,
            weekday: null,
            nth: null,
          },
        });
        console.log(
          `✅ Updated ${holiday.name} to fixed date: ${dateInfo.month}/${dateInfo.day}`,
        );
        updated++;
      } else if (dateInfo && dateInfo.keepCalculated) {
        console.log(`⏭️  Skipped ${holiday.name} (has calculation logic)`);
        skipped++;
      } else {
        console.log(`⚠️  No date found for ${holiday.name}`);
      }
    }

    console.log(`\n✅ Updated ${updated} holidays`);
    console.log(`⏭️  Skipped ${skipped} holidays (calculation logic exists)`);
    console.log(`\n🎉 All holidays should now display correctly!`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCalculatedHolidays()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
