const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting registration-success test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/register', {
      waitUntil: 'networkidle2',
    });
    
    console.log('Filling form with unique email...');
    const uniqueEmail = `user-${Date.now()}@test.com`;
    
    await page.type('input#email', uniqueEmail);
    await page.type('input#password', 'TestPassword123!');
    await page.type('input#confirmPassword', 'TestPassword123!');
    
    console.log(`Testing with email: ${uniqueEmail}`);
    
    await page.click('button[type="submit"]');
    console.log('Submit clicked. Waiting for redirect...');
    
    // Wait for navigation to login page
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/login')) {
      console.log('✅ SUCCESS! Redirected to login page!');
    } else {
      console.log('❌ Did not redirect to login. Check for errors.');
    }
    
    await browser.close();
  } catch (error) {
    console.error('Test error:', error.message);
    await browser.close();
  }
})();
