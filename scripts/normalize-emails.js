#!/usr/bin/env node
/**
 * Normalize emails to lowercase.
 * - Detects duplicates (same lowercased email with multiple user rows).
 * - If duplicates exist, writes a CSV `normalize-email-duplicates.csv` and exits non-zero.
 * - If no duplicates, lowercases all emails in-place.
 *
 * Usage: `node scripts/normalize-emails.js`
 */

const fs = require('fs');
const path = require('path');
const { prisma } = require('../lib/prisma');

async function main() {
  console.log('Scanning users for email normalization...');

  // Fetch id + email for all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, emailVerified: true, createdAt: true },
  });

  const map = new Map();
  for (const u of users) {
    const norm = (u.email || '').toLowerCase();
    if (!map.has(norm)) map.set(norm, []);
    map.get(norm).push(u);
  }

  // Find duplicates
  const duplicates = [...map.entries()].filter(([norm, arr]) => arr.length > 1);

  if (duplicates.length > 0) {
    console.error(
      'Found duplicate emails when normalized. Aborting to avoid data loss.',
    );
    const rows = ['normalized_email,ids,verified_flags,created_at_list'];
    for (const [norm, arr] of duplicates) {
      const ids = arr.map((a) => a.id).join('|');
      const verified = arr.map((a) => (a.emailVerified ? '1' : '0')).join('|');
      const created = arr.map((a) => a.createdAt.toISOString()).join('|');
      rows.push(`${norm},"${ids}","${verified}","${created}"`);
    }
    const out = path.resolve(process.cwd(), 'normalize-email-duplicates.csv');
    fs.writeFileSync(out, rows.join('\n'));
    console.error(
      `Wrote ${out} — review duplicates and decide merge strategy.`,
    );
    process.exit(2);
  }

  console.log('No duplicates found. Lowercasing emails...');

  // Update users in batches
  for (const [norm, arr] of map.entries()) {
    const user = arr[0];
    if (user.email !== norm) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: norm },
      });
      console.log(`Lowercased user ${user.id} -> ${norm}`);
    }
  }

  console.log('Email normalization complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error normalizing emails:', err);
  process.exit(1);
});
