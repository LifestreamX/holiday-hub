// Check all holidays from Nager.Date for US 2026
async function checkAllHolidays() {
  try {
    const response = await fetch(
      'https://date.nager.at/api/v3/PublicHolidays/2026/US',
    );
    const data = await response.json();

    console.log(`\nTotal holidays from Nager.Date: ${data.length}\n`);

    // Group by type
    const byType = {};
    const byGlobal = { global: [], state: [] };

    data.forEach((holiday) => {
      // By type
      holiday.types.forEach((type) => {
        if (!byType[type]) byType[type] = [];
        byType[type].push(holiday.name);
      });

      // By scope
      if (holiday.global) {
        byGlobal.global.push(holiday.name);
      } else {
        byGlobal.state.push(
          `${holiday.name} (${holiday.counties?.length || 0} states)`,
        );
      }
    });

    console.log('=== By Type ===');
    Object.entries(byType).forEach(([type, holidays]) => {
      console.log(`\n${type} (${holidays.length}):`);
      holidays.forEach((h) => console.log(`  - ${h}`));
    });

    console.log('\n=== By Scope ===');
    console.log(`\nGlobal/Federal (${byGlobal.global.length}):`);
    byGlobal.global.forEach((h) => console.log(`  - ${h}`));

    console.log(`\nState-Specific (${byGlobal.state.length}):`);
    byGlobal.state.forEach((h) => console.log(`  - ${h}`));

    console.log('\n=== All Raw Data ===\n');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllHolidays();
