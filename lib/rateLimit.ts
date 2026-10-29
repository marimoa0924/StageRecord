/**
 * In-memory rate limiter.
 *
 * Works for warm Vercel Lambda instances that handle multiple requests.
 * For distributed environments, replace with Upstash Redis + @upstash/ratelimit.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Evict expired entries to prevent unbounded memory growth.
// On serverless this runs opportunistically — not on a guaranteed interval.
function evict() {
  if (store.size < 1000) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * @param key      Unique identifier: email, vid cookie, or IP
 * @param limit    Max requests allowed in the window
 * @param windowMs Window length in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  evict();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 };
}
