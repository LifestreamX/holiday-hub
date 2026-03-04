import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Allow an optional query param to control which country to enable.
    // - ?country=ALL => enable all holidays (no country filter)
    // - ?country=XX  => enable holidays for that specific country
    // - otherwise use the user's primary country
    const url = new URL(request.url);
    const countryParam = url.searchParams.get('country');

    let holidays;
    if (countryParam === 'ALL') {
      holidays = await prisma.holiday.findMany({});
    } else {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { countryCode: true },
      });
      const country = countryParam || user?.countryCode || 'US';
      holidays = await prisma.holiday.findMany({ where: { countryCode: country } });
    }

    for (const h of holidays) {
      await prisma.userHolidayPreference.upsert({
        where: { userId_holidayId: { userId, holidayId: h.id } },
        update: {
          enabled: true,
          reminderOffsets: [30, 7, 1],
          reminderTime: '08:00',
          deliveryMethod: 'email',
        },
        create: {
          userId,
          holidayId: h.id,
          enabled: true,
          reminderOffsets: [30, 7, 1],
          reminderTime: '08:00',
          deliveryMethod: 'email',
        },
      });
    }

    logger.info('Enabled all holidays for user', {
      userId,
      country,
      count: holidays.length,
    });
    return NextResponse.json({ success: true, enabled: holidays.length });
  } catch (error) {
    logger.error('Error enabling all preferences', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to enable preferences' },
      { status: 500 },
    );
  }
}
