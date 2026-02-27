#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.resolve(process.cwd(), '.env.local');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (q) =>
  new Promise((res) => rl.question(q, (ans) => res(ans.trim())));

(async () => {
  console.log('Update your OAuth credentials. Leave blank to skip a value.');
  const googleId = await ask('GOOGLE_CLIENT_ID: ');
  const googleSecret = await ask('GOOGLE_CLIENT_SECRET: ');
  const githubId = await ask('GITHUB_ID: ');
  const githubSecret = await ask('GITHUB_SECRET: ');
  rl.close();

  let env = '';
  if (fs.existsSync(envPath)) env = fs.readFileSync(envPath, 'utf8');

  const set = (key, val, src) => {
    const re = new RegExp('^' + key + '=.*$', 'm');
    if (!val) return src;
    if (re.test(src)) return src.replace(re, `${key}=${val}`);
    return (src || '') + `\n${key}=${val}`;
  };

  env = set('GOOGLE_CLIENT_ID', googleId, env);
  env = set('GOOGLE_CLIENT_SECRET', googleSecret, env);
  env = set('GITHUB_ID', githubId, env);
  env = set('GITHUB_SECRET', githubSecret, env);

  if (!/NEXTAUTH_URL=/.test(env))
    env = (env || '') + '\nNEXTAUTH_URL=http://localhost:3000';
  if (!/NEXTAUTH_SECRET=/.test(env))
    env = (env || '') + '\nNEXTAUTH_SECRET=change-me';

  fs.writeFileSync(envPath, (env || '').trim() + '\n', { mode: 0o600 });
  console.log(
    `Wrote ${envPath}. Restart your dev server after updating env vars.`,
  );
})();
