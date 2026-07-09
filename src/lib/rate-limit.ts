// Rate Limiting for API routes (Cloudflare compatible)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number;      // Max requests per window
  keyGenerator?: (req: Request) => string;
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 60,             // 60 requests per minute
    keyGenerator = (req) => req.headers.get("x-forwarded-for") || "anonymous",
  } = options;

  return async (req: Request): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> => {
    const key = keyGenerator(req);
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        success: true,
        limit: max,
        remaining: max - 1,
        reset: now + windowMs,
      };
    }

    if (record.count >= max) {
      return {
        success: false,
        limit: max,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    record.count++;
    return {
      success: true,
      limit: max,
      remaining: max - record.count,
      reset: record.resetTime,
    };
  };
}

// Pre-configured limiters
export const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
export const orderLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });