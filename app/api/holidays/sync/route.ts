import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  fetchPublicHolidays,
  convertNagerHolidayToDbFormat,
} from '@/lib/nagerDateService';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { handleApi } from '@/lib/apiHandler';

const syncSchema = z.object({
  countryCode: z.string(),
  year: z.number().optional(),
});

/**
 * Sync holidays from Nager.Date API to database
 * POST /api/holidays/sync
 * Body: { countryCode: string, year?: number }
 */
export async function POST(request: NextRequest) {
  return handleApi(request, { schema: syncSchema }, async (req, data) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { countryCode, year } = data as z.infer<typeof syncSchema>;
    const targetYear = year || new Date().getFullYear();

    logger.info(
      `Syncing holidays for ${countryCode} (${targetYear}) from Nager.Date...`,
    );

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

    for (const nagerHoliday of nagerHolidays) {
      const holidayData = convertNagerHolidayToDbFormat(nagerHoliday);
      const existingHoliday = await prisma.holiday.findFirst({
        where: { name: holidayData.name, countryCode: holidayData.countryCode },
      });

      if (existingHoliday) {
        await prisma.holiday.update({
          where: { id: existingHoliday.id },
          data: holidayData,
        });
        updated++;
      } else {
        await prisma.holiday.create({ data: holidayData });
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
      stats: { total: nagerHolidays.length, created, updated, skipped },
    });
  });
}
