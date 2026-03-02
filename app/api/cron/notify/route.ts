import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { processUserNotifications } from '../../../../lib/scheduler';

// Optional: Add a secret token for protection
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  // Simple secret check (add CRON_SECRET to your Vercel env vars)
  const authHeader = req.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({ select: { id: true } });
  let sent = 0;
  for (const user of users) {
    await processUserNotifications(user.id);
    sent++;
  }
  await prisma.$disconnect();
  return NextResponse.json({ ok: true, usersProcessed: sent });
}

export const dynamic = 'force-dynamic';
