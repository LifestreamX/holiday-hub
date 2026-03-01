import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { logger } from '@/lib/logger';

type Handler<T = any> = (
  request: NextRequest,
  parsed?: T,
) => Promise<NextResponse> | NextResponse;

export async function handleApi<T = any>(
  request: NextRequest,
  opts: { schema?: ZodSchema<T>; allowMethods?: string[] } = {},
  handler?: Handler<T>,
): Promise<NextResponse> {
  try {
    if (opts.allowMethods && !opts.allowMethods.includes(request.method)) {
      return NextResponse.json(
        { error: 'Method Not Allowed' },
        { status: 405 },
      );
    }

    let parsed: T | undefined;
    if (opts.schema) {
      const body = await request.json();
      parsed = opts.schema.parse(body);
    }

    if (!handler) {
      return NextResponse.json(
        { error: 'No handler provided' },
        { status: 500 },
      );
    }

    return await handler(request, parsed);
  } catch (err) {
    if (err instanceof ZodError) {
      logger.warn('Validation failed', { errors: err.errors });
      return NextResponse.json(
        { error: 'Invalid input', details: err.errors },
        { status: 400 },
      );
    }

    logger.error('Unhandled API error', {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export default handleApi;
