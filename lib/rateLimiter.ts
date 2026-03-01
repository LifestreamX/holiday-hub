// Redis-backed token-bucket limiter with in-memory fallback.
let client: any = null;
const REDIS_URL = process.env.REDIS_URL;
if (REDIS_URL) {
  try {
    // use require so this file stays compatible with Next's bundler
    // and avoids top-level await complications
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require('ioredis');
    client = new IORedis(REDIS_URL);
  } catch (e) {
    // If ioredis is not available or fails, fall back to memory
    // eslint-disable-next-line no-console
    console.warn(
      '[rateLimit] failed to initialize Redis, falling back to memory',
      String(e),
    );
    client = null;
  }
}

type Bucket = { tokens: number; last: number };
const buckets: Map<string, Bucket> = new Map();

// Lua script for an atomic token-bucket in Redis.
// KEYS[1] - key
// ARGV[1] - capacity
// ARGV[2] - refill_per_ms
// ARGV[3] - now_ms
// ARGV[4] - requested
// ARGV[5] - ttl_seconds
const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_per_ms = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])

local data = redis.call('HMGET', key, 'tokens', 'timestamp')
local tokens = tonumber(data[1])
local timestamp = tonumber(data[2])
if not tokens then
  tokens = capacity
  timestamp = now
end

local elapsed = math.max(0, now - timestamp)
local refill = elapsed * refill_per_ms
tokens = math.min(capacity, tokens + refill)

if tokens >= requested then
  tokens = tokens - requested
  redis.call('HMSET', key, 'tokens', tokens, 'timestamp', now)
  redis.call('EXPIRE', key, ttl)
  return 1
else
  redis.call('HMSET', key, 'tokens', tokens, 'timestamp', now)
  redis.call('EXPIRE', key, ttl)
  return 0
end
`;

export async function rateLimit(
  key: string,
  limit = 60,
  intervalSec = 60,
): Promise<boolean> {
  if (client) {
    try {
      const now = Date.now();
      const capacity = Number(limit);
      const refillPerMs = capacity / (intervalSec * 1000);
      const ttl = Math.max(1, intervalSec * 2);
      // Use EVAL to run the token-bucket atomically
      const res = await client.eval(
        TOKEN_BUCKET_LUA,
        1,
        `rl:tb:${key}`,
        String(capacity),
        String(refillPerMs),
        String(now),
        '1',
        String(ttl),
      );
      return Number(res) === 1;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[rateLimit] Redis error, allowing request', String(e));
      return true;
    }
  }

  // In-memory token-bucket fallback
  const now = Date.now();
  const bucket = buckets.get(key) || { tokens: limit, last: now };
  const elapsed = (now - bucket.last) / 1000;
  const refill = elapsed * (limit / intervalSec);
  if (refill > 0) {
    bucket.tokens = Math.min(limit, bucket.tokens + refill);
    bucket.last = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return true;
  }

  buckets.set(key, bucket);
  return false;
}

export default rateLimit;
