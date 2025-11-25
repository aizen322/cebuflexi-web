import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client - uses environment variables automatically
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('Upstash Redis not configured. Rate limiting will use fallback in-memory store.');
    return null;
  }
  
  redis = new Redis({
    url,
    token,
  });
  
  return redis;
}

// Rate limiting configurations
export const RATE_LIMIT_CONFIGS = {
  // General API endpoints - 100 requests per 15 minutes
  API_GENERAL: { requests: 100, window: '15 m' as const },
  
  // Authentication endpoints - 10 requests per 15 minutes
  API_AUTH: { requests: 10, window: '15 m' as const },
  
  // Form submissions - 5 contact forms per hour
  FORM_CONTACT: { requests: 5, window: '1 h' as const },
  
  // Booking forms - 10 bookings per hour
  FORM_BOOKING: { requests: 10, window: '1 h' as const },
  
  // Admin operations - 50 requests per 5 minutes
  ADMIN_API: { requests: 50, window: '5 m' as const },
  
  // Search operations - 30 searches per minute
  SEARCH_API: { requests: 30, window: '1 m' as const },
  
  // File uploads - 20 uploads per hour
  FILE_UPLOAD: { requests: 20, window: '1 h' as const },
};

// Create rate limiters for different use cases
const rateLimiters = new Map<string, Ratelimit>();

function createRateLimiter(
  config: { requests: number; window: `${number} ${'s' | 'm' | 'h' | 'd'}` },
  prefix: string
): Ratelimit | null {
  const redisClient = getRedis();
  
  if (!redisClient) {
    return null;
  }
  
  // Use sliding window algorithm for smooth rate limiting
  return new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `ratelimit:${prefix}`,
    analytics: true, // Enable analytics in Upstash dashboard
  });
}

function getRateLimiter(type: keyof typeof RATE_LIMIT_CONFIGS): Ratelimit | null {
  const key = type;
  
  if (rateLimiters.has(key)) {
    return rateLimiters.get(key)!;
  }
  
  const config = RATE_LIMIT_CONFIGS[type];
  const limiter = createRateLimiter(config, type.toLowerCase());
  
  if (limiter) {
    rateLimiters.set(key, limiter);
  }
  
  return limiter;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given identifier using Upstash Redis
 * Falls back to allowing the request if Redis is not configured
 */
export async function checkUpstashRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIGS = 'API_GENERAL'
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(type);
  const config = RATE_LIMIT_CONFIGS[type];
  
  // Fallback if Upstash is not configured
  if (!limiter) {
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + 60000,
    };
  }
  
  try {
    const result = await limiter.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch (error) {
    console.error('Upstash rate limit error:', error);
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Check rate limit with combined IP and user identifier
 */
export async function checkCombinedRateLimit(
  ip: string,
  userId: string | null,
  endpoint: string,
  type: keyof typeof RATE_LIMIT_CONFIGS = 'API_GENERAL'
): Promise<RateLimitResult> {
  // Create a unique identifier combining IP, user, and endpoint
  const identifier = userId 
    ? `${userId}:${endpoint}`
    : `${ip}:${endpoint}`;
  
  return checkUpstashRateLimit(identifier, type);
}

/**
 * Rate limit specifically for authentication endpoints
 */
export async function checkAuthRateLimit(ip: string): Promise<RateLimitResult> {
  return checkUpstashRateLimit(`auth:${ip}`, 'API_AUTH');
}

/**
 * Rate limit for contact form submissions
 */
export async function checkContactFormRateLimit(ip: string): Promise<RateLimitResult> {
  return checkUpstashRateLimit(`contact:${ip}`, 'FORM_CONTACT');
}

/**
 * Rate limit for booking form submissions
 */
export async function checkBookingFormRateLimit(
  ip: string,
  userId?: string
): Promise<RateLimitResult> {
  const identifier = userId ? `booking:${userId}` : `booking:${ip}`;
  return checkUpstashRateLimit(identifier, 'FORM_BOOKING');
}

/**
 * Rate limit for admin API operations
 */
export async function checkAdminRateLimit(userId: string): Promise<RateLimitResult> {
  return checkUpstashRateLimit(`admin:${userId}`, 'ADMIN_API');
}

/**
 * Rate limit for search operations
 */
export async function checkSearchRateLimit(ip: string): Promise<RateLimitResult> {
  return checkUpstashRateLimit(`search:${ip}`, 'SEARCH_API');
}

/**
 * Check if Upstash Redis is properly configured
 */
export function isUpstashConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

