import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes and their required roles
const protectedRoutes = {
  '/account': ['user', 'admin'],
  '/admin': ['admin'],
  '/api/bookings': ['user', 'admin'],
  '/api/admin': ['admin'],
};

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  authMaxRequests: 10, // limit auth endpoints to 10 requests per windowMs
};

function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

function isRateLimited(ip: string, endpoint: string): boolean {
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

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return request.ip || 'unknown';
}

async function verifyFirebaseToken(request: NextRequest): Promise<{ valid: boolean; user?: any }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { valid: false };
    }

    const token = authHeader.substring(7);
    
    // In production, verify with Firebase Admin SDK
    // For now, we'll do basic validation
    if (!token || token.length < 100) {
      return { valid: false };
    }

    // TODO: Implement actual Firebase token verification
    // const decodedToken = await admin.auth().verifyIdToken(token);
    
    return { valid: true, user: { uid: 'mock-uid', role: 'user' } };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.softgen.ai https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss:",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  
  // Create response with security headers
  const response = NextResponse.next();
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? 'https://cebuflexitours.com' 
      : 'http://localhost:3000'
    );
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
  }

  // Rate limiting
  if (isRateLimited(ip, pathname)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }), 
      { 
        status: 429, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Check if route requires authentication
  const requiresAuth = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

  if (requiresAuth) {
    // Check for protected API routes
    if (pathname.startsWith('/api/')) {
      const tokenVerification = await verifyFirebaseToken(request);
      
      if (!tokenVerification.valid) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }), 
          { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Check role-based access for admin routes
      if (pathname.startsWith('/api/admin')) {
        if (tokenVerification.user?.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Forbidden - Admin access required' }), 
            { 
              status: 403, 
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }
    } else {
      // For page routes, redirect to login if not authenticated
      // This is handled by ProtectedRoute component, but we can add additional checks
      const authToken = request.cookies.get('auth-token');
      
      if (!authToken) {
        const loginUrl = new URL('/auth/signin', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Add security headers to all responses
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
