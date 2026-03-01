import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.holiday.count();
  const byCountry = await prisma.holiday.groupBy({
    by: ['countryCode'],
    _count: { _all: true },
  });
  console.log('Total holidays in DB:', total);
  console.log('By country:');
  for (const c of byCountry) {
    console.log(`  ${c.countryCode}: ${c._count._all}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
