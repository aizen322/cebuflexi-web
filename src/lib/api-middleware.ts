import { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken } from './firebase-admin';
import { getUserRole } from './firebase-admin';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
      }

      const token = authHeader.substring(7);
      const verification = await verifyIdToken(token);

      if (!verification.success) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }

      const userRole = await getUserRole(verification.user.uid);
      req.user = {
        uid: verification.user.uid,
        email: verification.user.email,
        role: userRole || 'user',
      };

      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function withRole(requiredRole: string | string[]) {
  return function(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const userRole = req.user?.role || 'user';
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Forbidden - Insufficient permissions',
          required: roles,
          current: userRole,
        });
      }

      return handler(req, res);
    });
  };
}

export function withRateLimit(windowMs: number, maxRequests: number) {
  return function(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const ip = getClientIP(req);
      const key = `${ip}:${req.url}`;
      const now = Date.now();
      
      const current = rateLimitStore.get(key);
      
      if (!current || now > current.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      } else if (current.count >= maxRequests) {
        return res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((current.resetTime - now) / 1000),
        });
      } else {
        current.count++;
      }

      return handler(req, res);
    };
  };
}

export function withValidation<T>(schema: any) {
  return function(handler: (req: NextApiRequest & { validatedData?: T }, res: NextApiResponse) => Promise<void>) {
    return async (req: NextApiRequest & { validatedData?: T }, res: NextApiResponse) => {
      try {
        const validatedData = schema.parse(req.body);
        req.validatedData = validatedData;
        return handler(req, res);
      } catch (error) {
        if (error.name === 'ZodError') {
          return res.status(400).json({
            error: 'Validation failed',
            details: error.errors,
          });
        }
        return res.status(400).json({ error: 'Invalid request data' });
      }
    };
  };
}

export function withCORS(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? 'https://cebuflexitours.com' 
      : 'http://localhost:3000'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    await handler(req, res);
  };
}

export function withSecurityHeaders(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    
    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    await handler(req, res);
  };
}

function getClientIP(req: NextApiRequest): string {
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

// Combined middleware for common API routes
export function withApiSecurity<T>(
  schema?: any,
  options: {
    auth?: boolean;
    role?: string | string[];
    rateLimit?: { windowMs: number; maxRequests: number };
  } = {}
) {
  return function(handler: (req: NextApiRequest & { user?: any; validatedData?: T }, res: NextApiResponse) => Promise<void>) {
    let middleware = handler;

    // Apply validation first
    if (schema) {
      middleware = withValidation<T>(schema)(middleware);
    }

    // Apply auth and role checks
    if (options.auth) {
      if (options.role) {
        middleware = withRole(options.role)(middleware);
      } else {
        middleware = withAuth(middleware);
      }
    }

    // Apply rate limiting
    if (options.rateLimit) {
      middleware = withRateLimit(options.rateLimit.windowMs, options.rateLimit.maxRequests)(middleware);
    }

    // Apply CORS and security headers
    middleware = withCORS(middleware);
    middleware = withSecurityHeaders(middleware);

    return middleware;
  };
}

// Error handler wrapper
export function withErrorHandler(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        });
      }
    }
  };
}

// Request logging middleware
export function withLogging(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    const ip = getClientIP(req);
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${ip}`);
    
    await handler(req, res);
    
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  };
}
