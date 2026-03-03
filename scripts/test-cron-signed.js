const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const crypto = require('crypto');

async function main() {
  const base = process.env.CRON_BASE_URL || 'http://localhost:3000';
  const page = process.env.PAGE || process.argv[2] || ''; // optional
  const size = process.env.SIZE || process.argv[3] || '';
  const key = process.env.QSTASH_CURRENT_SIGNING_KEY;

  let url = `${base}/api/cron/notify`;
  const params = new URLSearchParams();
  if (page) params.set('page', page);
  if (size) params.set('size', size);
  if ([...params].length) url += `?${params.toString()}`;

  const body = JSON.stringify({}); // empty JSON body (route reads text)
  const headers = { 'Content-Type': 'application/json' };

  if (!key) {
    console.warn(
      'QSTASH_CURRENT_SIGNING_KEY not set in env; request will be unsigned and likely rejected.',
    );
  } else {
    const sig = crypto.createHmac('sha256', key).update(body).digest('hex');
    headers['Upstash-Signature'] = sig;
  }

  console.log('Posting to', url);
  const res = await fetch(url, { method: 'POST', headers, body });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
