import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or with a special header
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return NextResponse.json(
      { error: 'Diagnostic endpoint only available in development' },
      { status: 403 },
    );
  }

  const config = {
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY
      ? '✓ Set (starts with: ' +
        process.env.QSTASH_CURRENT_SIGNING_KEY.substring(0, 10) +
        '...)'
      : '✗ NOT SET',
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY
      ? '✓ Set (starts with: ' +
        process.env.QSTASH_NEXT_SIGNING_KEY.substring(0, 10) +
        '...)'
      : '✗ NOT SET',
    QSTASH_URL: process.env.QSTASH_URL
      ? '✓ Set: ' + process.env.QSTASH_URL
      : '✗ NOT SET',
    QSTASH_TOKEN: process.env.QSTASH_TOKEN
      ? '✓ Set (starts with: ' +
        process.env.QSTASH_TOKEN.substring(0, 10) +
        '...)'
      : '✗ NOT SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '✗ NOT SET',
    RESEND_API_KEY: process.env.RESEND_API_KEY
      ? '✓ Set (starts with: ' +
        process.env.RESEND_API_KEY.substring(0, 10) +
        '...)'
      : '✗ NOT SET',
    EMAIL_FROM: process.env.EMAIL_FROM || '✗ NOT SET',
    DATABASE_URL: process.env.DATABASE_URL
      ? '✓ Set (starts with: ' +
        process.env.DATABASE_URL.substring(0, 20) +
        '...)'
      : '✗ NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    message: 'QStash Configuration Check',
    config,
    endpoint: '/api/cron/notify',
    expectedSignatureHeader: 'Upstash-Signature or Qstash-Signature',
    notes: [
      'QStash requires QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY to be set',
      'These keys are used to verify JWT signatures in the Upstash-Signature header',
      'Without valid keys, the /api/cron/notify endpoint will return 401',
      'Make sure these environment variables are set in your production environment (Vercel)',
    ],
  });
}

export const dynamic = 'force-dynamic';
