import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimiter';
import { handleApi } from '@/lib/apiHandler';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  timezone: z.string().default('America/New_York'),
  countryCode: z.string().default('US'),
});

export async function POST(request: NextRequest) {
  return handleApi(request, { schema: registerSchema }, async (req, data) => {
    // data is already validated by Zod
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';

    try {
      const allowed = await rateLimit(ip, 5, 60); // 5 registrations per minute per IP
      if (!allowed) {
        logger.warn('Registration rate limit exceeded', { ip });
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 },
        );
      }
    } catch (e) {
      logger.debug('Rate limiter check failed', { err: String(e) });
    }

    logger.debug('Registration attempt', { ip });

    const { email, password, timezone, countryCode } = data as z.infer<
      typeof registerSchema
    >;
    const trimmedEmail = email.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });
    if (existingUser) {
      logger.warn('Attempt to register existing user', { email: trimmedEmail });
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 },
      );
    }

    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        timezone,
        countryCode,
      },
      select: {
        id: true,
        email: true,
        timezone: true,
        countryCode: true,
        createdAt: true,
      },
    });

    logger.info('User created', { id: user.id, email: user.email });
    return NextResponse.json(
      { message: 'User created successfully', user },
      { status: 201 },
    );
  });
}
