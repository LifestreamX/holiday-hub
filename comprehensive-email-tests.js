/**
 * Comprehensive Email Notification Test Suite
 * Tests 50+ different email notification scenarios
 */

const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const TEST_EMAIL = process.env.TEST_EMAIL || 'tylerallen@live.com';

// Color codes for terminal output
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

async function sendTestEmail(subject, htmlContent, testName) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Holiday Hub <onboarding@resend.dev>',
      to: TEST_EMAIL,
      subject,
      html: htmlContent,
    });

    if (error) {
      throw error;
    }

    return { success: true, id: data?.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🧪 COMPREHENSIVE EMAIL NOTIFICATION TEST SUITE', 'cyan');
  log('='.repeat(60), 'cyan');

  // Test 1-10: Different Holiday Categories
  log('\n📧 Tests 1-10: Holiday Category Emails', 'blue');
  const categories = [
    'Federal', 'Cultural', 'Religious', 'Observance', 'International',
    'Historical', 'Health', 'Environmental', 'Food', 'Fun'
  ];
  
  for (let i = 0; i < categories.length; i++) {
    const testNum = i + 1;
    const category = categories[i];
    const result = await sendTestEmail(
      `${category} Holiday Reminder - Test ${testNum}`,
      `<h1>${category} Holiday Coming Soon!</h1><p>This is a test email for ${category} category holidays.</p>`,
      `Category: ${category}`
    );
    
    logTest(testNum, `${category} Holiday Email`, result.success ? 'pass' : 'fail', result.success ? `ID: ${result.id}` : result.error);
    await new Promise(resolve => setTimeout(resolve, 600)); // Rate limit protection - 600ms = ~1.6 req/sec
  }

  // Test 11-20: Different Reminder Offsets
  log('\n⏰ Tests 11-20: Reminder Offset Variations', 'blue');
  const offsets = [0, 1, 3, 7, 14, 30, 60, 90, 180, 365];
  
  for (let i = 0; i < offsets.length; i++) {
    const testNum = i + 11;
    const offset = offsets[i];
    const daysText = offset === 0 ? 'Today!' : offset === 1 ? 'Tomorrow' : `in ${offset} days`;
    const result = await sendTestEmail(
      `Holiday Reminder: ${daysText} - Test ${testNum}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Holiday Reminder</h1>
          <p style="font-size: 18px;">Your holiday is ${daysText}!</p>
          <p>Offset: ${offset} days before holiday</p>
        </div>
      `,
      `Offset: ${offset} days`
    );
    
    logTest(testNum, `Reminder Offset ${offset}d`, result.success ? 'pass' : 'fail', result.success ? `ID: ${result.id}` : result.error);
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  // Test 21-30: Different Time of Day Settings
  log('\n🕐 Tests 21-30: Time of Day Variations', 'blue');
  const times = ['00:00', '03:00', '06:00', '08:00', '09:00', '12:00', '15:00', '18:00', '21:00', '23:59'];
  
  for (let i = 0; i < times.length; i++) {
    const testNum = i + 21;
    const time = times[i];
    const result = await sendTestEmail(
      `Holiday Reminder at ${time} - Test ${testNum}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">⏰ Scheduled Reminder</h1>
          <p>This reminder is scheduled for: <strong>${time}</strong></p>
          <p>Test ${testNum} - Time: ${time}</p>
        </div>
      `,
      `Time: ${time}`
    );
    
    logTest(testNum, `Reminder Time ${time}`, result.success ? 'pass' : 'fail', result.success ? `ID: ${result.id}` : result.error);
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  // Test 31-40: Different Email Content Formats
  log('\n📝 Tests 31-40: Email Content Formats', 'blue');
  const formats = [
    { name: 'Plain Text', html: '<p>Simple plain text reminder.</p>' },
    { name: 'Rich HTML', html: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white;"><h1>Rich HTML Email</h1></div>' },
    { name: 'With Images', html: '<img src="https://via.placeholder.com/600x200" alt="Holiday" /><p>Email with image</p>' },
    { name: 'With Links', html: '<p>Visit <a href="http://localhost:3000">Holiday Hub</a> to manage your preferences.</p>' },
    { name: 'Emoji Rich', html: '<h1>🎉 🎊 Holiday Coming! 🎈 🎁</h1><p>Get ready to celebrate!</p>' },
    { name: 'Table Format', html: '<table border="1"><tr><th>Holiday</th><th>Date</th></tr><tr><td>Test Holiday</td><td>March 15</td></tr></table>' },
    { name: 'Multi-column', html: '<div style="display: flex;"><div style="width: 50%;">Column 1</div><div style="width: 50%;">Column 2</div></div>' },
    { name: 'Dark Mode', html: '<div style="background: #1a1a1a; color: #ffffff; padding: 20px;"><h1>Dark Mode Email</h1></div>' },
    { name: 'Button CTA', html: '<a href="http://localhost:3000" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>' },
    { name: 'Responsive', html: '<div style="max-width: 600px; margin: 0 auto; padding: 20px;">Responsive email content</div>' },
  ];
  
  for (let i = 0; i < formats.length; i++) {
    const testNum = i + 31;
    const format = formats[i];
    const result = await sendTestEmail(
      `${format.name} Format - Test ${testNum}`,
      format.html,
      format.name
    );
    
    logTest(testNum, `Format: ${format.name}`, result.success ? 'pass' : 'fail', result.success ? `ID: ${result.id}` : result.error);
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  // Test 41-50: Edge Cases and Special Scenarios
  log('\n🔬 Tests 41-50: Edge Cases & Special Scenarios', 'blue');
  const edgeCases = [
    { name: 'Very Long Subject', subject: 'A'.repeat(200), html: '<p>Long subject line test</p>' },
    { name: 'Special Characters', subject: '🎄 Test: <>&"\'', html: '<p>Special chars: <>&"\'</p>' },
    { name: 'Empty Content', subject: 'Empty Test', html: '<p>Minimal content test</p>' },
    { name: 'Max Length Content', subject: 'Max Content', html: '<p>' + 'Content '.repeat(1000) + '</p>' },
    { name: 'Unicode Subject', subject: '测试 тест পরীক্ষা', html: '<p>Unicode test</p>' },
    { name: 'HTML Injection Test', subject: 'Security Test', html: '<script>alert("test")</script><p>Safe content</p>' },
    { name: 'CSS Injection Test', subject: 'CSS Test', html: '<style>body{display:none;}</style><p>Content</p>' },
    { name: 'Multiple Holidays', subject: 'Multiple Reminders', html: '<h2>Holiday 1</h2><h2>Holiday 2</h2><h2>Holiday 3</h2>' },
    { name: 'Timezone Test (EST)', subject: 'EST Holiday', html: '<p>Holiday in Eastern Time: 08:00 EST</p>' },
    { name: 'Timezone Test (PST)', subject: 'PST Holiday', html: '<p>Holiday in Pacific Time: 08:00 PST</p>' },
  ];
  
  for (let i = 0; i < edgeCases.length; i++) {
    const testNum = i + 41;
    const testCase = edgeCases[i];
    const result = await sendTestEmail(
      testCase.subject + ` - Test ${testNum}`,
      testCase.html,
      testCase.name
    );
    
    logTest(testNum, testCase.name, result.success ? 'pass' : 'fail', result.success ? `ID: ${result.id}` : result.error);
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  // Test 51-55: Database Integration Tests
  log('\n💾 Tests 51-55: Database Integration', 'blue');
  
  // Test 51: Create test notification record
  try {
    const user = await prisma.user.findFirst();
    const holiday = await prisma.holiday.findFirst();
    
    if (user && holiday) {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          holidayId: holiday.id,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
          deliveryType: 'email',
          sent: false,
        },
      });
      logTest(51, 'Create Notification Record', 'pass', `ID: ${notification.id}`);
      
      // Test 52: Update notification as sent
      await prisma.notification.update({
        where: { id: notification.id },
        data: { sent: true, sentAt: new Date() },
      });
      logTest(52, 'Update Notification Status', 'pass', 'Marked as sent');
      
      // Test 53: Query unsent notifications
      const unsent = await prisma.notification.findMany({
        where: { sent: false },
        take: 5,
      });
      logTest(53, 'Query Unsent Notifications', 'pass', `Found: ${unsent.length}`);
      
      // Clean up test notification
      await prisma.notification.delete({ where: { id: notification.id } });
    } else {
      logTest(51, 'Create Notification Record', 'skip', 'No user or holiday found');
      logTest(52, 'Update Notification Status', 'skip', 'Skipped due to previous failure');
      logTest(53, 'Query Unsent Notifications', 'skip', 'Skipped due to previous failure');
    }
  } catch (error) {
    logTest(51, 'Database Integration', 'fail', error.message);
    logTest(52, 'Update Notification Status', 'skip', 'Skipped due to previous failure');
    logTest(53, 'Query Unsent Notifications', 'skip', 'Skipped due to previous failure');
  }
  
  // Test 54: Test email preference retrieval
  try {
    const preferences = await prisma.userHolidayPreference.findMany({
      where: { enabled: true, deliveryMethod: { in: ['email', 'both'] } },
      take: 5,
      include: { user: true, holiday: true },
    });
    logTest(54, 'Retrieve Email Preferences', 'pass', `Found: ${preferences.length}`);
  } catch (error) {
    logTest(54, 'Retrieve Email Preferences', 'fail', error.message);
  }
  
  // Test 55: Test reminder time parsing
  try {
    const pref = await prisma.userHolidayPreference.findFirst();
    if (pref) {
      const time = pref.reminderTime;
      const [hours, minutes] = time.split(':').map(Number);
      const isValid = hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
      logTest(55, 'Parse Reminder Time', isValid ? 'pass' : 'fail', `Time: ${time}`);
    } else {
      logTest(55, 'Parse Reminder Time', 'skip', 'No preferences found');
    }
  } catch (error) {
    logTest(55, 'Parse Reminder Time', 'fail', error.message);
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`✓ Tests Passed: ${testsPassed}`, 'green');
  log(`✗ Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`⊘ Tests Skipped: ${testsSkipped}`, 'yellow');
  log(`📧 Total Tests: ${testsPassed + testsFailed + testsSkipped}`, 'cyan');
  
  const successRate = ((testsPassed / (testsPassed + testsFailed + testsSkipped)) * 100).toFixed(2);
  log(`\n✨ Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  
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
