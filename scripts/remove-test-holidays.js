const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log(
    'Searching for potential test holidays (name or description contains "test")...',
  );

  const matches = await prisma.holiday.findMany({
    where: {
      OR: [
        { name: { contains: 'test', mode: 'insensitive' } },
        { description: { contains: 'test', mode: 'insensitive' } },
      ],
    },
  });

  if (matches.length === 0) {
    console.log('No test-like holidays found.');
  } else {
    console.log(`Found ${matches.length} holiday(ies) that look like tests:`);
    for (const h of matches) {
      console.log(`- [${h.id}] ${h.name} (${h.countryCode})`);
    }

    // Delete them
    const deleted = await prisma.holiday.deleteMany({
      where: {
        OR: [
          { name: { contains: 'test', mode: 'insensitive' } },
          { description: { contains: 'test', mode: 'insensitive' } },
        ],
      },
    });

    console.log(`Deleted ${deleted.count} holiday(ies).`);
  }

  // Now report total holidays and any remaining test-like entries
  const total = await prisma.holiday.count();
  console.log(`Total holidays in DB: ${total}`);

  const remainingTests = await prisma.holiday.findMany({
    where: {
      OR: [
        { name: { contains: 'test', mode: 'insensitive' } },
        { description: { contains: 'test', mode: 'insensitive' } },
      ],
    },
  });

  if (remainingTests.length === 0) {
    console.log('No remaining test-like holidays detected.');
  } else {
    console.log('Remaining test-like holidays:');
    for (const h of remainingTests) {
      console.log(`- [${h.id}] ${h.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error running remove-test-holidays script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
