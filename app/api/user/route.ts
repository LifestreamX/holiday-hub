import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { handleApi } from '@/lib/apiHandler';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        timezone: true,
        countryCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  return handleApi(
    request,
    {
      schema: z.object({
        timezone: z.string().optional(),
        countryCode: z.string().optional(),
      }),
    },
    async (req, data) => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { timezone, countryCode } = data as {
        timezone?: string;
        countryCode?: string;
      };

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(timezone && { timezone }),
          ...(countryCode && { countryCode }),
        },
        select: {
          id: true,
          email: true,
          timezone: true,
          countryCode: true,
          createdAt: true,
        },
      });

      return NextResponse.json(user);
    },
  );
}
