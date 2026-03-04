const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'tylerallen@live.com';
  console.log(`--- Testing Environment for ${email} ---`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      holidayPreferences: {
        include: { holiday: true },
      },
    },
  });

  if (!user) {
    console.error('User not found in DB. Please register first.');
    return;
  }

  console.log(`User ID: ${user.id}`);
  console.log(`Timezone: ${user.timezone || 'UTC'}`);
  console.log(
    `Enabled Holidays: ${user.holidayPreferences.filter((p) => p.enabled).length}`,
  );

  // Print all enabled preference details
  user.holidayPreferences
    .filter((p) => p.enabled)
    .forEach((p) => {
      console.log(
        `- Holiday: ${p.holiday.name} | Offsets: ${p.reminderOffsets} | Time: ${p.reminderTime}`,
      );
    });

  console.log('\n--- QStash Signature Test ---');
  console.log(
    'Ensure your .env has QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY.',
  );
  console.log(
    'Then run "node scripts/test-cron-signed.js" to trigger the scheduler.',
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
