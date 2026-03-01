import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database (non-destructive)...');

  const holidays = [
    // US Federal Holidays
    {
      name: "New Year's Day",
      description: 'Celebration of the new calendar year',
      category: 'federal',
      ruleType: 'fixed',
      month: 1,
      day: 1,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },
    {
      name: 'Martin Luther King Jr. Day',
      description: 'Honors civil rights leader Martin Luther King Jr.',
      category: 'federal',
      ruleType: 'nth_weekday',
      month: 1,
      day: null,
      weekday: 1, // Monday
      nth: 3, // 3rd Monday
      countryCode: 'US',
    },
    {
      name: "Presidents' Day",
      description: 'Honors all U.S. presidents, particularly George Washington',
      category: 'federal',
      ruleType: 'nth_weekday',
      month: 2,
      day: null,
      weekday: 1, // Monday
      nth: 3, // 3rd Monday
      countryCode: 'US',
    },
    {
      name: 'Memorial Day',
      description: 'Honors military personnel who died in service',
      category: 'federal',
      ruleType: 'nth_weekday',
      month: 5,
      day: null,
      weekday: 1, // Monday
      nth: -1, // Last Monday (we'll handle this special case)
      countryCode: 'US',
    },
    {
      name: 'Juneteenth',
      description: 'Commemorates the end of slavery in the United States',
      category: 'federal',
      ruleType: 'fixed',
      month: 6,
      day: 19,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },
    {
      name: 'Independence Day',
      description: 'Celebrates the adoption of the Declaration of Independence',
      category: 'federal',
      ruleType: 'fixed',
      month: 7,
      day: 4,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },
    {
      name: 'Labor Day',
      description: 'Honors the American labor movement',
      category: 'federal',
      ruleType: 'nth_weekday',
      month: 9,
      day: null,
      weekday: 1, // Monday
      nth: 1, // 1st Monday
      countryCode: 'US',
    },
    {
      name: 'Columbus Day',
      description:
        "Commemorates Christopher Columbus's arrival in the Americas",
      category: 'federal',
      ruleType: 'nth_weekday',
      month: 10,
      day: null,
      weekday: 1, // Monday
      nth: 2, // 2nd Monday
      countryCode: 'US',
    },
    {
      name: 'Veterans Day',
      description: 'Honors military veterans',
      category: 'federal',
      ruleType: 'fixed',
      month: 11,
      day: 11,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },
    {
      name: 'Thanksgiving Day',
      description: 'Traditional harvest festival',
      category: 'federal',
      ruleType: 'nth_weekday',
      month: 11,
      day: null,
      weekday: 4, // Thursday
      nth: 4, // 4th Thursday
      countryCode: 'US',
    },
    {
      name: 'Christmas Day',
      description: 'Christian holiday celebrating the birth of Jesus Christ',
      category: 'federal',
      ruleType: 'fixed',
      month: 12,
      day: 25,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },

    // Major Cultural Holidays
    {
      name: "Valentine's Day",
      description: 'Celebration of love and romance',
      category: 'cultural',
      ruleType: 'fixed',
      month: 2,
      day: 14,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },
    {
      name: "St. Patrick's Day",
      description: 'Irish cultural and religious celebration',
      category: 'cultural',
      ruleType: 'fixed',
      month: 3,
      day: 17,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },
    {
      name: 'Easter Sunday',
      description: 'Christian holiday celebrating the resurrection of Jesus',
      category: 'religious',
      ruleType: 'calculated',
      month: null,
      day: null,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },
    {
      name: "Mother's Day",
      description: 'Honors mothers and motherhood',
      category: 'cultural',
      ruleType: 'nth_weekday',
      month: 5,
      day: null,
      weekday: 0, // Sunday
      nth: 2, // 2nd Sunday
      countryCode: 'US',
    },
    {
      name: "Father's Day",
      description: 'Honors fathers and fatherhood',
      category: 'cultural',
      ruleType: 'nth_weekday',
      month: 6,
      day: null,
      weekday: 0, // Sunday
      nth: 3, // 3rd Sunday
      countryCode: 'US',
    },
    {
      name: 'Halloween',
      description: 'Celebration with costumes and trick-or-treating',
      category: 'cultural',
      ruleType: 'fixed',
      month: 10,
      day: 31,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },
    {
      name: 'Black Friday',
      description: 'Major shopping day after Thanksgiving',
      category: 'commercial',
      ruleType: 'nth_weekday',
      month: 11,
      day: null,
      weekday: 5, // Friday
      nth: 4, // 4th Friday (day after 4th Thursday)
      countryCode: 'US',
    },
    {
      name: 'Cyber Monday',
      description: 'Online shopping day following Thanksgiving weekend',
      category: 'commercial',
      ruleType: 'nth_weekday',
      month: 11,
      day: null,
      weekday: 1, // Monday
      nth: 4, // Monday after 4th Thursday (we'll calculate this)
      countryCode: 'US',
    },
    {
      name: "New Year's Eve",
      description: 'Celebration on the last day of the year',
      category: 'cultural',
      ruleType: 'fixed',
      month: 12,
      day: 31,
      weekday: null,
      nth: null,
      countryCode: 'US',
    },
  ];

  // Upsert holidays: preserve existing records, update when name+countryCode match
  let created = 0;
  let updated = 0;

  for (const holiday of holidays) {
    const existing = await prisma.holiday.findFirst({
      where: { name: holiday.name, countryCode: holiday.countryCode },
    });

    if (existing) {
      await prisma.holiday.update({
        where: { id: existing.id },
        data: holiday,
      });
      updated++;
    } else {
      await prisma.holiday.create({ data: holiday });
      created++;
    }
  }

  console.log(
    `✅ Seed complete: ${created} created, ${updated} updated (${holidays.length} attempted)`,
  );
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
