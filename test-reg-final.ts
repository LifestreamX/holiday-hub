// Test registration API
async function testRegistration() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123';

  console.log('🧪 Testing registration API...');
  console.log('📧 Email:', testEmail);
  console.log('🔑 Password:', testPassword);

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        timezone: 'America/New_York',
        countryCode: 'US',
      }),
    });

    const data = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📡 Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Registration successful!');
      return { success: true, data };
    } else {
      console.log('❌ Registration failed:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('💥 Error:', error);
    return { success: false, error: String(error) };
  }
}

testRegistration().then(() => process.exit(0));
