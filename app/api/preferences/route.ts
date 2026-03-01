import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimiter';
import { handleApi } from '@/lib/apiHandler';

const preferenceSchema = z.object({
  holidayId: z.string(),
  enabled: z.boolean(),
  reminderOffsets: z.array(z.number()),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function POST(request: NextRequest) {
  return handleApi(request, { schema: preferenceSchema }, async (req, data) => {
    const session = await getServerSession(authOptions);
    logger.debug('Preferences.POST called', {
      ip: request.headers.get('x-forwarded-for') || 'local',
    });

    // Rate limit per user or IP
    const rlKey =
      session?.user?.id || request.headers.get('x-forwarded-for') || 'anon';
    if (!(await rateLimit(String(rlKey), 60, 60))) {
      logger.warn('Rate limit exceeded for /api/preferences', { key: rlKey });
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 },
      );
    }

    if (!session?.user?.id) {
      logger.warn('Unauthorized preference update attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d = data as z.infer<typeof preferenceSchema>;

    // Check if holiday exists
    const holiday = await prisma.holiday.findUnique({
      where: { id: d.holidayId },
    });
    if (!holiday) {
      logger.warn('Preference update: holiday not found', {
        holidayId: d.holidayId,
      });
      return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }

    const preference = await prisma.userHolidayPreference.upsert({
      where: {
        userId_holidayId: {
          userId: session.user.id,
          holidayId: d.holidayId,
        },
      },
      update: {
        enabled: d.enabled,
        reminderOffsets: d.reminderOffsets,
        reminderTime: d.reminderTime,
        deliveryMethod: 'email',
      },
      create: {
        userId: session.user.id,
        holidayId: d.holidayId,
        enabled: d.enabled,
        reminderOffsets: d.reminderOffsets,
        reminderTime: d.reminderTime,
        deliveryMethod: 'email',
      },
    });

    logger.info('Preference upserted', {
      userId: session.user.id,
      holidayId: d.holidayId,
    });
    return NextResponse.json(preference);
  });
}
