import { prisma } from '../lib/prisma';
import { processUserNotifications } from '../lib/scheduler';

(async () => {
  const email = process.env.TEST_EMAIL_TO || 'tylerallen@live.com';
  console.log('[run-scheduler] Looking up user by email:', email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('[run-scheduler] User not found:', email);
    process.exit(1);
  }
  console.log(
    '[run-scheduler] Found user:',
    user.id,
    user.email,
    'timezone:',
    user.timezone,
  );
  try {
    await processUserNotifications(user.id);
    console.log('[run-scheduler] Scheduler run complete');
    process.exit(0);
  } catch (err) {
    console.error('[run-scheduler] Error during scheduler run:', err);
    process.exit(1);
  }
})();
