/**
 * Comprehensive Push Notification Test Suite
 * Tests 50+ different push notification scenarios
 */

const { PrismaClient } = require('@prisma/client');
const webpush = require('web-push');

const prisma = new PrismaClient();

// Set up VAPID keys
webpush.setVapidDetails(
  'mailto:' + (process.env.EMAIL_FROM || 'test@example.com'),
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

async function sendPushNotification(subscription, payload, testName) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🔔 COMPREHENSIVE PUSH NOTIFICATION TEST SUITE', 'magenta');
  log('='.repeat(60), 'magenta');

  // Get push subscriptions from database
  const subscriptions = await prisma.pushSubscription.findMany({
    take: 10,
    include: { user: true },
  });

  if (subscriptions.length === 0) {
    log('\n⚠️  No push subscriptions found in database', 'yellow');
    log('Please register at least one push subscription by:', 'yellow');
    log('1. Visit http://localhost:3000/dashboard', 'yellow');
    log('2. Enable push notifications in your browser', 'yellow');
    log('3. Allow notifications when prompted', 'yellow');
    log('\nRunning configuration tests only...', 'cyan');
  }

  // Test 1-10: Different Notification Types
  log('\n📱 Tests 1-10: Notification Type Variations', 'blue');
  const notificationTypes = [
    { title: 'Holiday Reminder', body: 'Your holiday is coming soon!', icon: '🎉', badge: '1' },
    { title: 'Urgent Reminder', body: 'Holiday is TODAY!', icon: '⚠️', badge: '!' },
    { title: 'Weekly Reminder', body: 'Holiday in 7 days', icon: '📅', badge: '7' },
    { title: 'Monthly Reminder', body: 'Holiday in 30 days', icon: '🗓️', badge: '30' },
    { title: 'Custom Reminder', body: 'Your custom reminder', icon: '⭐', badge: '*' },
    { title: 'Multiple Holidays', body: '3 holidays coming this week!', icon: '🎊', badge: '3' },
    { title: 'Federal Holiday', body: 'Federal holiday approaching', icon: '🏛️', badge: 'F' },
    { title: 'Religious Holiday', body: 'Religious observance reminder', icon: '🕊️', badge: 'R' },
    { title: 'Cultural Holiday', body: 'Cultural celebration ahead', icon: '🌍', badge: 'C' },
    { title: 'Fun Holiday', body: 'Fun holiday coming up!', icon: '🎈', badge: '😊' },
  ];

  for (let i = 0; i < notificationTypes.length; i++) {
    const testNum = i + 1;
    const notif = notificationTypes[i];
    
    if (subscriptions.length > 0) {
      const sub = subscriptions[i % subscriptions.length];
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      
      const result = await sendPushNotification(subscription, notif, notif.title);
      logTest(testNum, `${notif.title}`, result.success ? 'pass' : 'fail', result.success ? 'Sent' : result.error);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      logTest(testNum, `${notif.title}`, 'skip', 'No subscriptions');
    }
  }

  // Test 11-20: Different Payload Sizes
  log('\n📦 Tests 11-20: Payload Size Variations', 'blue');
  const payloadSizes = [
    { size: 'Minimal', body: 'Hi' },
    { size: 'Small', body: 'Holiday reminder!' },
    { size: 'Medium', body: 'Your holiday is coming soon. Make sure to prepare!' },
    { size: 'Large', body: 'A'.repeat(200) },
    { size: 'Max', body: 'B'.repeat(4000) },
    { size: 'With Data', body: 'Test', data: { holidayId: '123', offset: 7 } },
    { size: 'With URL', body: 'Check it out', url: 'http://localhost:3000/dashboard' },
    { size: 'With Actions', body: 'Take action', actions: [{ action: 'view', title: 'View' }] },
    { size: 'Rich Content', body: 'Holiday!', image: 'https://via.placeholder.com/400x200', badge: 'https://via.placeholder.com/72x72' },
    { size: 'Unicode', body: '🎄 Holiday 测试 тест পরীক্ষা 🎅' },
  ];

  for (let i = 0; i < payloadSizes.length; i++) {
    const testNum = i + 11;
    const payload = {
      title: `${payloadSizes[i].size} Payload Test`,
      ...payloadSizes[i],
      icon: '🔔',
    };
    
    if (subscriptions.length > 0) {
      const sub = subscriptions[i % subscriptions.length];
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      
      const result = await sendPushNotification(subscription, payload, payload.title);
      logTest(testNum, `Payload: ${payloadSizes[i].size}`, result.success ? 'pass' : 'fail', result.success ? 'Sent' : result.error);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      logTest(testNum, `Payload: ${payloadSizes[i].size}`, 'skip', 'No subscriptions');
    }
  }

  // Test 21-30: Different Reminder Offsets
  log('\n⏰ Tests 21-30: Reminder Timing Tests', 'blue');
  const offsets = [0, 1, 3, 7, 14, 21, 30, 60, 90, 180];
  
  for (let i = 0; i < offsets.length; i++) {
    const testNum = i + 21;
    const offset = offsets[i];
    const daysText = offset === 0 ? 'TODAY!' : offset === 1 ? 'tomorrow' : `in ${offset} days`;
    const payload = {
      title: `Holiday ${daysText}`,
      body: `Your holiday is ${daysText}. Offset: ${offset} days.`,
      icon: '⏰',
      badge: offset.toString(),
      data: { offset, scheduledFor: new Date(Date.now() + offset * 24 * 60 * 60 * 1000).toISOString() },
    };
    
    if (subscriptions.length > 0) {
      const sub = subscriptions[i % subscriptions.length];
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      
      const result = await sendPushNotification(subscription, payload, `Offset ${offset}d`);
      logTest(testNum, `Offset: ${offset} days`, result.success ? 'pass' : 'fail', result.success ? 'Sent' : result.error);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      logTest(testNum, `Offset: ${offset} days`, 'skip', 'No subscriptions');
    }
  }

  // Test 31-40: Different Categories with Custom Icons
  log('\n🎨 Tests 31-40: Category-Specific Notifications', 'blue');
  const categories = [
    { name: 'Federal', icon: '🏛️', color: '#1e40af' },
    { name: 'Cultural', icon: '🌍', color: '#7c3aed' },
    { name: 'Religious', icon: '🕊️', color: '#db2777' },
    { name: 'Observance', icon: '👁️', color: '#059669' },
    { name: 'International', icon: '🌐', color: '#dc2626' },
    { name: 'Historical', icon: '📜', color: '#92400e' },
    { name: 'Health', icon: '❤️', color: '#be123c' },
    { name: 'Environmental', icon: '🌱', color: '#15803d' },
    { name: 'Food', icon: '🍔', color: '#c2410c' },
    { name: 'Fun', icon: '🎉', color: '#ea580c' },
  ];
  
  for (let i = 0; i < categories.length; i++) {
    const testNum = i + 31;
    const cat = categories[i];
    const payload = {
      title: `${cat.name} Holiday Reminder`,
      body: `A ${cat.name.toLowerCase()} holiday is coming soon!`,
      icon: cat.icon,
      badge: cat.icon,
      data: { category: cat.name, color: cat.color },
    };
    
    if (subscriptions.length > 0) {
      const sub = subscriptions[i % subscriptions.length];
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      
      const result = await sendPushNotification(subscription, payload, cat.name);
      logTest(testNum, `Category: ${cat.name}`, result.success ? 'pass' : 'fail', result.success ? 'Sent' : result.error);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      logTest(testNum, `Category: ${cat.name}`, 'skip', 'No subscriptions');
    }
  }

  // Test 41-50: Edge Cases and Special Scenarios
  log('\n🔬 Tests 41-50: Edge Cases & Special Scenarios', 'blue');
  const edgeCases = [
    { name: 'Empty Body', payload: { title: 'Empty Test', body: '', icon: '📭' } },
    { name: 'Only Title', payload: { title: 'Title Only Test' } },
    { name: 'No Icon', payload: { title: 'No Icon', body: 'Testing without icon' } },
    { name: 'Very Long Title', payload: { title: 'T'.repeat(100), body: 'Long title test', icon: '📏' } },
    { name: 'Special Chars', payload: { title: '<>&"\' Test', body: 'Special: <>&"\'', icon: '🔣' } },
    { name: 'Script Injection', payload: { title: '<script>alert(1)</script>', body: 'XSS test', icon: '🔒' } },
    { name: 'Silent Notification', payload: { title: 'Silent', body: 'No sound', silent: true, icon: '🔇' } },
    { name: 'High Priority', payload: { title: 'Urgent!', body: 'High priority', urgency: 'high', icon: '❗' } },
    { name: 'Low Priority', payload: { title: 'FYI', body: 'Low priority', urgency: 'low', icon: 'ℹ️' } },
    { name: 'Renotify Test', payload: { title: 'Renotify', body: 'Should renotify', tag: 'test', renotify: true, icon: '🔄' } },
  ];
  
  for (let i = 0; i < edgeCases.length; i++) {
    const testNum = i + 41;
    const test = edgeCases[i];
    
    if (subscriptions.length > 0) {
      const sub = subscriptions[i % subscriptions.length];
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      
      const result = await sendPushNotification(subscription, test.payload, test.name);
      logTest(testNum, test.name, result.success ? 'pass' : 'fail', result.success ? 'Sent' : result.error);
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      logTest(testNum, test.name, 'skip', 'No subscriptions');
    }
  }

  // Test 51-55: Database Integration Tests
  log('\n💾 Tests 51-55: Database & Subscription Management', 'blue');
  
  // Test 51: Query all subscriptions
  try {
    const allSubs = await prisma.pushSubscription.findMany();
    logTest(51, 'Query All Subscriptions', 'pass', `Found: ${allSubs.length}`);
  } catch (error) {
    logTest(51, 'Query All Subscriptions', 'fail', error.message);
  }
  
  // Test 52: Query subscriptions by user
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      const userSubs = await prisma.pushSubscription.findMany({
        where: { userId: user.id },
      });
      logTest(52, 'Query User Subscriptions', 'pass', `Found: ${userSubs.length} for user`);
    } else {
      logTest(52, 'Query User Subscriptions', 'skip', 'No users found');
    }
  } catch (error) {
    logTest(52, 'Query User Subscriptions', 'fail', error.message);
  }
  
  // Test 53: Validate subscription structure
  try {
    if (subscriptions.length > 0) {
      const sub = subscriptions[0];
      const hasEndpoint = !!sub.endpoint;
      const hasP256dh = !!sub.p256dh;
      const hasAuth = !!sub.auth;
      const isValid = hasEndpoint && hasP256dh && hasAuth;
      logTest(53, 'Validate Subscription Structure', isValid ? 'pass' : 'fail', 
        `Endpoint: ${hasEndpoint}, P256dh: ${hasP256dh}, Auth: ${hasAuth}`);
    } else {
      logTest(53, 'Validate Subscription Structure', 'skip', 'No subscriptions');
    }
  } catch (error) {
    logTest(53, 'Validate Subscription Structure', 'fail', error.message);
  }
  
  // Test 54: Check push preferences
  try {
    const pushPrefs = await prisma.userHolidayPreference.findMany({
      where: { enabled: true, deliveryMethod: { in: ['push', 'both'] } },
      take: 10,
    });
    logTest(54, 'Query Push Preferences', 'pass', `Found: ${pushPrefs.length} enabled`);
  } catch (error) {
    logTest(54, 'Query Push Preferences', 'fail', error.message);
  }
  
  // Test 55: Test notification scheduling
  try {
    const user = await prisma.user.findFirst();
    const holiday = await prisma.holiday.findFirst();
    
    if (user && holiday) {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          holidayId: holiday.id,
          scheduledFor: new Date(Date.now() + 60 * 60 * 1000),
          deliveryType: 'push',
          sent: false,
        },
      });
      
      logTest(55, 'Create Push Notification Record', 'pass', `ID: ${notification.id}`);
      
      // Clean up
      await prisma.notification.delete({ where: { id: notification.id } });
    } else {
      logTest(55, 'Create Push Notification Record', 'skip', 'No user or holiday');
    }
  } catch (error) {
    logTest(55, 'Create Push Notification Record', 'fail', error.message);
  }

  // Summary
  log('\n' + '='.repeat(60), 'magenta');
  log('📊 TEST SUMMARY', 'magenta');
  log('='.repeat(60), 'magenta');
  log(`✓ Tests Passed: ${testsPassed}`, 'green');
  log(`✗ Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`⊘ Tests Skipped: ${testsSkipped}`, 'yellow');
  log(`🔔 Total Tests: ${testsPassed + testsFailed + testsSkipped}`, 'magenta');
  
  const successRate = testsPassed + testsFailed > 0 
    ? ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)
    : '0.00';
  log(`\n✨ Success Rate: ${successRate}%`, parseFloat(successRate) >= 90 ? 'green' : parseFloat(successRate) >= 70 ? 'yellow' : 'red');
  
  if (testsSkipped > 40) {
    log('\n💡 Tip: Register push subscriptions to run all tests!', 'cyan');
    log('   Visit http://localhost:3000/dashboard and enable push notifications', 'cyan');
  }
  
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
