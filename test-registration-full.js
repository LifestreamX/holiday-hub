const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  // Listen for console messages (including errors)
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
  });

  // Listen for page errors
  page.on('pageerror', (error) => {
    console.log('[PAGE ERROR]:', error.message);
    console.log('[PAGE ERROR STACK]:', error.stack);
  });

  // Listen for failed requests
  page.on('requestfailed', (request) => {
    console.log(
      '[REQUEST FAILED]:',
      request.url(),
      request.failure().errorText,
    );
  });

  try {
    console.log('Navigating to registration page...');
    await page.goto('http://localhost:3000/register', {
      waitUntil: 'networkidle2',
      timeout: 10000,
    });

    console.log('Page loaded. Checking for errors...');

    // Wait for React to hydrate
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Filling form...');

    // Fill the registration form
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[id="password"]', 'testpassword123');
    await page.type('input[id="confirmPassword"]', 'testpassword123');

    console.log('Form filled. Clicking submit button...');

    // Click the submit button
    await page.click('button[type="submit"]');

    console.log('Submit button clicked. Waiting for response...');

    // Wait for response
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check for error messages on page
    const errorText = await page.evaluate(() => {
      const errorDiv = document.querySelector(
        '[role="alert"], .text-red-600, .text-red-700, .border-red-300',
      );
      return errorDiv ? errorDiv.textContent : 'No error message found';
    });
    console.log('Error message on page:', errorText);

    // Check if form inputs are still filled
    const emailValue = await page.$eval(
      'input[type="email"]',
      (el) => el.value,
    );
    console.log('Email input value after submit:', emailValue);

    console.log('\n=== TEST COMPLETE ===');
    console.log(
      'If email is empty, the page refreshed (bad - form handler not working).',
    );
    console.log(
      "If email still has value and we're still on /register, form handler probably didn't work.",
    );
    console.log('If we navigated to /login, form submission worked!');
  } catch (error) {
    console.error('Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    console.log(
      '\nBrowser left open for inspection. Close manually when done.',
    );
  }
})();
