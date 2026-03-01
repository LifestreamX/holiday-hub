import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  fetchPublicHolidays,
  convertNagerHolidayToDbFormat,
} from '@/lib/nagerDateService';
import { logger } from '@/lib/logger';

/**
 * Sync holidays from Nager.Date API to database
 * POST /api/holidays/sync
 * Body: { countryCode: string, year?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { countryCode, year } = body;

    if (!countryCode) {
      return NextResponse.json(
        { error: 'countryCode is required' },
        { status: 400 },
      );
    }

    // Default to current year if not specified
    const targetYear = year || new Date().getFullYear();

    logger.info(
      `Syncing holidays for ${countryCode} (${targetYear}) from Nager.Date...`,
    );

    // Fetch holidays from Nager.Date
    const nagerHolidays = await fetchPublicHolidays(targetYear, countryCode);

    if (!nagerHolidays || nagerHolidays.length === 0) {
      logger.warn('No holidays returned from Nager.Date', {
        countryCode,
        year: targetYear,
      });
      return NextResponse.json(
        { error: 'No holidays found for this country' },
        { status: 404 },
      );
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Sync each holiday to database
    for (const nagerHoliday of nagerHolidays) {
      const holidayData = convertNagerHolidayToDbFormat(nagerHoliday);

      // Check if holiday already exists (by name and country)
      const existingHoliday = await prisma.holiday.findFirst({
        where: {
          name: holidayData.name,
          countryCode: holidayData.countryCode,
        },
      });

      if (existingHoliday) {
        // Update existing holiday
        await prisma.holiday.update({
          where: { id: existingHoliday.id },
          data: holidayData,
        });
        updated++;
      } else {
        // Create new holiday
        await prisma.holiday.create({
          data: holidayData,
        });
        created++;
      }
    }

    logger.info(
      `Sync complete: ${created} created, ${updated} updated, ${skipped} skipped`,
    );

    return NextResponse.json({
      success: true,
      countryCode,
      year: targetYear,
      stats: {
        total: nagerHolidays.length,
        created,
        updated,
        skipped,
      },
    });
  } catch (error) {
    logger.error('Error syncing holidays:', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: 'Failed to sync holidays',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
