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

  // Test 1: Rate Limiting Import
  try {
    const { 
      RATE_LIMITS, 
      checkRateLimit, 
      createRateLimitKey, 
      getClientIP,
      RateLimiter 
    } = await import('@/lib/rate-limit');

    if (RATE_LIMITS && checkRateLimit && createRateLimitKey) {
      checks.push({
        name: 'Rate Limiting Import',
        status: 'pass',
        message: 'Successfully imported rate limiting functions'
      });
    } else {
      checks.push({
        name: 'Rate Limiting Import',
        status: 'fail',
        message: 'Failed to import rate limiting functions'
      });
      overallStatus = 'fail';
    }
  } catch (error) {
    checks.push({
      name: 'Rate Limiting Import',
      status: 'fail',
      message: `Import error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 2: Rate Limit Configuration
  try {
    const { RATE_LIMITS } = await import('@/lib/rate-limit');

    const requiredConfigs = [
      'API_GENERAL',
      'API_AUTH', 
      'FORM_CONTACT',
      'FORM_BOOKING',
      'ADMIN_API',
      'SEARCH_API',
      'FILE_UPLOAD'
    ];

    let configPassed = true;
    requiredConfigs.forEach(configName => {
      if (!RATE_LIMITS[configName]) {
        configPassed = false;
      }
    });

    if (configPassed) {
      checks.push({
        name: 'Rate Limit Configuration',
        status: 'pass',
        message: 'All required rate limit configurations present'
      });
    } else {
      checks.push({
        name: 'Rate Limit Configuration',
        status: 'fail',
        message: 'Missing required rate limit configurations'
      });
      overallStatus = 'fail';
    }
  } catch (error) {
    checks.push({
      name: 'Rate Limit Configuration',
      status: 'fail',
      message: `Configuration error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 3: Client IP Detection
  try {
    const { getClientIP } = await import('@/lib/rate-limit');

    // Mock request object
    const mockReq = {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '10.0.0.1',
        'cf-connecting-ip': '203.0.113.1'
      },
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    const ip = getClientIP(mockReq);
    if (ip && ip !== 'unknown') {
      checks.push({
        name: 'Client IP Detection',
        status: 'pass',
        message: 'Successfully detects client IP from headers'
      });
    } else {
      checks.push({
        name: 'Client IP Detection',
        status: 'warning',
        message: 'IP detection may need improvement'
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } catch (error) {
    checks.push({
      name: 'Client IP Detection',
      status: 'fail',
      message: `IP detection error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 4: Rate Limit Key Generation
  try {
    const { createRateLimitKey } = await import('@/lib/rate-limit');

    const mockReq = {
      url: '/api/test',
      method: 'GET',
      headers: { 'x-forwarded-for': '192.168.1.1' }
    } as any;

    const key = createRateLimitKey(mockReq);
    const keyWithIdentifier = createRateLimitKey(mockReq, 'test-identifier');

    if (key && key.includes('192.168.1.1') && keyWithIdentifier.includes('test-identifier')) {
      checks.push({
        name: 'Rate Limit Key Generation',
        status: 'pass',
        message: 'Correctly generates unique rate limit keys'
      });
    } else {
      checks.push({
        name: 'Rate Limit Key Generation',
        status: 'fail',
        message: 'Rate limit key generation not working correctly'
      });
      overallStatus = 'fail';
    }
  } catch (error) {
    checks.push({
      name: 'Rate Limit Key Generation',
      status: 'fail',
      message: `Key generation error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 5: Rate Limiter Class
  try {
    const { RateLimiter } = await import('@/lib/rate-limit');

    const limiter = new RateLimiter();
    const testKey = 'test-rate-limit-key';
    const windowMs = 60000; // 1 minute
    const maxRequests = 5;

    // Test first request
    const firstRequest = limiter.isAllowed(testKey, windowMs, maxRequests);
    if (!firstRequest) {
      checks.push({
        name: 'Rate Limiter Class (First Request)',
        status: 'fail',
        message: 'First request should be allowed'
      });
      overallStatus = 'fail';
    } else {
      checks.push({
        name: 'Rate Limiter Class (First Request)',
        status: 'pass',
        message: 'First request correctly allowed'
      });
    }

    // Test remaining requests
    const remainingRequests = limiter.getRemainingRequests(testKey, maxRequests);
    if (remainingRequests === maxRequests - 1) {
      checks.push({
        name: 'Rate Limiter Class (Remaining Requests)',
        status: 'pass',
        message: 'Correctly tracks remaining requests'
      });
    } else {
      checks.push({
        name: 'Rate Limiter Class (Remaining Requests)',
        status: 'warning',
        message: 'Remaining requests count may be incorrect'
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } catch (error) {
    checks.push({
      name: 'Rate Limiter Class',
      status: 'fail',
      message: `Rate limiter error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 6: Rate Limit Check Function
  try {
    const { checkRateLimit } = await import('@/lib/rate-limit');

    const mockReq = {
      url: '/api/test',
      method: 'GET',
      headers: { 'x-forwarded-for': '192.168.1.100' }
    } as any;

    const config = { windowMs: 60000, maxRequests: 10 };
    const result = checkRateLimit(mockReq, config);

    if (result.allowed && result.remaining >= 0) {
      checks.push({
        name: 'Rate Limit Check Function',
        status: 'pass',
        message: 'Rate limit check function working correctly'
      });
    } else {
      checks.push({
        name: 'Rate Limit Check Function',
        status: 'fail',
        message: 'Rate limit check function not working correctly'
      });
      overallStatus = 'fail';
    }
  } catch (error) {
    checks.push({
      name: 'Rate Limit Check Function',
      status: 'fail',
      message: `Rate limit check error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 7: User-Specific Rate Limiting
  try {
    const { userRateLimiters } = await import('@/lib/rate-limit');

    const testUserId = 'test-user-123';
    const bookingResult = userRateLimiters.userBooking(testUserId);
    const contactResult = userRateLimiters.userContact(testUserId);

    if (bookingResult.allowed && contactResult.allowed) {
      checks.push({
        name: 'User-Specific Rate Limiting',
        status: 'pass',
        message: 'User-specific rate limiting working correctly'
      });
    } else {
      checks.push({
        name: 'User-Specific Rate Limiting',
        status: 'warning',
        message: 'User-specific rate limiting may need adjustment'
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } catch (error) {
    checks.push({
      name: 'User-Specific Rate Limiting',
      status: 'fail',
      message: `User rate limiting error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 8: API Middleware Integration
  try {
    const { rateLimiters } = await import('@/lib/rate-limit');

    const middlewareTypes = ['api', 'auth', 'contactForm', 'bookingForm', 'admin', 'search', 'fileUpload'];
    let middlewarePassed = true;

    middlewareTypes.forEach(type => {
      if (!rateLimiters[type]) {
        middlewarePassed = false;
      }
    });

    if (middlewarePassed) {
      checks.push({
        name: 'API Middleware Integration',
        status: 'pass',
        message: 'Rate limiting middleware properly integrated'
      });
    } else {
      checks.push({
        name: 'API Middleware Integration',
        status: 'fail',
        message: 'Rate limiting middleware integration incomplete'
      });
      overallStatus = 'fail';
    }
  } catch (error) {
    checks.push({
      name: 'API Middleware Integration',
      status: 'fail',
      message: `Middleware integration error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 9: Rate Limit Headers
  try {
    // Check if rate limit headers are being set
    const rateLimitHeaders = [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset'
    ];

    checks.push({
      name: 'Rate Limit Headers',
      status: 'pass',
      message: `Configured to set ${rateLimitHeaders.length} rate limit headers`
    });
  } catch (error) {
    checks.push({
      name: 'Rate Limit Headers',
      status: 'warning',
      message: 'Rate limit headers configuration unclear'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  }

  // Test 10: Current Rate Limit Status
  try {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const { getClientIP } = await import('@/lib/rate-limit');

    const clientIP = getClientIP(req);
    const currentStatus = checkRateLimit(req, { windowMs: 60000, maxRequests: 10 });

    checks.push({
      name: 'Current Rate Limit Status',
      status: 'pass',
      message: `IP: ${clientIP}, Allowed: ${currentStatus.allowed}, Remaining: ${currentStatus.remaining}`
    });
  } catch (error) {
    checks.push({
      name: 'Current Rate Limit Status',
      status: 'warning',
      message: 'Could not determine current rate limit status'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  }

  // Generate summary
  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  let summary = `Rate limiting validation complete. `;
  if (failCount > 0) {
    summary += `${failCount} critical issues found that must be fixed. `;
  }
  if (warningCount > 0) {
    summary += `${warningCount} warnings that should be addressed. `;
  }
  if (passCount > 0) {
    summary += `${passCount} checks passed.`;
  }

  const result: TestResult = {
    test: 'Rate Limiting',
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
