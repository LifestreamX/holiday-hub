// Final verification - test dashboard access and API
async function finalVerification() {
  console.log('\n🔍 Final Verification - Holiday Hub\n');
  console.log('='.repeat(60));

  try {
    // Test API endpoint
    console.log('\n📡 Testing API...');
    const apiResponse = await fetch('http://localhost:3001/api/holidays');

    if (!apiResponse.ok) {
      console.log('⚠️  API not accessible - make sure you are logged in');
      console.log('   Visit http://localhost:3001 and sign in first\n');
      return;
    }

    const holidays = await apiResponse.json();

    console.log(`✅ API working: ${holidays.length} holidays returned`);

    // Count by category
    const byCategory = {};
    holidays.forEach((h) => {
      byCategory[h.category] = (byCategory[h.category] || 0) + 1;
    });

    console.log('\n📊 Categories:');
    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });

    // Show upcoming holidays (next 30 days)
    const upcoming = holidays
      .filter(
        (h) => h.daysUntil !== null && h.daysUntil >= 0 && h.daysUntil <= 30,
      )
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 10);

    console.log(`\n📅 Next 10 Upcoming Holidays:`);
    upcoming.forEach((h) => {
      const days =
        h.daysUntil === 0
          ? 'TODAY'
          : h.daysUntil === 1
            ? 'TOMORROW'
            : `in ${h.daysUntil} days`;
      console.log(`   ${h.name} - ${days} [${h.category}]`);
    });

    console.log('\n✅ All systems operational!');
    console.log('\n🎉 Holiday Hub is ready to use!');
    console.log('   Dashboard: http://localhost:3001');
    console.log('   Total holidays: ' + holidays.length);
    console.log('   Categories: ' + Object.keys(byCategory).length);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure dev server is running: npm run dev');
    console.log('2. Visit http://localhost:3001 in your browser');
    console.log('3. Sign in with Google or GitHub');
    console.log('4. Then run this script again');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

finalVerification();
