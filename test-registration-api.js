// Test the registration API endpoint
const testEmail = `test${Date.now()}@example.com`;

async function testRegistration() {
  try {
    console.log('Testing registration with email:', testEmail);

    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'test123',
        timezone: 'America/New_York',
        countryCode: 'US',
      }),
    });

    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('ERROR: Registration failed');
      console.error('Error details:', data.error);
      if (data.details) {
        console.error('Validation errors:', data.details);
      }
    } else {
      console.log('SUCCESS: User created!');
    }
  } catch (error) {
    console.error('EXCEPTION:', error.message);
    console.error('Full error:', error);
  }
}

testRegistration();
