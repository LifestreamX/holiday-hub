const fs = require('fs');
const puppeteer = require('puppeteer');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function registerTestUser(email, password) {
  const res = await fetch(`${BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res;
}

async function run() {
  const timestamp = Date.now();
  const email = `e2e+${timestamp}@example.com`;
  const password = 'TestPass123!';

  console.log('Registering test user:', email);
  try {
    const r = await registerTestUser(email, password);
    if (r.status === 201) {
      console.log('User created');
    } else if (r.status === 409) {
      console.log('User already exists, continuing');
    } else {
      console.warn('Register returned', r.status);
    }
  } catch (err) {
    console.error(
      'Registration failed, continuing to attempt signin:',
      String(err),
    );
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  console.log('Navigating to login page');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });

  // Fill credentials and submit
  await page.type('#email', email);
  await page.type('#password', password);

  await Promise.all([
    page
      .waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
      .catch(() => {}),
    page.click('button[type=submit]'),
  ]);

  // Ensure we're on the dashboard
  try {
    await page.waitForSelector('main', { timeout: 10000 });
  } catch (e) {
    console.error('Did not land on dashboard. Check login flow.');
    await browser.close();
    process.exit(1);
  }

  console.log('Fetching country list from API');
  const countriesResp = await fetch(`${BASE}/api/holidays/countries`);
  if (!countriesResp.ok) {
    console.error('Failed to fetch countries', countriesResp.status);
    await browser.close();
    process.exit(1);
  }
  const countries = await countriesResp.json();

  // Prepend the ALL option
  const allOption = {
    countryCode: 'ALL',
    name: 'All countries',
    count: countries.reduce((s, c) => s + (c.count || 0), 0),
  };
  const list = [allOption, ...countries];

  const limit = Math.min(list.length, 200);
  const results = [];

  for (let i = 0; i < limit; i++) {
    const c = list[i];
    const value = c.countryCode;
    console.log(`Selecting ${i + 1}/${limit}: ${c.name} (${value})`);

    // Wait for the /api/holidays response triggered by selecting the country
    const waitForApi = page
      .waitForResponse(
        (resp) => resp.url().includes('/api/holidays') && resp.status() === 200,
        { timeout: 15000 },
      )
      .catch(() => null);

    // Use the select by title attribute present in dashboard
    try {
      await page.select(
        'select[title="Select country to view holidays"]',
        value,
      );
    } catch (e) {
      // If select fails (option not present), try setting view via window and calling fetch
      await page.evaluate((v) => {
        const sel = document.querySelector(
          'select[title="Select country to view holidays"]',
        );
        if (sel) sel.value = v;
        // trigger change
        const ev = new Event('change', { bubbles: true });
        sel && sel.dispatchEvent(ev);
      }, value);
    }

    const apiResp = await waitForApi;
    let count = 0;
    let apiBody = null;
    if (apiResp) {
      try {
        apiBody = await apiResp.json();
        if (Array.isArray(apiBody)) count = apiBody.length;
      } catch (e) {
        // ignore parse errors
      }
    } else {
      // No successful API response caught — fall back to counting DOM nodes
      count = await page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return 0;
        return main.querySelectorAll('h3').length;
      });
    }

    console.log(`Found ${count} holiday items for ${value}`);
    results.push({
      countryCode: value,
      name: c.name,
      count,
      apiSample: Array.isArray(apiBody) ? apiBody.slice(0, 3) : null,
    });
  }

  await browser.close();

  const outPath = 'scripts/e2e-results.json';
  fs.writeFileSync(
    outPath,
    JSON.stringify({ base: BASE, timestamp: Date.now(), results }, null, 2),
  );
  console.log('Results written to', outPath);
}

run().catch((err) => {
  console.error('E2E run error:', err);
  process.exit(1);
});
