const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function testNotifications() {
  try {
    console.log('🔍 Looking for Ramadan holiday preferences...\n');

    // Find Ramadan holiday
    const ramadan = await prisma.holiday.findFirst({
      where: {
        name: 'Ramadan',
        countryCode: 'US',
      },
    });

    if (!ramadan) {
      console.log('❌ Ramadan holiday not found in database');
      return;
    }

    console.log(`✅ Found Ramadan: ${ramadan.name} (${ramadan.id})\n`);

    // Find all users with Ramadan enabled
    const preferences = await prisma.userHolidayPreference.findMany({
      where: {
        holidayId: ramadan.id,
        enabled: true,
      },
      include: {
        user: true,
      },
    });

    console.log(`📊 Found ${preferences.length} user(s) with Ramadan enabled\n`);

    if (preferences.length === 0) {
      console.log('⚠️  No users have enabled Ramadan notifications yet.');
      console.log('   Toggle Ramadan ON in the dashboard first!\n');
      return;
    }

    // Send test notifications
    for (const pref of preferences) {
      const user = pref.user;
      console.log(`📧 Sending test notifications to ${user.email}...`);

      // Send email if enabled
      if (pref.deliveryMethod === 'email' || pref.deliveryMethod === 'both') {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Holiday Hub <noreply@tyler-allen.com>',
            to: user.email,
            subject: '🌙 TEST: Ramadan Reminder',
            html: `
              <h1>Ramadan is Tomorrow!</h1>
              <p>This is a test notification from Holiday Hub.</p>
              <p><strong>Holiday:</strong> Ramadan</p>
              <p><strong>Date:</strong> Saturday, February 28, 2026</p>
              <p><strong>Description:</strong> Islamic holy month of fasting</p>
              <p>If you're seeing this, email notifications are working! ✅</p>
            `,
          });
          console.log('  ✅ Email sent successfully!');
        } catch (error) {
          console.error('  ❌ Email failed:', error.message);
        }
      }

      // Check for push subscriptions
      if (pref.deliveryMethod === 'push' || pref.deliveryMethod === 'both') {
        const subscriptions = await prisma.pushSubscription.findMany({
          where: { userId: user.id },
        });

        if (subscriptions.length === 0) {
          console.log('  ⚠️  No push subscriptions found for this user');
          console.log('     Enable push notifications in your browser first!');
        } else {
          console.log(`  ✅ Found ${subscriptions.length} push subscription(s)`);
          console.log('     (Push notifications require web-push library - skipping for now)');
        }
      }

      console.log();
    }

    console.log('🎉 Test complete!\n');
    console.log('📧 Check your email inbox (and spam folder)');
    console.log('🔔 For push notifications, you need to:');
    console.log('   1. Allow notifications in your browser');
    console.log('   2. Visit the app and click "Enable Notifications"\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotifications();
