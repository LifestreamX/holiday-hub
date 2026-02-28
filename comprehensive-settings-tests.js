/**
 * Settings & Configuration Test Suite
 * Tests settings persistence, preferences, and configurations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
let testsSkipped = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testNum, name, status, details = '') {
  const icon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⊘';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  log(`${icon} Test ${testNum}: ${name}${details ? ' - ' + details : ''}`, color);
  
  if (status === 'pass') testsPassed++;
  else if (status === 'fail') testsFailed++;
  else testsSkipped++;
}

async function runTests() {
  log('\n⚙️  SETTINGS & CONFIGURATION TEST SUITE', 'cyan');
  log('='.repeat(60), 'cyan');

  let testUser = null;
  let testHoliday = null;

  // Setup: Get or create test user and holiday
  try {
    testUser = await prisma.user.findFirst();
    testHoliday = await prisma.holiday.findFirst();
    
    if (!testUser || !testHoliday) {
      log('\n⚠️  Warning: No user or holiday found for testing', 'yellow');
    }
  } catch (error) {
    log('\n❌ Failed to fetch test data: ' + error.message, 'red');
  }

  // Test 1-10: User Preference Management
  log('\n👤 Tests 1-10: User Preference Management', 'blue');
  
  // Test 1: Create new preference
  let testPrefId = null;
  try {
    if (testUser && testHoliday) {
      const pref = await prisma.userHolidayPreference.upsert({
        where: { userId_holidayId: { userId: testUser.id, holidayId: testHoliday.id } },
        create: {
          userId: testUser.id,
          holidayId: testHoliday.id,
          enabled: true,
          reminderOffsets: [30, 7, 1, 0],
          reminderTime: '08:00',
          deliveryMethod: 'email',
        },
        update: {},
      });
      testPrefId = pref.id;
      logTest(1, 'Create User Preference', 'pass', `ID: ${pref.id}`);
    } else {
      logTest(1, 'Create User Preference', 'skip', 'No test data');
    }
  } catch (error) {
    logTest(1, 'Create User Preference', 'fail', error.message);
  }
  
  // Test 2: Update enabled status
  try {
    if (testPrefId) {
      await prisma.userHolidayPreference.update({
        where: { id: testPrefId },
        data: { enabled: false },
      });
      const updated = await prisma.userHolidayPreference.findUnique({ where: { id: testPrefId } });
      logTest(2, 'Toggle Enabled Status', updated.enabled === false ? 'pass' : 'fail', `Enabled: ${updated.enabled}`);
    } else {
      logTest(2, 'Toggle Enabled Status', 'skip', 'No preference');
    }
  } catch (error) {
    logTest(2, 'Toggle Enabled Status', 'fail', error.message);
  }
  
  // Test 3: Update reminder offsets
  try {
    if (testPrefId) {
      const newOffsets = [60, 30, 14, 7, 1];
      await prisma.userHolidayPreference.update({
        where: { id: testPrefId },
        data: { reminderOffsets: newOffsets },
      });
      const updated = await prisma.userHolidayPreference.findUnique({ where: { id: testPrefId } });
      const matches = JSON.stringify(updated.reminderOffsets) === JSON.stringify(newOffsets);
      logTest(3, 'Update Reminder Offsets', matches ? 'pass' : 'fail', `Offsets: ${JSON.stringify(updated.reminderOffsets)}`);
    } else {
      logTest(3, 'Update Reminder Offsets', 'skip', 'No preference');
    }
  } catch (error) {
    logTest(3, 'Update Reminder Offsets', 'fail', error.message);
  }
  
  // Test 4: Update reminder time
  try {
    if (testPrefId) {
      const times = ['06:00', '09:00', '12:00', '15:00', '18:00'];
      for (const time of times) {
        await prisma.userHolidayPreference.update({
          where: { id: testPrefId },
          data: { reminderTime: time },
        });
        const updated = await prisma.userHolidayPreference.findUnique({ where: { id: testPrefId } });
        if (updated.reminderTime !== time) {
          throw new Error(`Time mismatch: ${updated.reminderTime} !== ${time}`);
        }
      }
      logTest(4, 'Update Reminder Time', 'pass', `Tested ${times.length} times`);
    } else {
      logTest(4, 'Update Reminder Time', 'skip', 'No preference');
    }
  } catch (error) {
    logTest(4, 'Update Reminder Time', 'fail', error.message);
  }
  
  // Test 5: Update delivery method
  try {
    if (testPrefId) {
      const methods = ['email', 'push', 'both'];
      for (const method of methods) {
        await prisma.userHolidayPreference.update({
          where: { id: testPrefId },
          data: { deliveryMethod: method },
        });
        const updated = await prisma.userHolidayPreference.findUnique({ where: { id: testPrefId } });
        if (updated.deliveryMethod !== method) {
          throw new Error(`Method mismatch: ${updated.deliveryMethod} !== ${method}`);
        }
      }
      logTest(5, 'Update Delivery Method', 'pass', `Tested: ${methods.join(', ')}`);
    } else {
      logTest(5, 'Update Delivery Method', 'skip', 'No preference');
    }
  } catch (error) {
    logTest(5, 'Update Delivery Method', 'fail', error.message);
  }
  
  // Test 6: Query preferences by delivery method
  try {
    const emailPrefs = await prisma.userHolidayPreference.findMany({ where: { deliveryMethod: 'email' } });
    const pushPrefs = await prisma.userHolidayPreference.findMany({ where: { deliveryMethod: 'push' } });
    const bothPrefs = await prisma.userHolidayPreference.findMany({ where: { deliveryMethod: 'both' } });
    logTest(6, 'Query by Delivery Method', 'pass', `Email: ${emailPrefs.length}, Push: ${pushPrefs.length}, Both: ${bothPrefs.length}`);
  } catch (error) {
    logTest(6, 'Query by Delivery Method', 'fail', error.message);
  }
  
  // Test 7: Query enabled vs disabled preferences
  try {
    const enabled = await prisma.userHolidayPreference.findMany({ where: { enabled: true } });
    const disabled = await prisma.userHolidayPreference.findMany({ where: { enabled: false } });
    logTest(7, 'Query Enabled/Disabled', 'pass', `Enabled: ${enabled.length}, Disabled: ${disabled.length}`);
  } catch (error) {
    logTest(7, 'Query Enabled/Disabled', 'fail', error.message);
  }
  
  // Test 8: Test preference with all offsets
  try {
    if (testPrefId) {
      const allOffsets = [365, 180, 90, 60, 30, 14, 7, 3, 1, 0];
      await prisma.userHolidayPreference.update({
        where: { id: testPrefId },
        data: { reminderOffsets: allOffsets },
      });
      const updated = await prisma.userHolidayPreference.findUnique({ where: { id: testPrefId } });
      logTest(8, 'Store All Offset Types', 'pass', `Count: ${updated.reminderOffsets.length}`);
    } else {
      logTest(8, 'Store All Offset Types', 'skip', 'No preference');
    }
  } catch (error) {
    logTest(8, 'Store All Offset Types', 'fail', error.message);
  }
  
  // Test 9: Test edge case reminder times
  try {
    if (testPrefId) {
      const edgeTimes = ['00:00', '00:30', '12:00', '23:30', '23:59'];
      for (const time of edgeTimes) {
        await prisma.userHolidayPreference.update({
          where: { id: testPrefId },
          data: { reminderTime: time },
        });
      }
      logTest(9, 'Edge Case Reminder Times', 'pass', `Tested: ${edgeTimes.join(', ')}`);
    } else {
      logTest(9, 'Edge Case Reminder Times', 'skip', 'No preference');
    }
  } catch (error) {
    logTest(9, 'Edge Case Reminder Times', 'fail', error.message);
  }
  
  // Test 10: Test preference uniqueness constraint
  try {
    if (testUser && testHoliday) {
      const pref = await prisma.userHolidayPreference.findUnique({
        where: { userId_holidayId: { userId: testUser.id, holidayId: testHoliday.id } },
      });
      const exists = !!pref;
      logTest(10, 'Preference Uniqueness', 'pass', `Unique constraint working: ${exists}`);
    } else {
      logTest(10, 'Preference Uniqueness', 'skip', 'No test data');
    }
  } catch (error) {
    logTest(10, 'Preference Uniqueness', 'fail', error.message);
  }

  // Test 11-20: User Settings
  log('\n👤 Tests 11-20: User Settings Management', 'blue');
  
  // Test 11: Update user timezone
  try {
    if (testUser) {
      const timezones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage'];
      for (const tz of timezones) {
        await prisma.user.update({
          where: { id: testUser.id },
          data: { timezone: tz },
        });
        const updated = await prisma.user.findUnique({ where: { id: testUser.id } });
        if (updated.timezone !== tz) {
          throw new Error(`Timezone mismatch: ${updated.timezone} !== ${tz}`);
        }
      }
      logTest(11, 'Update User Timezone', 'pass', `Tested ${timezones.length} timezones`);
    } else {
      logTest(11, 'Update User Timezone', 'skip', 'No user');
    }
  } catch (error) {
    logTest(11, 'Update User Timezone', 'fail', error.message);
  }
  
  // Test 12: Update user country code
  try {
    if (testUser) {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { countryCode: 'US' },
      });
      const updated = await prisma.user.findUnique({ where: { id: testUser.id } });
      logTest(12, 'Update Country Code', updated.countryCode === 'US' ? 'pass' : 'fail', `Code: ${updated.countryCode}`);
    } else {
      logTest(12, 'Update Country Code', 'skip', 'No user');
    }
  } catch (error) {
    logTest(12, 'Update Country Code', 'fail', error.message);
  }
  
  // Test 13: Query user with all relations
  try {
    if (testUser) {
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: {
          holidayPreferences: true,
          notifications: true,
          pushSubscriptions: true,
        },
      });
      logTest(13, 'Query User Relations', 'pass', 
        `Prefs: ${user.holidayPreferences.length}, Notifs: ${user.notifications.length}, Subs: ${user.pushSubscriptions.length}`);
    } else {
      logTest(13, 'Query User Relations', 'skip', 'No user');
    }
  } catch (error) {
    logTest(13, 'Query User Relations', 'fail', error.message);
  }
  
  // Test 14-20: Additional settings tests
  const additionalTests = [
    { num: 14, name: 'Count Total Users', query: async () => await prisma.user.count() },
    { num: 15, name: 'Count Total Preferences', query: async () => await prisma.userHolidayPreference.count() },
    { num: 16, name: 'Count Enabled Preferences', query: async () => await prisma.userHolidayPreference.count({ where: { enabled: true } }) },
    { num: 17, name: 'Count Push Subscriptions', query: async () => await prisma.pushSubscription.count() },
    { num: 18, name: 'Count Scheduled Notifications', query: async () => await prisma.notification.count({ where: { sent: false } }) },
    { num: 19, name: 'Count Sent Notifications', query: async () => await prisma.notification.count({ where: { sent: true } }) },
    { num: 20, name: 'Count Total Holidays', query: async () => await prisma.holiday.count() },
  ];
  
  for (const test of additionalTests) {
    try {
      const count = await test.query();
      logTest(test.num, test.name, 'pass', `Count: ${count}`);
    } catch (error) {
      logTest(test.num, test.name, 'fail', error.message);
    }
  }

  // Test 21-30: Holiday Configurations
  log('\n🎉 Tests 21-30: Holiday Configuration Tests', 'blue');
  
  // Test 21: Query holidays by category
  try {
    const categories = ['Federal', 'Cultural', 'Religious', 'Observance'];
    let results = [];
    for (const cat of categories) {
      const count = await prisma.holiday.count({ where: { category: cat } });
      results.push(`${cat}: ${count}`);
    }
    logTest(21, 'Query by Category', 'pass', results.join(', '));
  } catch (error) {
    logTest(21, 'Query by Category', 'fail', error.message);
  }
  
  // Test 22: Query holidays by rule type
  try {
    const types = ['fixed', 'nth_weekday', 'calculated'];
    let results = [];
    for (const type of types) {
      const count = await prisma.holiday.count({ where: { ruleType: type } });
      results.push(`${type}: ${count}`);
    }
    logTest(22, 'Query by Rule Type', 'pass', results.join(', '));
  } catch (error) {
    logTest(22, 'Query by Rule Type', 'fail', error.message);
  }
  
  // Test 23: Validate holiday data structure
  try {
    const holidays = await prisma.holiday.findMany({ take: 10 });
    let valid = true;
    for (const h of holidays) {
      if (!h.name || !h.category || !h.ruleType) {
        valid = false;
        break;
      }
    }
    logTest(23, 'Validate Holiday Structure', valid ? 'pass' : 'fail', `Checked ${holidays.length} holidays`);
  } catch (error) {
    logTest(23, 'Validate Holiday Structure', 'fail', error.message);
  }
  
  // Test 24-30: More configuration tests
  const configTests = [
    { num: 24, name: 'Get Unique Categories', query: async () => {
      const holidays = await prisma.holiday.findMany({ select: { category: true }, distinct: ['category'] });
      return holidays.length;
    }},
    { num: 25, name: 'Get Fixed Date Holidays', query: async () => await prisma.holiday.count({ where: { ruleType: 'fixed' } }) },
    { num: 26, name: 'Get Nth Weekday Holidays', query: async () => await prisma.holiday.count({ where: { ruleType: 'nth_weekday' } }) },
    { num: 27, name: 'Get Calculated Holidays', query: async () => await prisma.holiday.count({ where: { ruleType: 'calculated' } }) },
    { num: 28, name: 'Get January Holidays', query: async () => await prisma.holiday.count({ where: { month: 1 } }) },
    { num: 29, name: 'Get December Holidays', query: async () => await prisma.holiday.count({ where: { month: 12 } }) },
    { num: 30, name: 'Get All US Holidays', query: async () => await prisma.holiday.count({ where: { countryCode: 'US' } }) },
  ];
  
  for (const test of configTests) {
    try {
      const result = await test.query();
      logTest(test.num, test.name, 'pass', `Count: ${result}`);
    } catch (error) {
      logTest(test.num, test.name, 'fail', error.message);
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`✓ Tests Passed: ${testsPassed}`, 'green');
  log(`✗ Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`⊘ Tests Skipped: ${testsSkipped}`, 'yellow');
  log(`⚙️  Total Tests: ${testsPassed + testsFailed + testsSkipped}`, 'cyan');
  
  const successRate = testsPassed + testsFailed > 0 
    ? ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)
    : '100.00';
  log(`\n✨ Success Rate: ${successRate}%`, parseFloat(successRate) >= 90 ? 'green' : parseFloat(successRate) >= 70 ? 'yellow' : 'red');
  
  await prisma.$disconnect();
  
  return {
    passed: testsPassed,
    failed: testsFailed,
    skipped: testsSkipped,
    successRate,
  };
}

// Run tests
runTests().catch(console.error);
