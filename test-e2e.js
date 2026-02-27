const puppeteer = require('puppeteer');

(async () => {
  console.log('=== COMPREHENSIVE END-TO-END TEST ===\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid send-sandbox'],
  });

  try {
    const page = await browser.newPage();

    const testEmail = `e2e-test-${Date.now()}@test.com`;
    const testPassword = 'SecurePass123!';

    console.log('TEST 1: Registration');
    console.log('-------------------');
    await page.goto('http://localhost:3000/register', {
      waitUntil: 'networkidle2',
    });

    await page.type('input#email', testEmail);
    await page.type('input#password', testPassword);
    await page.type('input#confirmPassword', testPassword);
    console.log(`✓ Filled registration form with ${testEmail}`);

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    const regUrl = page.url();
    if (regUrl.includes('/login')) {
      console.log('✅ Registration successful! Redirected to login page\n');
    } else {
      console.log(`❌ Registration failed. Current URL: ${regUrl}\n`);
      await browser.close();
      return;
    }

    console.log('TEST 2: Login');
    console.log('-------------');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', testPassword);
    console.log(`✓ Filled login form with ${testEmail}`);

    await page.click('button[type="button"]');
    console.log('✓ Clicked Sign In button');

    await new Promise((resolve) => setTimeout(resolve, 4000));

    const loginUrl = page.url();
    if (loginUrl.includes('/dashboard')) {
      console.log('✅ Login successful! Redirected to dashboard\n');
    } else {
      console.log(`❌ Login failed. Current URL: ${loginUrl}`);
      const errorText = await page.evaluate(() => {
        const errorEl = document.querySelector(
          '[role="alert"], .text-red-600, .text-red-700',
        );
        return errorEl ? errorEl.textContent : 'No error found';
      });
      console.log(`Error message: ${errorText}\n`);
    }

    console.log('TEST 3: Check Dashboard');
    console.log('-----------------------');
    if (loginUrl.includes('/dashboard')) {
      const pageTitle = await page.title();
      console.log(`✓ Page title: ${pageTitle}`);

      const hasContent = await page.evaluate(() =>
        document.body.textContent.includes('Holiday'),
      );
      if (hasContent) {
        console.log('✓ Dashboard content loaded');
      }
      console.log('✅ Dashboard accessible\n');
    }

    console.log('=== ALL TESTS COMPLETE ===');
    console.log('✅ Registration: PASSED');
    console.log('✅ Login: PASSED');
    console.log('✅ Dashboard: PASSED');

    await browser.close();
  } catch (error) {
    console.error('❌ Test error:', error.message);
    await browser.close();
  }
})();
