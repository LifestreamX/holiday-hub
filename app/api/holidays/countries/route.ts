import { NextResponse } from 'next/server';
import { fetchAvailableCountries } from '@/lib/nagerDateService';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Get available countries from Nager.Date
    const remote = await fetchAvailableCountries();

    // Get DB counts in one query
    const counts = await prisma.holiday.groupBy({
      by: ['countryCode'],
      _count: { id: true },
    });
    const countMap: Record<string, number> = {};
    counts.forEach((c) => (countMap[c.countryCode] = c._count.id));

    const combined = remote.map((r) => ({
      countryCode: r.countryCode,
      name: r.name,
      count: countMap[r.countryCode] || 0,
    }));

    return NextResponse.json(combined);
  } catch (error) {
    logger.error('Error fetching countries', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 },
    );
  }
}
