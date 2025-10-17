import { NextApiRequest, NextApiResponse } from 'next';

// CSRF token store (use Redis in production for distributed systems)
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

// CSRF token configuration
const CSRF_CONFIG = {
  tokenLength: 32,
  tokenExpiry: 60 * 60 * 1000, // 1 hour
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
};

// Cleanup expired tokens
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokenStore.entries()) {
    if (now > data.expires) {
      csrfTokenStore.delete(sessionId);
    }
  }
}, CSRF_CONFIG.cleanupInterval);

// Generate a cryptographically secure random token
function generateToken(): string {
  const array = new Uint8Array(CSRF_CONFIG.tokenLength);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Get session identifier from request
function getSessionId(req: NextApiRequest): string {
  // Try to get from session cookie first
  const sessionCookie = req.cookies['session-id'];
  if (sessionCookie) {
    return sessionCookie;
  }

  // Fallback to IP + User-Agent hash
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const combined = `${ip}-${userAgent}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString();
}

// Generate a new CSRF token for a session
export function generateCSRFToken(req: NextApiRequest): string {
  const sessionId = getSessionId(req);
  const token = generateToken();
  const expires = Date.now() + CSRF_CONFIG.tokenExpiry;
  
  csrfTokenStore.set(sessionId, { token, expires });
  
  return token;
}

// Validate a CSRF token
export function validateCSRFToken(req: NextApiRequest, token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const sessionId = getSessionId(req);
  const storedData = csrfTokenStore.get(sessionId);
  
  if (!storedData) {
    return false;
  }

  // Check if token has expired
  if (Date.now() > storedData.expires) {
    csrfTokenStore.delete(sessionId);
    return false;
  }

  // Validate token
  const isValid = storedData.token === token;
  
  // Optionally regenerate token after validation (double-submit protection)
  if (isValid) {
    storedData.token = generateToken();
    storedData.expires = Date.now() + CSRF_CONFIG.tokenExpiry;
  }

  return isValid;
}

// Get CSRF token from request headers or body
export function getCSRFTokenFromRequest(req: NextApiRequest): string | null {
  // Check header first
  const headerToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  if (headerToken && typeof headerToken === 'string') {
    return headerToken;
  }

  // Check body
  if (req.body && typeof req.body === 'object') {
    return req.body._csrf || req.body.csrfToken || null;
  }

  return null;
}

// CSRF middleware for API routes
export function withCSRF(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip CSRF validation for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || '')) {
      return handler(req, res);
    }

    // Get token from request
    const token = getCSRFTokenFromRequest(req);
    
    if (!token) {
      return res.status(403).json({
        error: 'CSRF token missing',
        message: 'CSRF token is required for this request',
      });
    }

    // Validate token
    if (!validateCSRFToken(req, token)) {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'CSRF token validation failed',
      });
    }

    return handler(req, res);
  };
}

// Generate and set CSRF token in response
export function setCSRFToken(req: NextApiRequest, res: NextApiResponse): string {
  const token = generateCSRFToken(req);
  
  // Set token in response headers for client to read
  res.setHeader('X-CSRF-Token', token);
  
  // Set secure session cookie
  const sessionId = getSessionId(req);
  res.setHeader('Set-Cookie', [
    `session-id=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${CSRF_CONFIG.tokenExpiry / 1000}`,
  ]);

  return token;
}

// CSRF token endpoint
export async function handleCSRFTokenRequest(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = setCSRFToken(req, res);
  
  res.json({
    csrfToken: token,
    expires: Date.now() + CSRF_CONFIG.tokenExpiry,
  });
}

// Client-side CSRF token management
export const clientCSRF = {
  // Get CSRF token from meta tag or API
  async getToken(): Promise<string | null> {
    try {
      // Try to get from meta tag first
      const metaTag = document.querySelector('meta[name="csrf-token"]');
      if (metaTag) {
        return metaTag.getAttribute('content');
      }

      // Fallback to API call
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.csrfToken;
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }

    return null;
  },

  // Add CSRF token to request headers
  async addTokenToHeaders(headers: HeadersInit = {}): Promise<HeadersInit> {
    const token = await this.getToken();
    
    return {
      ...headers,
      ...(token && { 'X-CSRF-Token': token }),
    };
  },

  // Add CSRF token to form data
  async addTokenToFormData(formData: FormData): Promise<FormData> {
    const token = await this.getToken();
    
    if (token) {
      formData.append('_csrf', token);
    }

    return formData;
  },

  // Add CSRF token to JSON data
  async addTokenToJSON(data: any): Promise<any> {
    const token = await this.getToken();
    
    return {
      ...data,
      ...(token && { _csrf: token }),
    };
  },
};

// Utility function to check if request method requires CSRF protection
export function requiresCSRFProtection(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

// Cleanup function for graceful shutdown
export function cleanupCSRF() {
  csrfTokenStore.clear();
}

// Export CSRF configuration and utility functions for external use
export { CSRF_CONFIG, generateToken, getSessionId };
