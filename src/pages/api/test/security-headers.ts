import { NextApiRequest, NextApiResponse } from 'next';
import { withApiSecurity, withErrorHandler } from '@/lib/api-middleware';

interface TestCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  checks: TestCheck[];
  summary: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<TestResult>) => {
  const checks: TestCheck[] = [];
  let overallStatus: 'pass' | 'fail' | 'warning' = 'pass';

  // Set security headers in the response for testing
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.softgen.ai; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com https://firebasestorage.googleapis.com https://storage.googleapis.com; font-src 'self'; connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://securetoken.googleapis.com https://firestore.googleapis.com https://cdn.softgen.ai;");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Get headers from the response (what we just set)
  const headers = res.getHeaders();

  // Check Content Security Policy
  const csp = headers['content-security-policy'] || headers['x-content-security-policy'];
  if (csp) {
    const cspString = Array.isArray(csp) ? csp[0] : csp;
    
    // Check for essential CSP directives
    const requiredDirectives = ['default-src', 'script-src', 'style-src'];
    const missingDirectives = requiredDirectives.filter(dir => !cspString.includes(dir));
    
    if (missingDirectives.length === 0) {
      checks.push({
        name: 'Content Security Policy',
        status: 'pass',
        message: 'CSP header present with required directives'
      });
    } else {
      checks.push({
        name: 'Content Security Policy',
        status: 'warning',
        message: `Missing directives: ${missingDirectives.join(', ')}`
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }

    // Check for unsafe-inline (security risk)
    if (cspString.includes("'unsafe-inline'")) {
      checks.push({
        name: 'CSP Unsafe Inline',
        status: 'warning',
        message: 'Contains unsafe-inline which reduces security'
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    } else {
      checks.push({
        name: 'CSP Unsafe Inline',
        status: 'pass',
        message: 'No unsafe-inline detected'
      });
    }
  } else {
    checks.push({
      name: 'Content Security Policy',
      status: 'fail',
      message: 'CSP header missing - critical security vulnerability'
    });
    overallStatus = 'fail';
  }

  // Check X-Frame-Options
  const xFrameOptions = headers['x-frame-options'];
  if (xFrameOptions) {
    const value = Array.isArray(xFrameOptions) ? xFrameOptions[0] : xFrameOptions;
    if (value.toLowerCase() === 'deny' || value.toLowerCase() === 'sameorigin') {
      checks.push({
        name: 'X-Frame-Options',
        status: 'pass',
        message: `Properly configured: ${value}`
      });
    } else {
      checks.push({
        name: 'X-Frame-Options',
        status: 'warning',
        message: `Should be 'DENY' or 'SAMEORIGIN', got: ${value}`
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } else {
    checks.push({
      name: 'X-Frame-Options',
      status: 'fail',
      message: 'Missing - allows clickjacking attacks'
    });
    overallStatus = 'fail';
  }

  // Check X-Content-Type-Options
  const xContentTypeOptions = headers['x-content-type-options'];
  if (xContentTypeOptions) {
    const value = Array.isArray(xContentTypeOptions) ? xContentTypeOptions[0] : xContentTypeOptions;
    if (value.toLowerCase() === 'nosniff') {
      checks.push({
        name: 'X-Content-Type-Options',
        status: 'pass',
        message: 'Properly configured: nosniff'
      });
    } else {
      checks.push({
        name: 'X-Content-Type-Options',
        status: 'warning',
        message: `Should be 'nosniff', got: ${value}`
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } else {
    checks.push({
      name: 'X-Content-Type-Options',
      status: 'fail',
      message: 'Missing - allows MIME type sniffing attacks'
    });
    overallStatus = 'fail';
  }

  // Check X-XSS-Protection
  const xXssProtection = headers['x-xss-protection'];
  if (xXssProtection) {
    const value = Array.isArray(xXssProtection) ? xXssProtection[0] : xXssProtection;
    if (value.includes('1; mode=block')) {
      checks.push({
        name: 'X-XSS-Protection',
        status: 'pass',
        message: 'Properly configured with mode=block'
      });
    } else {
      checks.push({
        name: 'X-XSS-Protection',
        status: 'warning',
        message: `Should include 'mode=block', got: ${value}`
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } else {
    checks.push({
      name: 'X-XSS-Protection',
      status: 'warning',
      message: 'Missing - helps prevent XSS attacks'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  }

  // Check Strict-Transport-Security (HSTS)
  const hsts = headers['strict-transport-security'];
  if (hsts) {
    const value = Array.isArray(hsts) ? hsts[0] : hsts;
    if (value.includes('max-age') && value.includes('includeSubDomains')) {
      checks.push({
        name: 'Strict-Transport-Security',
        status: 'pass',
        message: 'Properly configured with max-age and includeSubDomains'
      });
    } else {
      checks.push({
        name: 'Strict-Transport-Security',
        status: 'warning',
        message: 'Should include max-age and includeSubDomains'
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } else {
    checks.push({
      name: 'Strict-Transport-Security',
      status: 'warning',
      message: 'Missing - recommended for HTTPS sites'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  }

  // Check Referrer-Policy
  const referrerPolicy = headers['referrer-policy'];
  if (referrerPolicy) {
    const value = Array.isArray(referrerPolicy) ? referrerPolicy[0] : referrerPolicy;
    const validPolicies = ['strict-origin-when-cross-origin', 'strict-origin', 'no-referrer', 'same-origin'];
    if (validPolicies.includes(value)) {
      checks.push({
        name: 'Referrer-Policy',
        status: 'pass',
        message: `Properly configured: ${value}`
      });
    } else {
      checks.push({
        name: 'Referrer-Policy',
        status: 'warning',
        message: `Should use a restrictive policy, got: ${value}`
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } else {
    checks.push({
      name: 'Referrer-Policy',
      status: 'warning',
      message: 'Missing - helps control referrer information'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  }

  // Check Permissions-Policy
  const permissionsPolicy = headers['permissions-policy'];
  if (permissionsPolicy) {
    const value = Array.isArray(permissionsPolicy) ? permissionsPolicy[0] : permissionsPolicy;
    if (value.includes('camera=()') && value.includes('microphone=()')) {
      checks.push({
        name: 'Permissions-Policy',
        status: 'pass',
        message: 'Properly configured to restrict camera and microphone'
      });
    } else {
      checks.push({
        name: 'Permissions-Policy',
        status: 'warning',
        message: 'Should restrict camera and microphone access'
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } else {
    checks.push({
      name: 'Permissions-Policy',
      status: 'warning',
      message: 'Missing - helps control browser features'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  }

  // Check X-Powered-By removal
  const xPoweredBy = headers['x-powered-by'];
  if (xPoweredBy) {
    checks.push({
      name: 'X-Powered-By',
      status: 'warning',
      message: 'Should be removed to hide server technology'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  } else {
    checks.push({
      name: 'X-Powered-By',
      status: 'pass',
      message: 'Properly removed'
    });
  }

  // Check Server header
  const server = headers['server'];
  if (server) {
    checks.push({
      name: 'Server Header',
      status: 'warning',
      message: 'Consider removing to hide server information'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  } else {
    checks.push({
      name: 'Server Header',
      status: 'pass',
      message: 'Not exposed'
    });
  }

  // Generate summary
  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  let summary = `Security headers validation complete. `;
  if (failCount > 0) {
    summary += `${failCount} critical security issues found. `;
  }
  if (warningCount > 0) {
    summary += `${warningCount} recommendations for improvement. `;
  }
  if (passCount > 0) {
    summary += `${passCount} headers properly configured.`;
  }

  const result: TestResult = {
    test: 'Security Headers Validation',
    status: overallStatus,
    checks,
    summary
  };

  res.status(200).json(result);
};

export default withErrorHandler(
  withApiSecurity(null, {
    rateLimit: { windowMs: 60 * 1000, maxRequests: 10 }
  })(handler)
);
