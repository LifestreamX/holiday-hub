import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { processAllUsers, processUsersPage } from '../../../../lib/scheduler';

const QSTASH_CURRENT_SIGNING_KEY = process.env.QSTASH_CURRENT_SIGNING_KEY;
const QSTASH_NEXT_SIGNING_KEY = process.env.QSTASH_NEXT_SIGNING_KEY;

async function verifyQstashSignature(req: NextRequest): Promise<boolean> {
  const isLocalDebug =
    process.env.NODE_ENV === 'development' &&
    req.headers.get('x-local-test') === 'true';
  if (isLocalDebug) {
    console.log('[notify] Local debug mode, skipping signature check');
    return true;
  }

  const signature =
    req.headers.get('Upstash-Signature') || req.headers.get('Qstash-Signature');
  if (!signature) {
    console.warn('[notify] No QStash signature header found');
    return false;
  }

  // QStash uses JWT signatures - no need to read the body
  // The JWT in the header is self-contained and verified against the signing key
  const checkJwt = (key?: string) => {
    if (!key) {
      console.warn('[notify] Signing key is undefined');
      return false;
    }
    try {
      jwt.verify(signature, key, { algorithms: ['HS256'] });
      console.log('[notify] JWT signature verified successfully');
      return true;
    } catch (err) {
      console.warn('[notify] JWT signature verification failed:', err);
      return false;
    }
  };

  const valid =
    checkJwt(QSTASH_CURRENT_SIGNING_KEY) || checkJwt(QSTASH_NEXT_SIGNING_KEY);
  if (!valid) {
    console.warn('[notify] Signature present but invalid');
  }
  return valid;
}

export async function POST(req: NextRequest) {
  const now = new Date().toISOString();
  const headersObj = Object.fromEntries(req.headers.entries());
  console.log('[notify] POST /api/cron/notify called', {
    timestamp: now,
    method: req.method,
    url: req.url,
    headers: headersObj,
  });
  // Require QStash-signed requests only
  const ok = await verifyQstashSignature(req);
  if (!ok) {
    console.warn('[notify] Request failed signature verification');
    return NextResponse.json(
      { error: 'Unauthorized - signature required' },
      { status: 401 },
    );
  }

  try {
    // Support paging via query params so QStash can trigger one page per run
    const url = new URL(req.url);
    const pageParam = url.searchParams.get('page');
    const sizeParam = url.searchParams.get('size');

    if (pageParam !== null) {
      const page = Number(pageParam) || 0;
      const size = Number(sizeParam) || 100;
      console.log(`[notify] Processing users page: page=${page}, size=${size}`);
      const processed = await processUsersPage(page, size);
      console.log(`[notify] Users processed (paged):`, processed);
      return NextResponse.json({
        ok: true,
        page,
        size,
        usersProcessed: processed,
      });
    }

    console.log('[notify] Processing all users (default 100)');
    const processed = await processAllUsers(100);
    console.log('[notify] Users processed (all):', processed);
    return NextResponse.json({ ok: true, usersProcessed: processed });
  } catch (err) {
    console.error('[notify] Error in handler:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
