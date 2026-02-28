import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const preferenceSchema = z.object({
  holidayId: z.string(),
  enabled: z.boolean(),
  reminderOffsets: z.array(z.number()),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = preferenceSchema.parse(body);

    // Check if holiday exists
    const holiday = await prisma.holiday.findUnique({
      where: { id: data.holidayId },
    });

    if (!holiday) {
      return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }

    // Upsert preference
    const preference = await prisma.userHolidayPreference.upsert({
      where: {
        userId_holidayId: {
          userId: session.user.id,
          holidayId: data.holidayId,
        },
      },
      update: {
        enabled: data.enabled,
        reminderOffsets: data.reminderOffsets,
        reminderTime: data.reminderTime,
        deliveryMethod: 'email',
      },
      create: {
        userId: session.user.id,
        holidayId: data.holidayId,
        enabled: data.enabled,
        reminderOffsets: data.reminderOffsets,
        reminderTime: data.reminderTime,
        deliveryMethod: 'email',
      },
    });

    return NextResponse.json(preference);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Error updating preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
