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
    const normalizedEmail = trimmedEmail.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      logger.warn('Attempt to register existing user', { email: trimmedEmail });
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 },
      );
    }

    const hashedPassword = await hash(password, 12);
    // Generate verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        timezone,
        countryCode,
        emailVerified: false,
        verificationToken,
        verificationTokenExpires,
      },
      select: {
        id: true,
        email: true,
        timezone: true,
        countryCode: true,
        createdAt: true,
      },
    });

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    const { sendEmail } = await import('../../../lib/emailService');
    await sendEmail({
      to: normalizedEmail,
      subject: 'Verify your email for Holiday Hub',
      html: `<h2>Welcome to Holiday Hub!</h2><p>Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link will expire in 24 hours.</p>`,
    });

    logger.info('User created, verification email sent', {
      id: user.id,
      email: user.email,
    });
    return NextResponse.json(
      {
        message:
          'User created successfully. Please check your email to verify your account.',
        user,
      },
      { status: 201 },
    );
  });
}
