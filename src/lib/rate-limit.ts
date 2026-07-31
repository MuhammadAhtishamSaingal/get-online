
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for tracking IP request counts
const cache = new Map<string, RateLimitRecord>();

// Clean up expired cache entries periodically to avoid memory leak
if (typeof global !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of cache.entries()) {
      if (now > record.resetTime) {
        cache.delete(ip);
      }
    }
  }, 120000); // every 2 minutes
}

export function getClientIp(request: Request): string {
  const req = request as any;
  
  // Headers check (Next.js wrappers or raw request)
  const forwardedFor = request.headers.get("x-forwarded-for") || req?.headers?.["x-forwarded-for"];
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip") || req?.headers?.["x-real-ip"];
  if (realIp) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Validates request rate limit.
 * @param ip Client IP Address
 * @param limit Maximum requests within window
 * @param windowMs Time window in milliseconds (default: 1 minute)
 * @returns boolean true if rate limited, false otherwise
 */
export function checkRateLimit(ip: string, limit: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = cache.get(ip);

  if (!record) {
    cache.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  if (now > record.resetTime) {
    cache.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  record.count += 1;
  return record.count > limit;
}
