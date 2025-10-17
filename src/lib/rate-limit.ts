import { NextApiRequest } from 'next';

// In-memory rate limiting store (use Redis in production)
class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }

  isAllowed(key: string, windowMs: number, maxRequests: number): boolean {
    const now = Date.now();
    const current = this.store.get(key);

    if (!current || now > current.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  getRemainingRequests(key: string, maxRequests: number): number {
    const current = this.store.get(key);
    if (!current) return maxRequests;
    
    const now = Date.now();
    if (now > current.resetTime) return maxRequests;
    
    return Math.max(0, maxRequests - current.count);
  }

  getResetTime(key: string): number | null {
    const current = this.store.get(key);
    return current ? current.resetTime : null;
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Rate limiting configurations
export const RATE_LIMITS = {
  // General API endpoints
  API_GENERAL: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  
  // Authentication endpoints
  API_AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 auth requests per 15 minutes
  
  // Form submissions
  FORM_CONTACT: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 contact forms per hour
  FORM_BOOKING: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 bookings per hour
  
  // Admin operations
  ADMIN_API: { windowMs: 5 * 60 * 1000, maxRequests: 50 }, // 50 admin requests per 5 minutes
  
  // Search operations
  SEARCH_API: { windowMs: 1 * 60 * 1000, maxRequests: 30 }, // 30 searches per minute
  
  // File uploads
  FILE_UPLOAD: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 uploads per hour
};

// Helper function to get client IP
export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  
  if (Array.isArray(cfConnectingIP)) return cfConnectingIP[0];
  if (typeof cfConnectingIP === 'string') return cfConnectingIP;
  
  if (Array.isArray(realIP)) return realIP[0];
  if (typeof realIP === 'string') return realIP;
  
  if (Array.isArray(forwarded)) return forwarded[0].split(',')[0].trim();
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  
  return req.socket.remoteAddress || 'unknown';
}

// Helper function to create rate limit key
export function createRateLimitKey(req: NextApiRequest, identifier?: string): string {
  const ip = getClientIP(req);
  const endpoint = req.url || '';
  const method = req.method || 'GET';
  
  if (identifier) {
    return `${ip}:${identifier}:${endpoint}:${method}`;
  }
  
  return `${ip}:${endpoint}:${method}`;
}

// Main rate limiting function
export function checkRateLimit(
  req: NextApiRequest,
  config: { windowMs: number; maxRequests: number },
  identifier?: string
): { allowed: boolean; remaining: number; resetTime: number | null } {
  const key = createRateLimitKey(req, identifier);
  const allowed = rateLimiter.isAllowed(key, config.windowMs, config.maxRequests);
  const remaining = rateLimiter.getRemainingRequests(key, config.maxRequests);
  const resetTime = rateLimiter.getResetTime(key);

  return { allowed, remaining, resetTime };
}

// Rate limiting middleware for API routes
export function withRateLimit(
  config: { windowMs: number; maxRequests: number },
  identifier?: string
) {
  return function(handler: any) {
    return async (req: NextApiRequest, res: any) => {
      const rateLimitResult = checkRateLimit(req, config, identifier);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
      if (rateLimitResult.resetTime) {
        res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000));
      }

      if (!rateLimitResult.allowed) {
        const retryAfter = rateLimitResult.resetTime 
          ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
          : config.windowMs / 1000;

        res.setHeader('Retry-After', retryAfter);
        
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter,
          limit: config.maxRequests,
          windowMs: config.windowMs,
        });
      }

      return handler(req, res);
    };
  };
}

// Specific rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiter
  api: withRateLimit(RATE_LIMITS.API_GENERAL),
  
  // Authentication rate limiter
  auth: withRateLimit(RATE_LIMITS.API_AUTH),
  
  // Contact form rate limiter
  contactForm: withRateLimit(RATE_LIMITS.FORM_CONTACT),
  
  // Booking form rate limiter
  bookingForm: withRateLimit(RATE_LIMITS.FORM_BOOKING),
  
  // Admin API rate limiter
  admin: withRateLimit(RATE_LIMITS.ADMIN_API),
  
  // Search API rate limiter
  search: withRateLimit(RATE_LIMITS.SEARCH_API),
  
  // File upload rate limiter
  fileUpload: withRateLimit(RATE_LIMITS.FILE_UPLOAD),
};

// Rate limiting for specific user actions
export function checkUserActionRateLimit(
  userId: string,
  action: string,
  config: { windowMs: number; maxRequests: number }
): { allowed: boolean; remaining: number; resetTime: number | null } {
  const key = `user:${userId}:${action}`;
  const allowed = rateLimiter.isAllowed(key, config.windowMs, config.maxRequests);
  const remaining = rateLimiter.getRemainingRequests(key, config.maxRequests);
  const resetTime = rateLimiter.getResetTime(key);

  return { allowed, remaining, resetTime };
}

// User-specific rate limiters
export const userRateLimiters = {
  // User booking attempts
  userBooking: (userId: string) => checkUserActionRateLimit(userId, 'booking', RATE_LIMITS.FORM_BOOKING),
  
  // User contact form submissions
  userContact: (userId: string) => checkUserActionRateLimit(userId, 'contact', RATE_LIMITS.FORM_CONTACT),
  
  // User password reset attempts
  userPasswordReset: (userId: string) => checkUserActionRateLimit(userId, 'password-reset', { windowMs: 60 * 60 * 1000, maxRequests: 3 }),
  
  // User login attempts
  userLogin: (userId: string) => checkUserActionRateLimit(userId, 'login', { windowMs: 15 * 60 * 1000, maxRequests: 5 }),
};

// Cleanup function for graceful shutdown
export function cleanupRateLimiter() {
  rateLimiter.destroy();
}

// Export the rate limiter instance and class for advanced usage
export { rateLimiter, RateLimiter };
