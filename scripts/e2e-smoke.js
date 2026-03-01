const puppeteer = require('puppeteer');
const crypto = require('crypto');

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // Relay page console messages to the test runner for debugging
  page.on('console', (msg) => {
    try {
      const text = msg.text();
      console.log('PAGE LOG:', text);
    } catch (e) {}
  });

  const base = process.env.BASE_URL || 'http://localhost:3000';

  try {
    const email = `smoke+${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log('Registering user', email);
    await page.goto(`${base}/register`, { waitUntil: 'networkidle0' });
    // wait for the registration form to hydrate and appear
    await page.waitForSelector('#email', { timeout: 60000 });
    await page.type('#email', email);
    await page.type('#password', password);
    await page.type('#confirmPassword', password);
    await page.click('button[type="submit"]');
    // The app performs a client-side router.replace to /login; wait briefly for it to complete
    await new Promise((r) => setTimeout(r, 1000));

    console.log('Navigating to login');
    await page.goto(`${base}/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#email', { timeout: 60000 });
    await page.type('#email', email);
    await page.type('#password', password);
    await page.click('button[type="submit"]');
    // wait for client-side navigation to dashboard (router.push)
    await page.waitForFunction(
      () => window.location.pathname.includes('/dashboard'),
      { timeout: 60000 },
    );

    const url = page.url();
    console.log('After login URL:', url);

    // Wait for client-side hydration to render the dashboard header
    try {
      await page.waitForFunction(
        () => {
          const h = document.querySelector('h1');
          return !!(h && h.innerText.includes('Your Holidays'));
        },
        { timeout: 60000 },
      );

      console.log('SMOKE TEST PASSED: Dashboard header present');
      await browser.close();
      process.exit(0);
    } catch (e) {
      const content = await page.content();
      console.error('SMOKE TEST FAILED: Dashboard header missing');
      console.log('Dashboard content length:', content.length);
      console.log('Dashboard content snippet:', content.slice(0, 400));
      await browser.close();
      process.exit(2);
    }
  } catch (err) {
    console.error('SMOKE TEST ERROR:', err);
    await browser.close();
    process.exit(1);
  }
}

run();
