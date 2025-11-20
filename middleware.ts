import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from './src/lib/firebase-admin';

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
  
  // NextRequest doesn't have an ip property, so we'll use a fallback
  return 'unknown';
}

function getTokenFromRequest(request: NextRequest): string | null {
  // First, try to get token from __session cookie
  const sessionCookie = request.cookies.get('__session')?.value;
  if (sessionCookie) {
    return sessionCookie;
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

async function verifyFirebaseToken(request: NextRequest): Promise<{ valid: boolean; user?: any }> {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return { valid: false };
    }

    // Verify token with Firebase Admin SDK
    const verification = await verifyIdToken(token);
    
    if (!verification.success) {
      return { valid: false };
    }

    // Extract user info and role from the decoded token
    const user = verification.user;
    const role = user.customClaims?.role || 'user';
    const isAdmin = role === 'admin';
    
    return { 
      valid: true, 
      user: { 
        uid: user.uid, 
        email: user.email,
        role: role,
        isAdmin: isAdmin
      } 
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
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

  // Check if route requires authentication (admin routes)
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

  if (isAdminRoute || isProtectedRoute) {
    const tokenVerification = await verifyFirebaseToken(request);
    
    if (!tokenVerification.valid) {
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }), 
          { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      // For page routes, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Add user info to request headers for getServerSideProps
    response.headers.set('x-user-id', tokenVerification.user.uid);
    response.headers.set('x-user-email', tokenVerification.user.email || '');
    response.headers.set('x-is-admin', tokenVerification.user.isAdmin ? 'true' : 'false');

    // Check role-based access for admin routes
    if (isAdminRoute) {
      if (!tokenVerification.user.isAdmin) {
        // For API routes, return 403
        if (pathname.startsWith('/api/')) {
          return new Response(
            JSON.stringify({ error: 'Forbidden - Admin access required' }), 
            { 
              status: 403, 
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        
        // For page routes, redirect to unauthorized
        return NextResponse.redirect(new URL('/unauthorized', request.url));
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
