// Quick test to verify registration endpoint
async function testRegistrationEndpoint() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testData = {
    email: testEmail,
    password: 'TestPass123',
    timezone: 'America/New_York',
    countryCode: 'US',
  };

  console.log('🧪 Testing registration endpoint...');
  console.log('📤 Sending:', { ...testData, password: '***' });

  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });

    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📥 Response data:', data);

    if (response.ok) {
      console.log('✅ Registration API is working!');
      console.log('📧 Test user created:', testEmail);
    } else {
      console.log('❌ Registration failed:', data.error);
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testRegistrationEndpoint();
