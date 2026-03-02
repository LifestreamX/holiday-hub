import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint is intentionally conservative about what it returns.
// It only exposes booleans indicating presence of important env vars
// and a lightweight DB connectivity check. It is gated by a token
// in `DEBUG_ENDPOINT_TOKEN` OR allowed in non-production.

export async function GET(request: Request) {
  const debugToken = process.env.DEBUG_ENDPOINT_TOKEN;
  const inNonProd = process.env.NODE_ENV !== 'production';

  if (!inNonProd) {
    const header = request.headers.get('x-debug-token') || '';
    if (!debugToken || header !== debugToken) {
      return NextResponse.json(
        { error: 'debug endpoint disabled' },
        { status: 404 },
      );
    }
  }

  const env = {
    NEXTAUTH_URL: Boolean(process.env.NEXTAUTH_URL),
    NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    GITHUB_ID: Boolean(process.env.GITHUB_ID),
    GITHUB_SECRET: Boolean(process.env.GITHUB_SECRET),
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
  };

  // Lightweight DB connectivity test
  let dbConnected = false;
  try {
    // ping database with a simple query
    // this should be safe and fast; it does not return any sensitive data
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (err) {
    dbConnected = false;
  }

  return NextResponse.json({ ok: true, env, dbConnected });
}
