// Rate limiter implementation for API endpoints
// In production, use Redis or a proper rate limiting service

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (replace with Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  isRateLimited(identifier: string): { limited: boolean; resetIn?: number; message?: string } {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
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

    // Increment counter
    entry.count++;
    rateLimitStore.set(identifier, entry);

    return { limited: false };
  }

  cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
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
export function checkRateLimit(
  rateLimiter: RateLimiter,
  identifier: string,
  request: Request
): { limited: boolean; response?: Response } {
  const limitResult = rateLimiter.isRateLimited(identifier);

  if (limitResult.limited) {
    const ResponseCtor = (globalThis as unknown as { Response?: typeof Response })
      .Response;

    if (!ResponseCtor) {
      throw new Error('Response constructor is not available in this environment');
    }

    return {
      limited: true,
      response: new ResponseCtor(
        JSON.stringify({
          error: limitResult.message,
          retryAfter: limitResult.resetIn,
        }),
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
  // Use userId if available, otherwise extract from IP or user agent
  if (userId) {
    return `user:${userId}`;
  }

  // Get client IP from headers (Cloudflare, Vercel, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';

  // Include user agent for better identification
  const userAgent = request.headers.get('user-agent') || '';
  return `ip:${clientIp}:${userAgent.slice(0, 20)}`; // Limit user agent to prevent memory bloat
}

// Periodic cleanup of expired entries (call this in a cron job or background process)
export function cleanupRateLimitStore() {
  authRateLimiter.cleanupExpiredEntries();
  generalRateLimiter.cleanupExpiredEntries();
}
