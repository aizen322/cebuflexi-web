import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  authMaxRequests: 10, // limit auth endpoints to 10 requests per windowMs
};

// Fallback in-memory store for when Upstash is not configured
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Initialize Upstash Redis and Rate Limiter
let ratelimit: Ratelimit | null = null;
let authRatelimit: Ratelimit | null = null;

function initUpstash(): void {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (url && token && !ratelimit) {
    const redis = new Redis({ url, token });
    
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT.maxRequests, '15 m'),
      prefix: 'edge:general',
    });
    
    authRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT.authMaxRequests, '15 m'),
      prefix: 'edge:auth',
    });
  }
}

function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

// Fallback in-memory rate limiting
function isRateLimitedInMemory(ip: string, endpoint: string): boolean {
  const key = getRateLimitKey(ip, endpoint);
  const now = Date.now();
  const limit = endpoint.includes('auth') ? RATE_LIMIT.authMaxRequests : RATE_LIMIT.maxRequests;

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return false;
  }

  if (current.count >= limit) {
    return true;
  }

  current.count++;
  return false;
}

/**
 * Check if a request should be rate limited
 * Uses Upstash Redis when configured, falls back to in-memory otherwise
 */
export function isRateLimited(ip: string, endpoint: string): boolean {
  // Try to initialize Upstash (safe to call multiple times)
  initUpstash();
  
  // If Upstash is not configured, use in-memory fallback
  if (!ratelimit) {
    return isRateLimitedInMemory(ip, endpoint);
  }
  
  // For synchronous middleware, we need to use the in-memory fallback
  // The async version should be used where possible
  return isRateLimitedInMemory(ip, endpoint);
}

/**
 * Async version of rate limit check using Upstash
 * Use this when async operations are supported
 */
export async function isRateLimitedAsync(ip: string, endpoint: string): Promise<boolean> {
  // Try to initialize Upstash
  initUpstash();
  
  // If Upstash is not configured, use in-memory fallback
  if (!ratelimit || !authRatelimit) {
    return isRateLimitedInMemory(ip, endpoint);
  }
  
  try {
    const key = getRateLimitKey(ip, endpoint);
    const limiter = endpoint.includes('auth') ? authRatelimit : ratelimit;
    const result = await limiter.limit(key);
    
    return !result.success;
  } catch (error) {
    console.error('Upstash rate limit error:', error);
    // Fail open on error
    return false;
  }
}

/**
 * Get rate limit result with details
 */
export async function getRateLimitResult(
  ip: string,
  endpoint: string
): Promise<{ limited: boolean; remaining: number; reset: number }> {
  initUpstash();
  
  if (!ratelimit || !authRatelimit) {
    const key = getRateLimitKey(ip, endpoint);
    const now = Date.now();
    const limit = endpoint.includes('auth') ? RATE_LIMIT.authMaxRequests : RATE_LIMIT.maxRequests;
    const current = rateLimitStore.get(key);
    
    return {
      limited: current ? current.count >= limit : false,
      remaining: current ? Math.max(0, limit - current.count) : limit,
      reset: current?.resetTime || now + RATE_LIMIT.windowMs,
    };
  }
  
  try {
    const key = getRateLimitKey(ip, endpoint);
    const limiter = endpoint.includes('auth') ? authRatelimit : ratelimit;
    const result = await limiter.limit(key);
    
    return {
      limited: !result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Upstash rate limit error:', error);
    return { limited: false, remaining: 100, reset: Date.now() + RATE_LIMIT.windowMs };
  }
}
