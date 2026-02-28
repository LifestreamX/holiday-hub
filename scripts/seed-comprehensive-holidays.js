// Comprehensive US Holiday Seed Data
// Run: node scripts/seed-comprehensive-holidays.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const comprehensiveUSHolidays = [
  // ========== FEDERAL HOLIDAYS (10) ==========
  {
    name: "New Year's Day",
    description: 'First day of the year',
    category: 'federal',
    ruleType: 'fixed',
    month: 1,
    day: 1,
  },
  {
    name: 'Martin Luther King Jr. Day',
    description: '3rd Monday in January',
    category: 'federal',
    ruleType: 'nth_weekday',
    month: 1,
    weekday: 1,
    nth: 3,
  },
  {
    name: 'Presidents Day',
    description: "Washington's Birthday - 3rd Monday in February",
    category: 'federal',
    ruleType: 'nth_weekday',
    month: 2,
    weekday: 1,
    nth: 3,
  },
  {
    name: 'Memorial Day',
    description: 'Last Monday in May',
    category: 'federal',
    ruleType: 'nth_weekday',
    month: 5,
    weekday: 1,
    nth: -1,
  },
  {
    name: 'Juneteenth',
    description: 'Juneteenth National Independence Day',
    category: 'federal',
    ruleType: 'fixed',
    month: 6,
    day: 19,
  },
  {
    name: 'Independence Day',
    description: 'Fourth of July',
    category: 'federal',
    ruleType: 'fixed',
    month: 7,
    day: 4,
  },
  {
    name: 'Labor Day',
    description: 'First Monday in September',
    category: 'federal',
    ruleType: 'nth_weekday',
    month: 9,
    weekday: 1,
    nth: 1,
  },
  {
    name: 'Columbus Day',
    description: '2nd Monday in October',
    category: 'federal',
    ruleType: 'nth_weekday',
    month: 10,
    weekday: 1,
    nth: 2,
  },
  {
    name: 'Veterans Day',
    description: 'Honoring military veterans',
    category: 'federal',
    ruleType: 'fixed',
    month: 11,
    day: 11,
  },
  {
    name: 'Thanksgiving',
    description: '4th Thursday in November',
    category: 'federal',
    ruleType: 'nth_weekday',
    month: 11,
    weekday: 4,
    nth: 4,
  },
  {
    name: 'Christmas Day',
    description: "Christian celebration of Jesus' birth",
    category: 'federal',
    ruleType: 'fixed',
    month: 12,
    day: 25,
  },

  // ========== RELIGIOUS HOLIDAYS - CHRISTIAN ==========
  {
    name: 'Epiphany',
    description: 'Three Kings Day',
    category: 'religious-christian',
    ruleType: 'fixed',
    month: 1,
    day: 6,
  },
  {
    name: 'Ash Wednesday',
    description: 'First day of Lent',
    category: 'religious-christian',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Palm Sunday',
    description: 'Sunday before Easter',
    category: 'religious-christian',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Maundy Thursday',
    description: 'Thursday before Easter',
    category: 'religious-christian',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Good Friday',
    description: 'Friday before Easter',
    category: 'religious-christian',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Holy Saturday',
    description: 'Saturday before Easter',
    category: 'religious-christian',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Easter Sunday',
    description: 'Christian celebration of resurrection',
    category: 'religious-christian',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Easter Monday',
    description: 'Monday after Easter',
    category: 'religious-christian',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: "All Saints' Day",
    description: 'Christian feast day',
    category: 'religious-christian',
    ruleType: 'fixed',
    month: 11,
    day: 1,
  },
  {
    name: "All Souls' Day",
    description: 'Day of prayers for the dead',
    category: 'religious-christian',
    ruleType: 'fixed',
    month: 11,
    day: 2,
  },
  {
    name: 'Christmas Eve',
    description: 'Evening before Christmas',
    category: 'religious-christian',
    ruleType: 'fixed',
    month: 12,
    day: 24,
  },

  // ========== RELIGIOUS HOLIDAYS - JEWISH ==========
  {
    name: 'Rosh Hashanah',
    description: 'Jewish New Year',
    category: 'religious-jewish',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Yom Kippur',
    description: 'Day of Atonement',
    category: 'religious-jewish',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Hanukkah',
    description: 'Festival of Lights (8 days)',
    category: 'religious-jewish',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Passover',
    description: 'Pesach - 8 day celebration',
    category: 'religious-jewish',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Purim',
    description: 'Celebration of Queen Esther',
    category: 'religious-jewish',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Shavuot',
    description: 'Festival of Weeks',
    category: 'religious-jewish',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Sukkot',
    description: 'Feast of Tabernacles',
    category: 'religious-jewish',
    ruleType: 'calculated',
    month: null,
    day: null,
  },

  // ========== RELIGIOUS HOLIDAYS - ISLAMIC ==========
  {
    name: 'Ramadan',
    description: 'Islamic holy month of fasting',
    category: 'religious-islamic',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Eid al-Fitr',
    description: 'Festival of Breaking the Fast',
    category: 'religious-islamic',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Eid al-Adha',
    description: 'Festival of Sacrifice',
    category: 'religious-islamic',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Mawlid',
    description: 'Birthday of Prophet Muhammad',
    category: 'religious-islamic',
    ruleType: 'calculated',
    month: null,
    day: null,
  },

  // ========== RELIGIOUS HOLIDAYS - OTHER ==========
  {
    name: 'Diwali',
    description: 'Hindu Festival of Lights',
    category: 'religious-hindu',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Holi',
    description: 'Hindu Festival of Colors',
    category: 'religious-hindu',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Vesak',
    description: "Buddha's Birthday",
    category: 'religious-buddhist',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: 'Vaisakhi',
    description: 'Sikh New Year',
    category: 'religious-sikh',
    ruleType: 'fixed',
    month: 4,
    day: 13,
  },

  // ========== CULTURAL & TRADITIONAL ==========
  {
    name: 'Groundhog Day',
    description: 'Weather prediction tradition',
    category: 'cultural',
    ruleType: 'fixed',
    month: 2,
    day: 2,
  },
  {
    name: 'Super Bowl Sunday',
    description: 'Championship football game',
    category: 'cultural-sports',
    ruleType: 'nth_weekday',
    month: 2,
    weekday: 0,
    nth: 1,
  },
  {
    name: "Valentine's Day",
    description: 'Day of love and romance',
    category: 'cultural',
    ruleType: 'fixed',
    month: 2,
    day: 14,
  },
  {
    name: 'Mardi Gras',
    description: 'Fat Tuesday - Carnival celebration',
    category: 'cultural',
    ruleType: 'calculated',
    month: null,
    day: null,
  },
  {
    name: "St. Patrick's Day",
    description: 'Irish cultural celebration',
    category: 'cultural',
    ruleType: 'fixed',
    month: 3,
    day: 17,
  },
  {
    name: "April Fools' Day",
    description: 'Day of pranks and jokes',
    category: 'cultural',
    ruleType: 'fixed',
    month: 4,
    day: 1,
  },
  {
    name: 'Earth Day',
    description: 'Environmental awareness',
    category: 'awareness',
    ruleType: 'fixed',
    month: 4,
    day: 22,
  },
  {
    name: 'Arbor Day',
    description: 'Tree planting day',
    category: 'awareness',
    ruleType: 'nth_weekday',
    month: 4,
    weekday: 5,
    nth: -1,
  },
  {
    name: 'Cinco de Mayo',
    description: 'Mexican heritage celebration',
    category: 'cultural',
    ruleType: 'fixed',
    month: 5,
    day: 5,
  },
  {
    name: "Mother's Day",
    description: 'Honoring mothers',
    category: 'cultural',
    ruleType: 'nth_weekday',
    month: 5,
    weekday: 0,
    nth: 2,
  },
  {
    name: "Father's Day",
    description: 'Honoring fathers',
    category: 'cultural',
    ruleType: 'nth_weekday',
    month: 6,
    weekday: 0,
    nth: 3,
  },
  {
    name: 'Halloween',
    description: 'Costumes and trick-or-treating',
    category: 'cultural',
    ruleType: 'fixed',
    month: 10,
    day: 31,
  },
  {
    name: 'Day of the Dead',
    description: 'Día de los Muertos - Mexican tradition',
    category: 'cultural',
    ruleType: 'fixed',
    month: 11,
    day: 2,
  },
  {
    name: 'Black Friday',
    description: 'Shopping day after Thanksgiving',
    category: 'cultural-shopping',
    ruleType: 'nth_weekday',
    month: 11,
    weekday: 5,
    nth: 4,
  },
  {
    name: 'Cyber Monday',
    description: 'Online shopping day',
    category: 'cultural-shopping',
    ruleType: 'nth_weekday',
    month: 11,
    weekday: 1,
    nth: 4,
  },
  {
    name: 'Small Business Saturday',
    description: 'Shop local day',
    category: 'cultural-shopping',
    ruleType: 'nth_weekday',
    month: 11,
    weekday: 6,
    nth: 4,
  },
  {
    name: "New Year's Eve",
    description: 'Last day of the year',
    category: 'cultural',
    ruleType: 'fixed',
    month: 12,
    day: 31,
  },

  // ========== HERITAGE & AWARENESS MONTHS (Key Days) ==========
  {
    name: 'Black History Month',
    description: 'Month celebrating African American history (February)',
    category: 'heritage',
    ruleType: 'fixed',
    month: 2,
    day: 1,
  },
  {
    name: "Women's History Month",
    description: "Month celebrating women's achievements (March)",
    category: 'heritage',
    ruleType: 'fixed',
    month: 3,
    day: 1,
  },
  {
    name: "International Women's Day",
    description: "Celebrating women's achievements",
    category: 'awareness',
    ruleType: 'fixed',
    month: 3,
    day: 8,
  },
  {
    name: 'Asian American and Pacific Islander Heritage Month',
    description: 'AAPI Heritage Month (May)',
    category: 'heritage',
    ruleType: 'fixed',
    month: 5,
    day: 1,
  },
  {
    name: 'Pride Month',
    description: 'LGBTQ+ Pride Month (June)',
    category: 'heritage',
    ruleType: 'fixed',
    month: 6,
    day: 1,
  },
  {
    name: 'Hispanic Heritage Month',
    description: 'Celebrating Hispanic/Latinx culture (Sep 15 - Oct 15)',
    category: 'heritage',
    ruleType: 'fixed',
    month: 9,
    day: 15,
  },
  {
    name: 'Native American Heritage Month',
    description: 'Celebrating Native American culture (November)',
    category: 'heritage',
    ruleType: 'fixed',
    month: 11,
    day: 1,
  },

  // ========== STATE HOLIDAYS ==========
  {
    name: "Lincoln's Birthday",
    description: 'Celebrated in several states',
    category: 'state',
    ruleType: 'fixed',
    month: 2,
    day: 12,
  },
  {
    name: 'Texas Independence Day',
    description: 'Texas state holiday',
    category: 'state',
    ruleType: 'fixed',
    month: 3,
    day: 2,
  },
  {
    name: 'Casimir Pulaski Day',
    description: 'Illinois state holiday',
    category: 'state',
    ruleType: 'nth_weekday',
    month: 3,
    weekday: 1,
    nth: 1,
  },
  {
    name: "Patriots' Day",
    description: 'Maine & Massachusetts',
    category: 'state',
    ruleType: 'nth_weekday',
    month: 4,
    weekday: 1,
    nth: 3,
  },
  {
    name: 'Confederate Memorial Day',
    description: 'Several Southern states',
    category: 'state',
    ruleType: 'fixed',
    month: 4,
    day: 26,
  },
  {
    name: 'Truman Day',
    description: 'Missouri state holiday',
    category: 'state',
    ruleType: 'fixed',
    month: 5,
    day: 8,
  },
  {
    name: "Jefferson Davis' Birthday",
    description: 'Confederate memorial day',
    category: 'state',
    ruleType: 'fixed',
    month: 6,
    day: 3,
  },
  {
    name: 'West Virginia Day',
    description: 'West Virginia statehood',
    category: 'state',
    ruleType: 'fixed',
    month: 6,
    day: 20,
  },
  {
    name: 'Bennington Battle Day',
    description: 'Vermont state holiday',
    category: 'state',
    ruleType: 'fixed',
    month: 8,
    day: 16,
  },
  {
    name: 'Admission Day',
    description: 'California statehood',
    category: 'state',
    ruleType: 'fixed',
    month: 9,
    day: 9,
  },
  {
    name: "Indigenous Peoples' Day",
    description: 'Alternative to Columbus Day',
    category: 'state',
    ruleType: 'nth_weekday',
    month: 10,
    weekday: 1,
    nth: 2,
  },
  {
    name: 'Nevada Day',
    description: 'Nevada statehood',
    category: 'state',
    ruleType: 'fixed',
    month: 10,
    day: 31,
  },
  {
    name: 'Election Day',
    description: 'Federal election day',
    category: 'civic',
    ruleType: 'nth_weekday',
    month: 11,
    weekday: 2,
    nth: 1,
  },

  // ========== PROFESSIONAL & AWARENESS DAYS ==========
  {
    name: 'National Nurses Day',
    description: 'Honoring nurses',
    category: 'professional',
    ruleType: 'fixed',
    month: 5,
    day: 6,
  },
  {
    name: "Teachers' Appreciation Day",
    description: 'Honoring teachers',
    category: 'professional',
    ruleType: 'nth_weekday',
    month: 5,
    weekday: 2,
    nth: 1,
  },
  {
    name: 'Armed Forces Day',
    description: 'Honoring all military branches',
    category: 'military',
    ruleType: 'nth_weekday',
    month: 5,
    weekday: 6,
    nth: 3,
  },
  {
    name: 'National Police Week',
    description: 'Honoring law enforcement',
    category: 'professional',
    ruleType: 'nth_weekday',
    month: 5,
    weekday: 1,
    nth: 2,
  },
  {
    name: 'Flag Day',
    description: 'Commemorating US flag adoption',
    category: 'patriotic',
    ruleType: 'fixed',
    month: 6,
    day: 14,
  },
  {
    name: 'Grandparents Day',
    description: 'Honoring grandparents',
    category: 'cultural',
    ruleType: 'nth_weekday',
    month: 9,
    weekday: 0,
    nth: 1,
  },
  {
    name: 'Constitution Day',
    description: 'Citizenship Day',
    category: 'civic',
    ruleType: 'fixed',
    month: 9,
    day: 17,
  },
  {
    name: 'Pearl Harbor Remembrance Day',
    description: 'Remembering Pearl Harbor attack',
    category: 'military',
    ruleType: 'fixed',
    month: 12,
    day: 7,
  },

  // ========== SEASONAL ==========
  {
    name: 'Spring Equinox',
    description: 'First day of spring',
    category: 'seasonal',
    ruleType: 'fixed',
    month: 3,
    day: 20,
  },
  {
    name: 'Summer Solstice',
    description: 'First day of summer',
    category: 'seasonal',
    ruleType: 'fixed',
    month: 6,
    day: 21,
  },
  {
    name: 'Fall Equinox',
    description: 'First day of autumn',
    category: 'seasonal',
    ruleType: 'fixed',
    month: 9,
    day: 23,
  },
  {
    name: 'Winter Solstice',
    description: 'First day of winter',
    category: 'seasonal',
    ruleType: 'fixed',
    month: 12,
    day: 21,
  },
];

