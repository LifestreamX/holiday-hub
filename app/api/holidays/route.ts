import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateHolidayDate } from '@/lib/holidayEngine';
import { getDaysBetween } from '@/lib/dateUtils';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimiter';
import { fetchAvailableCountries } from '@/lib/nagerDateService';

async function buildHolidaysForSession(
  session: Awaited<ReturnType<typeof getServerSession>> | null,
  request: NextRequest,
) {
  try {
    // Use provided session where available, otherwise resolve from NextAuth.
    let resolvedSession: any = session ?? (await getServerSession(authOptions));

    // Allow a dev-only header to impersonate a user when running locally.
    if (!resolvedSession?.user?.id && process.env.NODE_ENV !== 'production') {
      const devUserId = request.headers.get('x-dev-user-id');
      if (devUserId) {
        resolvedSession = { user: { id: devUserId } } as any;
      }
    }

    if (!resolvedSession?.user?.id) {
      logger.warn('Unauthorized access to /api/holidays');
      throw new Error('Unauthorized');
    }

    const userId = resolvedSession.user.id;

    // Rate-limit per-user to avoid abuse
    const rlKey = String(userId);
    if (!(await rateLimit(rlKey, 60, 60))) {
      logger.warn('Rate limit exceeded for /api/holidays', { key: rlKey });
      throw new Error('RateLimitExceeded');
    }

    // Get user to access timezone
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true, countryCode: true },
    });

    const userTimezone = user?.timezone || 'America/New_York';

    // Respect optional country query param (view-only). Notifications remain tied to user's primary country.
    const url = new URL(request.url);
    const countryParam = url.searchParams.get('country');

    // If `country=ALL` explicitly requested, do not filter by countryCode (return all holidays).
    const whereClause: any =
      countryParam === 'ALL'
        ? {}
        : { countryCode: countryParam || user?.countryCode || 'US' };

    // Get all holidays for selected country (or all countries when whereClause is empty)
    const holidays = await prisma.holiday.findMany({
      where: whereClause,
      include: {
        userPreferences: {
          where: {
            userId,
          },
        },
      },
    });
    logger.debug('Fetched holidays from DB', {
      count: holidays.length,
      country: user?.countryCode || 'US',
    });

    // Fetch country names once (Nager.Date) to attach readable country names to results
    let countryNameMap: Record<string, string> = {};
    try {
      const available = await fetchAvailableCountries();
      available.forEach((c) => (countryNameMap[c.countryCode] = c.name));
    } catch (e) {
      logger.warn('Failed to fetch available countries for mapping', {
        message: e instanceof Error ? e.message : String(e),
      });
    }

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
        // If we couldn't calculate for the current year, skip trying next year
        if (!date) {
          logger.warn(`Unable to calculate date for holiday: ${holiday.name}`);
        } else {
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

          if (date) {
            holidayDate = date;
            daysUntil = getDaysBetween(today, date);
          } else {
            logger.warn(
              `Unable to calculate date for holiday (next year) : ${holiday.name}`,
            );
          }
        }
      } catch (error) {
        logger.error(`Error calculating date for ${holiday.name}`, {
          message: error instanceof Error ? error.message : String(error),
        });
      }

      const preference = holiday.userPreferences[0] || null;

      return {
        id: holiday.id,
        name: holiday.name,
        description: holiday.description,
        category: holiday.category,
        countryCode: holiday.countryCode,
        countryName: countryNameMap[holiday.countryCode] || holiday.countryCode,
        date: holidayDate?.toISOString(),
        daysUntil,
        enabled: preference?.enabled ?? false,
        reminderOffsets: preference?.reminderOffsets ?? [],
        reminderTime: preference?.reminderTime ?? '08:00',
        hasPreference: !!preference,
      };
    });

    // Sort by days until
    holidaysWithDates.sort((a, b) => {
      if (a.daysUntil === null) return 1;
      if (b.daysUntil === null) return -1;
      return a.daysUntil - b.daysUntil;
    });
    return holidaysWithDates;
  } catch (error) {
    logger.error('Error fetching holidays', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const holidaysWithDates = await buildHolidaysForSession(session, request);
    return NextResponse.json(holidaysWithDates);
  } catch (error) {
    const msg = (error as Error).message;
    if (msg === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (msg === 'RateLimitExceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
