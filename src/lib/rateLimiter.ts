// Rate limiter implementation for API endpoints
// Uses an adapter pattern: swap InMemoryRateLimitStore for RedisRateLimitStore in production

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// ---------------------------------------------------------------------------
// Store abstraction — implement this interface for Redis, DynamoDB, etc.
// ---------------------------------------------------------------------------
export interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

// ---------------------------------------------------------------------------
// Default: in-process Map store (single instance / dev only)
// Replace with a RedisRateLimitStore for multi-instance / production.
//
// Example Redis adapter (requires `ioredis` or `@upstash/redis`):
//
//   import Redis from 'ioredis';
//   const client = new Redis(process.env.REDIS_URL!);
//
//   export const redisStore: RateLimitStore = {
//     async get(key) { const v = await client.get(key); return v ? JSON.parse(v) : null; },
//     async set(key, entry) { await client.set(key, JSON.stringify(entry), 'PX', entry.resetTime - Date.now()); },
//     async delete(key) { await client.del(key); },
//     async keys() { return client.keys('ratelimit:*'); },
//   };
// ---------------------------------------------------------------------------
export class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, entry: RateLimitEntry) { this.store.set(key, entry); }
  async delete(key: string) { this.store.delete(key); }
  async keys() { return Array.from(this.store.keys()); }

  async cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) this.store.delete(key);
    }
  }
}

const defaultStore = new InMemoryRateLimitStore();

// ---------------------------------------------------------------------------
// RateLimiter — store-agnostic
// ---------------------------------------------------------------------------
export class RateLimiter {
  constructor(
    private config: RateLimitConfig,
    private store: RateLimitStore = defaultStore
  ) {}

  async isRateLimited(identifier: string): Promise<{ limited: boolean; resetIn?: number; message?: string }> {
    const now = Date.now();
    const entry = await this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      await this.store.set(identifier, { count: 1, resetTime: now + this.config.windowMs });
      return { limited: false };
    }

    if (entry.count >= this.config.maxRequests) {
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      return {
        limited: true,
        resetIn,
        message: this.config.message || `Too many requests. Try again in ${resetIn} seconds.`,
      };
    }

    await this.store.set(identifier, { ...entry, count: entry.count + 1 });
    return { limited: false };
  }

  async cleanupExpiredEntries() {
    if (this.store instanceof InMemoryRateLimitStore) {
      await this.store.cleanup();
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes for auth endpoints
  message: 'Too many authentication attempts. Please try again later.',
});

export const generalRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'Too many requests. Please slow down.',
});

// Middleware function for rate limiting
export async function checkRateLimit(
  rateLimiter: RateLimiter,
  identifier: string,
  request: Request
): Promise<{ limited: boolean; response?: Response }> {
  const limitResult = await rateLimiter.isRateLimited(identifier);

  if (limitResult.limited) {
    const ResponseCtor = (globalThis as unknown as { Response?: typeof Response }).Response;
    if (!ResponseCtor) throw new Error('Response constructor is not available in this environment');

    return {
      limited: true,
      response: new ResponseCtor(
        JSON.stringify({ error: limitResult.message, retryAfter: limitResult.resetIn }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': limitResult.resetIn?.toString() || '60',
            'X-RateLimit-Reset': (Date.now() + (limitResult.resetIn || 60) * 1000).toString(),
          },
        }
      ),
    };
  }

  return { limited: false };
}

// Get client identifier (IP address or user ID)
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;

  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  return `ip:${clientIp}:${userAgent.slice(0, 20)}`;
}

// Periodic cleanup of expired entries (call in a cron job or background process)
export async function cleanupRateLimitStore() {
  await authRateLimiter.cleanupExpiredEntries();
  await generalRateLimiter.cleanupExpiredEntries();
}
