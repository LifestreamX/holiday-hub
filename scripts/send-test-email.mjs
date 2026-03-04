import { sendEmail, generateHolidayEmailHTML } from '../lib/emailService.js';

async function main() {
  const to = process.env.TEST_EMAIL_TO || 'tylerallen@live.com';
  const holidayName = 'Christmas Day';
  const holidayDescription = '';
  const holidayDate = new Date('2026-12-25');
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
