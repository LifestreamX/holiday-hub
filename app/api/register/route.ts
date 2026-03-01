import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimiter';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  timezone: z.string().default('America/New_York'),
  countryCode: z.string().default('US'),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';
    const allowed = await rateLimit(ip, 5, 60); // 5 registrations per minute per IP
    if (!allowed) {
      logger.warn('Registration rate limit exceeded', { ip });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    logger.debug('Registration attempt', { ip });
  } catch (e) {
    // proceed even if rate limiter fails
    logger.debug('Rate limiter check failed', { err: String(e) });
  }
  try {
    const body = await request.json();
    const { email, password, timezone, countryCode } =
      registerSchema.parse(body);

    // Trim email to avoid whitespace issues
    const trimmedEmail = email.trim();

    // Check if user already exists
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

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Registration invalid input', { details: error.errors });
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }
    logger.error('Registration error', { error: String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
