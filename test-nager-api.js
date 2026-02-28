// Test Nager.Date API response format
async function testNagerAPI() {
  try {
    const response = await fetch(
      'https://date.nager.at/api/v3/PublicHolidays/2026/US',
    );
    const data = await response.json();

    console.log('\nNager.Date API Response (first 3 holidays):\n');
    data.slice(0, 3).forEach((holiday) => {
      console.log(JSON.stringify(holiday, null, 2));
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

testNagerAPI();
