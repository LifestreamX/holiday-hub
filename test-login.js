const puppeteer = require('puppeteer');

(async () => {
  console.log('Testing login flow...');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // First register a new user
    const testEmail = `login-test-${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';

    console.log('1. Registering test user...');
    await page.goto('http://localhost:3000/register', {
      waitUntil: 'networkidle2',
    });

    await page.type('input#email', testEmail);
    await page.type('input#password', testPassword);
    await page.type('input#confirmPassword', testPassword);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    console.log('✓ User registered');

    // Wait for login page to load
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });

    // Now try to login
    console.log('2. Testing login...');
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', testPassword);
    await page.waitForSelector('button[type="button"]', { timeout: 5000 });
    await page.click('button[type="button"]');

    console.log('Waiting for authentication...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    if (finalUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS! Logged in and redirected to dashboard!');
    } else {
      console.log(`Current URL: ${finalUrl}`);
      const errorText = await page.evaluate(() => {
        const errorEl = document.querySelector('[role="alert"], .text-red-600');
        return errorEl ? errorEl.textContent : 'No error found';
      });
      console.log(`Error message: ${errorText}`);
    }

    await browser.close();
  } catch (error) {
    console.error('Test error:', error.message);
    await browser.close();
  }
})();
