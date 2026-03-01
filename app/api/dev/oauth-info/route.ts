import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 404 },
    );
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const googleCallback = `${nextAuthUrl.replace(/\/$/, '')}/api/auth/callback/google`;
  const githubCallback = `${nextAuthUrl.replace(/\/$/, '')}/api/auth/callback/github`;

  return NextResponse.json({
    nextAuthUrl,
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    googleCallback,
    githubClientId: process.env.GITHUB_ID || null,
    githubCallback,
  });
}
