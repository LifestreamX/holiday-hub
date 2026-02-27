import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, generatePasswordResetEmailHTML } from '@/lib/emailService';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    // Always return success even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    if (!user) {
      console.log(
        'Password reset requested for non-existent email:',
        trimmedEmail,
      );
      return NextResponse.json({
        message:
          'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Check if user has a password (OAuth users don't)
    if (!user.password) {
      console.log('Password reset requested for OAuth user:', trimmedEmail);
      return NextResponse.json({
        message:
          'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email: trimmedEmail,
        token,
        expiresAt,
      },
    });

    // Generate reset link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    const emailSent = await sendEmail({
      to: trimmedEmail,
      subject: 'Password Reset Request - Holiday Hub',
      html: generatePasswordResetEmailHTML(resetLink),
    });

    if (!emailSent) {
      console.error('Failed to send password reset email to:', trimmedEmail);
      // Don't reveal this to the user for security reasons
    }

    return NextResponse.json({
      message:
        'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
