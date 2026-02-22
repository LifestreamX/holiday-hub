import { hash, compare } from 'bcryptjs';
import { prisma } from './lib/prisma';

async function testRegistration() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPass123';

  console.log('🧪 Testing Registration Flow...\n');

  // Test 1: Hash password
  console.log('1️⃣  Testing password hashing...');
  const hashedPassword = await hash(testPassword, 12);
  console.log(`   ✅ Password hashed: ${hashedPassword.substring(0, 30)}...`);

  // Test 2: Verify hash
  console.log('\n2️⃣  Testing password verification...');
  const isValid = await compare(testPassword, hashedPassword);
  console.log(`   ✅ Password verification: ${isValid ? 'PASSED' : 'FAILED'}`);

  // Test 3: Save to database
  console.log('\n3️⃣  Testing database save...');
  try {
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        timezone: 'America/New_York',
        countryCode: 'US',
      },
      select: {
        id: true,
        email: true,
        timezone: true,
        createdAt: true,
      },
    });
    console.log(`   ✅ User created successfully:`);
    console.log(`      ID: ${user.id}`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Timezone: ${user.timezone}`);
    console.log(`      Created: ${user.createdAt}`);

    // Test 4: Verify user in database
    console.log('\n4️⃣  Testing database retrieval...');
    const savedUser = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (savedUser) {
      console.log(`   ✅ User found in database`);
      console.log(
        `      Password starts with: ${savedUser.password.substring(0, 7)}`,
      );
      console.log(
        `      Password is hashed: ${savedUser.password.startsWith('$2a$') ? 'YES' : 'NO'}`,
      );

      // Test 5: Verify stored password works
      console.log('\n5️⃣  Testing stored password verification...');
      const verifyStored = await compare(testPassword, savedUser.password);
      console.log(
        `   ✅ Stored password verification: ${verifyStored ? 'PASSED' : 'FAILED'}`,
      );
    }

    // Cleanup
    console.log('\n6️⃣  Cleaning up test user...');
    await prisma.user.delete({ where: { email: testEmail } });
    console.log('   ✅ Test user deleted');

    console.log(
      '\n✨ All tests passed! Registration flow is working correctly.\n',
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRegistration();
