import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateHolidayDate } from '@/lib/holidayEngine';
import { getDaysBetween } from '@/lib/dateUtils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user to access timezone
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true, countryCode: true },
    });

    const userTimezone = user?.timezone || 'America/New_York';

    // Get all holidays for user's country
    const holidays = await prisma.holiday.findMany({
      where: {
        countryCode: user?.countryCode || 'US',
      },
      include: {
        userPreferences: {
          where: {
            userId,
          },
        },
      },
    });

    // Calculate dates for current year and next year using user's timezone
    const currentYear = new Date().getFullYear();
    // Get today in user's timezone
    const today = new Date(
      new Date().toLocaleString('en-US', { timeZone: userTimezone }),
    );
    today.setHours(0, 0, 0, 0);

    const holidaysWithDates = holidays.map((holiday) => {
      let holidayDate: Date | null = null;
      let daysUntil: number | null = null;

      try {
        // Try current year first
        let date = calculateHolidayDate(
          {
            id: holiday.id,
            name: holiday.name,
            ruleType: holiday.ruleType as
              | 'fixed'
              | 'nth_weekday'
              | 'calculated',
            month: holiday.month ?? undefined,
            day: holiday.day ?? undefined,
            weekday: holiday.weekday ?? undefined,
            nth: holiday.nth ?? undefined,
          },
          currentYear,
        );

        // If holiday has passed, calculate for next year
        if (date < today) {
          date = calculateHolidayDate(
            {
              id: holiday.id,
              name: holiday.name,
              ruleType: holiday.ruleType as
                | 'fixed'
                | 'nth_weekday'
                | 'calculated',
              month: holiday.month ?? undefined,
              day: holiday.day ?? undefined,
              weekday: holiday.weekday ?? undefined,
              nth: holiday.nth ?? undefined,
            },
            currentYear + 1,
          );
        }

        holidayDate = date;
        daysUntil = getDaysBetween(today, date);
      } catch (error) {
        console.error(`Error calculating date for ${holiday.name}:`, error);
      }

      const preference = holiday.userPreferences[0] || null;

      return {
        id: holiday.id,
        name: holiday.name,
        description: holiday.description,
        category: holiday.category,
        date: holidayDate?.toISOString(),
        daysUntil,
        enabled: preference?.enabled ?? false,
        reminderOffsets: preference?.reminderOffsets ?? [],
        reminderTime: preference?.reminderTime ?? '08:00',
        deliveryMethod: preference?.deliveryMethod ?? 'email',
        hasPreference: !!preference,
      };
    });

    // Sort by days until
    holidaysWithDates.sort((a, b) => {
      if (a.daysUntil === null) return 1;
      if (b.daysUntil === null) return -1;
      return a.daysUntil - b.daysUntil;
    });

    return NextResponse.json(holidaysWithDates);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
