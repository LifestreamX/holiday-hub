const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApiResponse() {
  console.log('Starting check...');
  try {
    // Simulate what the API does
    const holidays = await prisma.holiday.findMany({
      where: {
        countryCode: 'US',
      },
    });

    console.log(`\n📊 Total holidays in database: ${holidays.length}`);

    // Count by ruleType
    const byRuleType = holidays.reduce((acc, h) => {
      acc[h.ruleType] = (acc[h.ruleType] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📋 By Rule Type:');
    Object.entries(byRuleType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // Check which holidays would fail calculation
    console.log('\n⚠️ Checking for potential calculation issues:');

    let issueCount = 0;
    holidays.forEach((h) => {
      if (h.ruleType === 'nth_weekday') {
        if (h.month === null || h.weekday === null || h.nth === null) {
          console.log(
            `  ❌ ${h.name}: missing fields (month=${h.month}, weekday=${h.weekday}, nth=${h.nth})`,
          );
          issueCount++;
        }
      } else if (h.ruleType === 'fixed') {
        if (h.month === null || h.day === null) {
          console.log(
            `  ❌ ${h.name}: missing fields (month=${h.month}, day=${h.day})`,
          );
          issueCount++;
        }
      }
    });

    if (issueCount === 0) {
      console.log('  ✅ No issues found with holiday data');
    }

    console.log(`\n✅ All ${holidays.length} holidays should be displayable\n`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiResponse()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
