import { RateLimiter, authRateLimiter, generalRateLimiter, checkRateLimit, getClientIdentifier, cleanupRateLimitStore } from '@/lib/rateLimiter';

describe('RateLimiter', () => {
  it('allows up to maxRequests within a window then rate-limits', () => {
    const limiter = new RateLimiter({ windowMs: 60_000, maxRequests: 2, message: 'Too many' });
    const identifier = `client-${Math.random()}`;

    const first = limiter.isRateLimited(identifier);
    const second = limiter.isRateLimited(identifier);
    const third = limiter.isRateLimited(identifier);

    expect(first.limited).toBe(false);
    expect(second.limited).toBe(false);
    expect(third.limited).toBe(true);
    expect(third.message).toBe('Too many');
    expect(third.resetIn).toBeGreaterThanOrEqual(0);
  });

  it('resets rate limiting when the window has expired', () => {
    const windowMs = 1_000;
    const limiter = new RateLimiter({ windowMs, maxRequests: 1, message: 'Too many' });
    const identifier = `client-${Math.random()}`;
    const baseTime = 1_000_000;
    const nowSpy = jest.spyOn(Date, 'now');

    // First request starts a window
    nowSpy.mockReturnValue(baseTime);
    expect(limiter.isRateLimited(identifier).limited).toBe(false);

    // Second request in the same window should be limited
    nowSpy.mockReturnValue(baseTime + 100);
    expect(limiter.isRateLimited(identifier).limited).toBe(true);

    // After window expires, limiter should allow again
    nowSpy.mockReturnValue(baseTime + windowMs + 1);
    expect(limiter.isRateLimited(identifier).limited).toBe(false);

    nowSpy.mockRestore();
  });
});

describe('checkRateLimit', () => {
  it('returns limited: false when under the limit', () => {
    const fakeLimiter = {
      isRateLimited: jest.fn().mockReturnValue({ limited: false }),
    } as unknown as RateLimiter;

    const result = checkRateLimit(fakeLimiter, 'id-1', {} as Request);

    expect(fakeLimiter.isRateLimited).toHaveBeenCalledWith('id-1');
    expect(result.limited).toBe(false);
    expect(result.response).toBeUndefined();
  });

  it('returns a 429 Response when limited', async () => {
    const globalAny: any = globalThis as any;

    class MockResponse {
      body: string;
      status: number;
      headers: { get: (name: string) => string | null };

      constructor(body?: BodyInit | null, init?: ResponseInit) {
        this.body = typeof body === 'string' ? body : body ? String(body) : '';
        const headerMap = new Map<string, string>(
          Object.entries((init?.headers as Record<string, string>) || {}),
        );
        this.headers = {
          get: (name: string) => headerMap.get(name) ?? null,
        };
        this.status = init?.status ?? 200;
      }

      async json() {
        return JSON.parse(this.body || '{}');
      }
    }

    globalAny.Response = MockResponse;

    const fakeLimiter = {
      isRateLimited: jest.fn().mockReturnValue({
        limited: true,
        resetIn: 42,
        message: 'Too many',
      }),
    } as unknown as RateLimiter;

    const result = checkRateLimit(fakeLimiter, 'id-2', { headers: { get: () => null } } as any);

    expect(result.limited).toBe(true);
    expect(result.response).toBeInstanceOf(MockResponse);

    const res = result.response as Response;
    expect(res.status).toBe(429);

    const data = await (res as any).json();
    expect(data).toEqual(
      expect.objectContaining({
        error: 'Too many',
        retryAfter: 42,
      }),
    );

    expect(res.headers.get('Retry-After')).toBe('42');
    expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy();

    delete globalAny.Response;
  });
});

describe('getClientIdentifier', () => {
  it('prefers userId when provided', () => {
    const id = getClientIdentifier({} as Request, 'user-123');
    expect(id).toBe('user:user-123');
  });

  it('uses forwarded IP and user agent when no userId', () => {
    const req = {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'x-forwarded-for') return '1.2.3.4, 5.6.7.8';
          if (name.toLowerCase() === 'user-agent') return 'TestAgent/1.0 ExtraStuff';
          return null;
        },
      },
    } as any;

    const id = getClientIdentifier(req as Request);

    expect(id.startsWith('ip:1.2.3.4:')).toBe(true);
    expect(id).toContain('TestAgent');
  });

  it('falls back to unknown when IP headers are missing', () => {
    const req = {
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'user-agent') return 'X';
          return null;
        },
      },
    } as any;

    const id = getClientIdentifier(req as Request);
    expect(id).toBe('ip:unknown:X');
  });
});

describe('cleanupRateLimitStore', () => {
  it('delegates cleanup to both auth and general rate limiters', () => {
    const authSpy = jest.spyOn(authRateLimiter, 'cleanupExpiredEntries');
    const generalSpy = jest.spyOn(generalRateLimiter, 'cleanupExpiredEntries');

    cleanupRateLimitStore();

    expect(authSpy).toHaveBeenCalled();
    expect(generalSpy).toHaveBeenCalled();

    authSpy.mockRestore();
    generalSpy.mockRestore();
  });
});
