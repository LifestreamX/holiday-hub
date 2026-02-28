/**
 * UI Functionality Test Suite
 * Tests UI interactions and page loads using Puppeteer
 */

const puppeteer = require('puppeteer');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testNum, name, status, details = '') {
  const icon = status === 'pass' ? '✓' : '✗';
  const color = status === 'pass' ? 'green' : 'red';
  log(`${icon} Test ${testNum}: ${name}${details ? ' - ' + details : ''}`, color);
  
  if (status === 'pass') testsPassed++;
  else testsFailed++;
}

async function runTests() {
  log('\n🖥️  UI FUNCTIONALITY TEST SUITE', 'cyan');
  log('='.repeat(60), 'cyan');

  let browser;
  let page;

  try {
    // Launch browser
    log('\n🚀 Launching browser...', 'blue');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Test 1: Homepage loads
    log('\n📄 Tests 1-5: Page Load Tests', 'blue');
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
      const title = await page.title();
      logTest(1, 'Homepage loads', 'pass', `Title: ${title}`);
    } catch (error) {
      logTest(1, 'Homepage loads', 'fail', error.message);
    }

    // Test 2: Login page loads
    try {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 10000 });
      const loginForm = await page.$('form');
      logTest(2, 'Login page loads', loginForm ? 'pass' : 'fail', loginForm ? 'Form found' : 'No form');
    } catch (error) {
      logTest(2, 'Login page loads', 'fail', error.message);
    }

    // Test 3: Register page loads
    try {
      await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2', timeout: 10000 });
      const registerForm = await page.$('form');
      logTest(3, 'Register page loads', registerForm ? 'pass' : 'fail', registerForm ? 'Form found' : 'No form');
    } catch (error) {
      logTest(3, 'Register page loads', 'fail', error.message);
    }

    // Test 4: API responds - holidays
    try {
      const response = await page.goto('http://localhost:3000/api/holidays', { timeout: 10000 });
      const status = response.status();
      // 401 is expected if not logged in
      logTest(4, 'Holidays API responds', status === 401 || status === 200 ? 'pass' : 'fail', `Status: ${status}`);
    } catch (error) {
      logTest(4, 'Holidays API responds', 'fail', error.message);
    }

    // Test 5: API responds - user
    try {
      const response = await page.goto('http://localhost:3000/api/user', { timeout: 10000 });
      const status = response.status();
      // 401 is expected if not logged in
      logTest(5, 'User API responds', status === 401 || status === 200 ? 'pass' : 'fail', `Status: ${status}`);
    } catch (error) {
      logTest(5, 'User API responds', 'fail', error.message);
    }

    // Test 6-10: UI Element Tests
    log('\n🎨 Tests 6-10: UI Element Tests', 'blue');
    
    // Test 6: Login page has email field
    try {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 10000 });
      const emailInput = await page.$('input[type="email"]');
      logTest(6, 'Login email field exists', emailInput ? 'pass' : 'fail');
    } catch (error) {
      logTest(6, 'Login email field exists', 'fail', error.message);
    }

    // Test 7: Login page has password field
    try {
      const passwordInput = await page.$('input[type="password"]');
      logTest(7, 'Login password field exists', passwordInput ? 'pass' : 'fail');
    } catch (error) {
      logTest(7, 'Login password field exists', 'fail', error.message);
    }

    // Test 8: Login page has submit button
    try {
      const submitButton = await page.$('button[type="submit"]');
      logTest(8, 'Login submit button exists', submitButton ? 'pass' : 'fail');
    } catch (error) {
      logTest(8, 'Login submit button exists', 'fail', error.message);
    }

    // Test 9: Register page has name field
    try {
      await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2', timeout: 10000 });
      const nameInput = await page.$('input[name="name"], input#name');
      logTest(9, 'Register name field exists', nameInput ? 'pass' : 'fail');
    } catch (error) {
      logTest(9, 'Register name field exists', 'fail', error.message);
    }

    // Test 10: Register page has email field
    try {
      const emailInput = await page.$('input[type="email"]');
      logTest(10, 'Register email field exists', emailInput ? 'pass' : 'fail');
    } catch (error) {
      logTest(10, 'Register email field exists', 'fail', error.message);
    }

    // Test 11-15: Responsive Design Tests
    log('\n📱 Tests 11-15: Responsive Design Tests', 'blue');
    
    // Test 11: Mobile viewport
    try {
      await page.setViewport({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 10000 });
      logTest(11, 'Mobile viewport renders', 'pass', '375x667');
    } catch (error) {
      logTest(11, 'Mobile viewport renders', 'fail', error.message);
    }

    // Test 12: Tablet viewport
    try {
      await page.setViewport({ width: 768, height: 1024 });
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 10000 });
      logTest(12, 'Tablet viewport renders', 'pass', '768x1024');
    } catch (error) {
      logTest(12, 'Tablet viewport renders', 'fail', error.message);
    }

    // Test 13: Desktop viewport
    try {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 10000 });
      logTest(13, 'Desktop viewport renders', 'pass', '1920x1080');
    } catch (error) {
      logTest(13, 'Desktop viewport renders', 'fail', error.message);
    }

    // Test 14: Navigation links work
    try {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 10000 });
      const registerLink = await page.$('a[href*="register"]');
      logTest(14, 'Register link exists on login page', registerLink ? 'pass' : 'fail');
    } catch (error) {
      logTest(14, 'Register link exists on login page', 'fail', error.message);
    }

    // Test 15: Service worker file exists
    try {
      const response = await page.goto('http://localhost:3000/sw.js', { timeout: 10000 });
      const status = response.status();
      logTest(15, 'Service worker file exists', status === 200 ? 'pass' : 'fail', `Status: ${status}`);
    } catch (error) {
      logTest(15, 'Service worker file exists', 'fail', error.message);
    }

    // Test 16-20: Performance Tests
    log('\n⚡ Tests 16-20: Performance Tests', 'blue');
    
    // Test 16: Homepage loads quickly
    try {
      const start = Date.now();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
      const loadTime = Date.now() - start;
      logTest(16, 'Homepage load time', loadTime < 3000 ? 'pass' : 'fail', `${loadTime}ms`);
    } catch (error) {
      logTest(16, 'Homepage load time', 'fail', error.message);
    }

    // Test 17: Login page loads quickly
    try {
      const start = Date.now();
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 10000 });
      const loadTime = Date.now() - start;
      logTest(17, 'Login page load time', loadTime < 3000 ? 'pass' : 'fail', `${loadTime}ms`);
    } catch (error) {
      logTest(17, 'Login page load time', 'fail', error.message);
    }

    // Test 18: Check for console errors
    let consoleErrors = 0;
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors++;
    });
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logTest(18, 'No console errors on homepage', consoleErrors === 0 ? 'pass' : 'fail', `${consoleErrors} errors`);
    } catch (error) {
      logTest(18, 'No console errors on homepage', 'fail', error.message);
    }

    // Test 19: Check for 404 errors
    let has404 = false;
    page.on('response', (response) => {
      if (response.status() === 404) has404 = true;
    });
    try {
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 10000 });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logTest(19, 'No 404 errors on login page', !has404 ? 'pass' : 'fail');
    } catch (error) {
      logTest(19, 'No 404 errors on login page', 'fail', error.message);
    }

    // Test 20: Static assets load
    try {
      const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
      const hasContent = (await response.text()).length > 1000;
      logTest(20, 'Page has content', hasContent ? 'pass' : 'fail', `${(await response.text()).length} chars`);
    } catch (error) {
      logTest(20, 'Page has content', 'fail', error.message);
    }

  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`✓ Tests Passed: ${testsPassed}`, 'green');
  log(`✗ Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`🖥️  Total Tests: ${testsPassed + testsFailed}`, 'cyan');
  
  const successRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2);
  log(`\n✨ Success Rate: ${successRate}%`, parseFloat(successRate) >= 90 ? 'green' : parseFloat(successRate) >= 70 ? 'yellow' : 'red');

  return {
    passed: testsPassed,
    failed: testsFailed,
    successRate,
  };
}

// Run tests
runTests().catch(console.error);
