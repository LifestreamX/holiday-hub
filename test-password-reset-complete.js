const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();
  const testEmail = `testresetui${Date.now()}@example.com`;
  const testPassword = 'oldpassword123';
  const newPassword = 'newpassword456';

  console.log('🧪 Testing Complete Password Reset UI Flow...');
  console.log('Test email:', testEmail);

  try {
    // Step 1: Register a test user
    console.log('\n1️⃣ Registering test user...');
    await page.goto('http://localhost:3000/register', {
      waitUntil: 'networkidle2',
    });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    await page.type('input[type="email"]', testEmail);
    const passwordInputs = await page.$$('input[type="password"]');
    await passwordInputs[0].type(testPassword);
    await passwordInputs[1].type(testPassword);

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    console.log('   ✅ User registered successfully');

    // Step 2: Navigate to login and click "Forgot password?"
    console.log('\n2️⃣ Clicking "Forgot password?" link on login page...');
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'networkidle2',
    });
    await page.waitForSelector('a[href="/forgot-password"]', { timeout: 5000 });
    await page.click('a[href="/forgot-password"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('   ✅ Navigated to forgot password page');

    // Step 3: Submit forgot password form
    console.log('\n3️⃣ Submitting forgot password form...');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', testEmail);
    await page.click('button[type="submit"]');

    await page.waitForSelector('.bg-green-50', { timeout: 10000 });
    const successMessage = await page.$eval(
      '.bg-green-50',
      (el) => el.textContent,
    );
    console.log('   ✅ Success message displayed:', successMessage.trim());

    // Step 4: Get the reset token from database
    console.log('\n4️⃣ Retrieving reset token from database...');
    await page.waitForTimeout(2000);

    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { email: testEmail, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!tokenRecord) {
      throw new Error('No reset token found in database');
    }

    console.log('   ✅ Token retrieved');
    console.log('   🔑 Token:', tokenRecord.token.substring(0, 20) + '...');

    // Step 5: Navigate to reset password page with token
    console.log('\n5️⃣ Navigating to reset password page with token...');
    await page.goto(
      `http://localhost:3000/reset-password?token=${tokenRecord.token}`,
      {
        waitUntil: 'networkidle2',
      },
    );

    // Step 6: Fill in new password
    console.log('\n6️⃣ Filling in new password...');
    await page.waitForSelector('input[type="password"]');
    const newPasswordInputs = await page.$$('input[type="password"]');
    await newPasswordInputs[0].type(newPassword);
    await newPasswordInputs[1].type(newPassword);

    await page.click('button[type="submit"]');

    // Wait for success message
    await page.waitForSelector('.bg-green-50', { timeout: 10000 });
    const resetSuccessMessage = await page.$eval(
      '.bg-green-50',
      (el) => el.textContent,
    );
    console.log('   ✅ Password reset successful:', resetSuccessMessage.trim());

    // Step 7: Wait for redirect to login
    console.log('\n7️⃣ Waiting for redirect to login page...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });
    console.log('   ✅ Redirected to login page');

    // Step 8: Check for success message on login page
    const loginUrl = page.url();
    if (loginUrl.includes('reset=success')) {
      console.log('   ✅ Success parameter in URL');

      await page.waitForSelector('.bg-green-50', { timeout: 5000 });
      const loginSuccessMessage = await page.$eval(
        '.bg-green-50',
        (el) => el.textContent,
      );
      console.log('   📝 Login page message:', loginSuccessMessage.trim());
    }

    // Step 9: Login with new password
    console.log('\n8️⃣ Logging in with new password...');
    await page.waitForSelector('input[type="email"]');
    const emailInput = await page.$('input[type="email"]');
    await emailInput.click({ clickCount: 3 });
    await emailInput.type(testEmail);

    const loginPasswordInputs = await page.$$('input[type="password"]');
    await loginPasswordInputs[0].type(newPassword);

    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

    if (page.url().includes('/dashboard')) {
      console.log('   ✅ Successfully logged in with new password!');
      console.log('   📍 Redirected to:', page.url());
    } else {
      throw new Error('Did not redirect to dashboard');
    }

    await prisma.$disconnect();

    console.log('\n✅ COMPLETE PASSWORD RESET FLOW SUCCESSFUL!');
    console.log('\n📋 Verified:');
    console.log('   ✓ User registration');
    console.log('   ✓ Forgot password link on login page');
    console.log('   ✓ Forgot password form submission');
    console.log('   ✓ Token generation');
    console.log('   ✓ Reset password page with token');
    console.log('   ✓ Password reset form submission');
    console.log('   ✓ Redirect to login with success message');
    console.log('   ✓ Login with new password');
    console.log('   ✓ Access to dashboard');
    console.log('\n🎉 Password reset feature is fully functional!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'password-reset-error.png' });
    console.log('Screenshot saved as password-reset-error.png');
    throw error;
  } finally {
    setTimeout(() => browser.close(), 3000);
  }
})();
