// Comprehensive registration form validation test
async function testValidation() {
  console.log('🧪 Testing registration validation...\n');

  // Test 1: Missing email
  console.log('Test 1: Empty email');
  let response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: '',
      password: 'password123',
      timezone: 'America/New_York',
      countryCode: 'US',
    }),
  });
  let data = await response.json();
  console.log('Status:', response.status, '| Expected: 400');
  console.log('Error:', data.error || data.details?.[0]?.message);
  console.log(response.status === 400 ? '✅ Pass\n' : '❌ Fail\n');

  // Test 2: Invalid email format
  console.log('Test 2: Invalid email format');
  response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'not-an-email',
      password: 'password123',
      timezone: 'America/New_York',
      countryCode: 'US',
    }),
  });
  data = await response.json();
  console.log('Status:', response.status, '| Expected: 400');
  console.log('Error:', data.error || data.details?.[0]?.message);
  console.log(response.status === 400 ? '✅ Pass\n' : '❌ Fail\n');

  // Test 3: Password too short
  console.log('Test 3: Password too short');
  response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: '12345',
      timezone: 'America/New_York',
      countryCode: 'US',
    }),
  });
  data = await response.json();
  console.log('Status:', response.status, '| Expected: 400');
  console.log('Error:', data.error || data.details?.[0]?.message);
  console.log(response.status === 400 ? '✅ Pass\n' : '❌ Fail\n');

  // Test 4: Valid registration
  console.log('Test 4: Valid registration');
  const testEmail = `test-${Date.now()}@example.com`;
  response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
      timezone: 'America/New_York',
      countryCode: 'US',
    }),
  });
  data = await response.json();
  console.log('Status:', response.status, '| Expected: 201');
  console.log('User created:', data.user?.email);
  console.log(response.status === 201 ? '✅ Pass\n' : '❌ Fail\n');

  // Test 5: Duplicate email
  console.log('Test 5: Duplicate email');
  response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
      timezone: 'America/New_York',
      countryCode: 'US',
    }),
  });
  data = await response.json();
  console.log('Status:', response.status, '| Expected: 400');
  console.log('Error:', data.error);
  console.log(response.status === 400 ? '✅ Pass\n' : '❌ Fail\n');

  console.log('🎉 All validation tests completed!');
}

testValidation().then(() => process.exit(0));
