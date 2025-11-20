import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = '__session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Get token from NextApiRequest (Pages Router API route)
 */
function getTokenFromNextApiRequest(req: NextApiRequest): string | null {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (token) return token;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Get token from NextRequest (Middleware)
 */
function getTokenFromNextRequest(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) return token;

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Get token from request (cookie or Authorization header)
 */
export function getTokenFromRequest(req: NextApiRequest | NextRequest): string | null {
  // Check if it's NextApiRequest by checking for the cookies object structure
  if (req && typeof req === 'object' && 'cookies' in req && typeof req.cookies === 'object' && !('get' in req.cookies)) {
    return getTokenFromNextApiRequest(req as NextApiRequest);
  }
  
  // Otherwise it's NextRequest
  return getTokenFromNextRequest(req as NextRequest);
}

/**
 * Set session cookie in NextApiResponse
 */
export function setSessionCookie(res: NextApiResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${
      isProduction ? '; Secure' : ''
    }`
  );
}

/**
 * Set session cookie in NextResponse
 */
export function setSessionCookieNextResponse(response: NextResponse, token: string): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return response;
}

/**
 * Clear session cookie in NextApiResponse
 */
export function clearSessionCookie(res: NextApiResponse): void {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );
}

/**
 * Clear session cookie in NextResponse
 */
export function clearSessionCookieNextResponse(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

