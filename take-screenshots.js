const puppeteer = require('puppeteer');

(async () => {
  console.log('Taking screenshot of register page...');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:3000/register', {
    waitUntil: 'networkidle2',
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await page.screenshot({
    path: 'register-page-screenshot.png',
    fullPage: true,
  });
  console.log('✓ Screenshot saved: register-page-screenshot.png');

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.screenshot({ path: 'login-page-screenshot.png', fullPage: true });
  console.log('✓ Screenshot saved: login-page-screenshot.png');

  await browser.close();
  console.log('✅ Screenshots complete!');
})();
