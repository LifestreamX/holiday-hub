const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function main() {
  const base = process.env.CRON_BASE_URL || 'http://localhost:3000';
  const secret = process.env.CRON_SECRET;
  const url = `${base}/api/cron/notify`;
  const headers = { 'Content-Type': 'application/json' };
  if (secret) headers['Authorization'] = `Bearer ${secret}`;
  console.log('Posting to', url);
  const res = await fetch(url, { method: 'POST', headers });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
