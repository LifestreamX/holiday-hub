import { sendEmail, generateHolidayEmailHTML } from '../lib/emailService.js';

async function main() {
  const to = process.env.TEST_EMAIL_TO || 'tylerallen@live.com';
  const holidayName = 'Test Holiday (Today)';
  const holidayDescription = 'A test notification for today.';
  // Use current date for testing
  const holidayDate = new Date();
  const daysUntil = Math.ceil(
    (holidayDate - new Date()) / (1000 * 60 * 60 * 24),
  );

  const html = generateHolidayEmailHTML(
    holidayName,
    holidayDescription,
    holidayDate,
    daysUntil,
  );

  const sent = await sendEmail({
    to,
    subject: `Reminder: ${holidayName} is coming up!`,
    html,
  });
  if (sent) {
    console.log('Test email sent successfully.');
  } else {
    console.error('Failed to send test email.');
  }
}

main().catch(console.error);
