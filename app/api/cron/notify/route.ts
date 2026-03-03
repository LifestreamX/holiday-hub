import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processAllUsers, processUsersPage } from '../../../../lib/scheduler';

const QSTASH_CURRENT_SIGNING_KEY = process.env.QSTASH_CURRENT_SIGNING_KEY;
const QSTASH_NEXT_SIGNING_KEY = process.env.QSTASH_NEXT_SIGNING_KEY;

async function verifyQstashSignature(req: NextRequest): Promise<boolean> {
  const signature =
    req.headers.get('Upstash-Signature') || req.headers.get('Qstash-Signature');
  if (!signature) return false;

  const body = await req.text();

  const check = (key?: string) => {
    if (!key) return false;
    try {
      const hmac = crypto.createHmac('sha256', key).update(body).digest('hex');
      const sigBuf = Buffer.from(signature, 'hex');
      const hmacBuf = Buffer.from(hmac, 'hex');
      if (sigBuf.length !== hmacBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, hmacBuf);
    } catch (err) {
      return false;
    }
  };

  return check(QSTASH_CURRENT_SIGNING_KEY) || check(QSTASH_NEXT_SIGNING_KEY);
}

export async function POST(req: NextRequest) {
  // Require QStash-signed requests only
  const ok = await verifyQstashSignature(req);
  if (!ok)
    return NextResponse.json(
      { error: 'Unauthorized - signature required' },
      { status: 401 },
    );

  try {
    // Support paging via query params so QStash can trigger one page per run
    const url = new URL(req.url);
    const pageParam = url.searchParams.get('page');
    const sizeParam = url.searchParams.get('size');

    if (pageParam !== null) {
      const page = Number(pageParam) || 0;
      const size = Number(sizeParam) || 100;
      const processed = await processUsersPage(page, size);
      return NextResponse.json({
        ok: true,
        page,
        size,
        usersProcessed: processed,
      });
    }

    const processed = await processAllUsers(100);
    return NextResponse.json({ ok: true, usersProcessed: processed });
  } catch (err) {
    console.error('Cron notify error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
