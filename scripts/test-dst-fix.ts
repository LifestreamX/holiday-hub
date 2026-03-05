#!/usr/bin/env tsx
/**
 * Comprehensive test of getDaysBetween with DST transitions
 */

import { getDaysBetween, getStartOfDayInTimezone, createDateInTimezone } from '../lib/dateUtils';

console.log('Testing getDaysBetween with DST transitions\n');
console.log('='.repeat(80));
console.log();

// Test 1: Simple case - no DST
console.log('Test 1: Same timezone, no DST');
const jan1 = new Date('2026-01-01T00:00:00Z');
const jan8 = new Date('2026-01-08T00:00:00Z');
const days1 = getDaysBetween(jan1, jan8);
console.log(`  Jan 1 to Jan 8: ${days1} days (expected: 7)`);
console.log(`  ✓ ${days1 === 7 ? 'PASS' : 'FAIL'}\n`);

// Test 2: DST spring forward (March 8, 2026 in US)
console.log('Test 2: Spring forward DST transition');
const mar4 = createDateInTimezone(2026, 3, 4, 'America/New_York'); // Before DST
const mar11 = createDateInTimezone(2026, 3, 11, 'America/New_York'); // After DST
const days2 = getDaysBetween(mar4, mar11);
console.log(`  March 4 to March 11 (America/New_York): ${days2} days (expected: 7)`);
console.log(`  March 4: ${mar4.toISOString()}`);
console.log(`  March 11: ${mar11.toISOString()}`);
console.log(`  ✓ ${days2 === 7 ? 'PASS' : 'FAIL'}\n`);

// Test 3: Across month boundary with DST
console.log('Test 3: Across month boundary with DST');
const mar4_2 = createDateInTimezone(2026, 3, 4, 'America/New_York');
const apr3 = createDateInTimezone(2026, 4, 3, 'America/New_York');
const days3 = getDaysBetween(mar4_2, apr3);
console.log(`  March 4 to April 3 (America/New_York): ${days3} days (expected: 30)`);
console.log(`  March 4: ${mar4_2.toISOString()}`);
console.log(`  April 3: ${apr3.toISOString()}`);
console.log(`  ✓ ${days3 === 30 ? 'PASS' : 'FAIL'}\n`);

// Test 4: Fall back DST transition (Nov 1, 2026 in US)
console.log('Test 4: Fall back DST transition');
const oct28 = createDateInTimezone(2026, 10, 28, 'America/New_York'); // Before fall back
const nov4 = createDateInTimezone(2026, 11, 4, 'America/New_York'); // After fall back
const days4 = getDaysBetween(oct28, nov4);
console.log(`  Oct 28 to Nov 4 (America/New_York): ${days4} days (expected: 7)`);
console.log(`  Oct 28: ${oct28.toISOString()}`);
console.log(`  Nov 4: ${nov4.toISOString()}`);
console.log(`  ✓ ${days4 === 7 ? 'PASS' : 'FAIL'}\n`);

// Test 5: Using getStartOfDayInTimezone
console.log('Test 5: Using getStartOfDayInTimezone (current scenario)');
const now = new Date('2026-03-05T02:00:00Z'); // Current time (UTC)
const today = getStartOfDayInTimezone(now, 'America/New_York');
const holiday1Week = createDateInTimezone(2026, 3, 11, 'America/New_York');
const holiday1Month = createDateInTimezone(2026, 4, 3, 'America/New_York');

const days5a = getDaysBetween(today, holiday1Week);
const days5b = getDaysBetween(today, holiday1Month);

console.log(`  Today (March 4): ${today.toISOString()}`);
console.log(`  1 Week Holiday (March 11): ${holiday1Week.toISOString()}`);
console.log(`  Days until 1 week: ${days5a} (expected: 7)`);
console.log(`  ✓ ${days5a === 7 ? 'PASS' : 'FAIL'}`);
console.log();
console.log(`  1 Month Holiday (April 3): ${holiday1Month.toISOString()}`);
console.log(`  Days until 1 month: ${days5b} (expected: 30)`);
console.log(`  ✓ ${days5b === 30 ? 'PASS' : 'FAIL'}\n`);

// Summary
console.log('='.repeat(80));
const allPass = days1 === 7 && days2 === 7 && days3 === 30 && days4 === 7 && days5a === 7 && days5b === 30;
if (allPass) {
  console.log('✓ ALL TESTS PASSED - DST bug is fixed!');
} else {
  console.log('✗ SOME TESTS FAILED - DST bug still exists');
  process.exit(1);
}
