// Test script to sync holidays from Nager.Date API
// Run this after logging in to get a valid session

async function syncHolidays() {
  try {
    console.log('Syncing holidays for US (2026)...');

    const response = await fetch('http://localhost:3000/api/holidays/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryCode: 'US',
        year: 2026,
      }),
      credentials: 'include', // Important for session cookies
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✓ Sync successful!');
      console.log(data);
    } else {
      console.error('✗ Sync failed:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

syncHolidays();