async function seedComprehensiveHolidays() {
  try {
    console.log('\n🌟 Seeding comprehensive US holiday database...\n');

    let created = 0;
    let updated = 0;

    for (const holiday of comprehensiveUSHolidays) {
      const holidayData = {
        ...holiday,
        countryCode: 'US',
        weekday: holiday.weekday ?? null,
        nth: holiday.nth ?? null,
        month: holiday.month ?? null,
        day: holiday.day ?? null,
      };

      // Check if holiday exists
      const existing = await prisma.holiday.findFirst({
        where: {
          name: holidayData.name,
          countryCode: 'US',
        },
      });

      if (existing) {
        await prisma.holiday.update({
          where: { id: existing.id },
          data: holidayData,
        });
        console.log(
          `  ✓ Updated: ${holidayData.name} [${holidayData.category}]`,
        );
        updated++;
      } else {
        await prisma.holiday.create({
          data: holidayData,
        });
        console.log(
          `  ✓ Created: ${holidayData.name} [${holidayData.category}]`,
        );
        created++;
      }
    }

    console.log(`\n✅ Seed complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Total: ${comprehensiveUSHolidays.length}\n`);

    // Show breakdown by category
    const byCategory = {};
    comprehensiveUSHolidays.forEach((h) => {
      if (!byCategory[h.category]) byCategory[h.category] = 0;
      byCategory[h.category]++;
    });

    console.log('📊 Categories:');
    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });
  } catch (error) {
    console.error('Error seeding holidays:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedComprehensiveHolidays();
