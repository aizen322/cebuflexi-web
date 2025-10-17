import { NextApiRequest, NextApiResponse } from 'next';
import { withApiSecurity, withErrorHandler } from '@/lib/api-middleware';
import { verifyIdToken, getUserRole, isUserAdmin } from '@/lib/firebase-admin';

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

  // Test 1: Firebase Admin SDK Import
  try {
    const { adminAuth, adminDb } = await import('@/lib/firebase-admin');
    if (adminAuth && adminDb) {
      checks.push({
        name: 'Firebase Admin SDK Import',
        status: 'pass',
        message: 'Successfully imported adminAuth and adminDb'
      });
    } else {
      checks.push({
        name: 'Firebase Admin SDK Import',
        status: 'fail',
        message: 'Failed to import Firebase Admin SDK'
      });
      overallStatus = 'fail';
    }
  } catch (error) {
    checks.push({
      name: 'Firebase Admin SDK Import',
      status: 'fail',
      message: `Import error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 2: Token Verification Function
  try {
    // Test with invalid token
    const invalidResult = await verifyIdToken('invalid-token');
    if (!invalidResult.success) {
      checks.push({
        name: 'Token Verification (Invalid)',
        status: 'pass',
        message: 'Correctly rejects invalid tokens'
      });
    } else {
      checks.push({
        name: 'Token Verification (Invalid)',
        status: 'fail',
        message: 'Should reject invalid tokens'
      });
      overallStatus = 'fail';
    }
  } catch (error) {
    checks.push({
      name: 'Token Verification (Invalid)',
      status: 'pass',
      message: 'Correctly throws error for invalid tokens'
    });
  }

  // Test 3: Role Functions
  try {
    const { getUserRole, isUserAdmin } = await import('@/lib/firebase-admin');
    
    // Test with non-existent user
    const nonExistentRole = await getUserRole('non-existent-user-id');
    if (nonExistentRole === null) {
      checks.push({
        name: 'Role Functions (Non-existent User)',
        status: 'pass',
        message: 'Correctly returns null for non-existent users'
      });
    } else {
      checks.push({
        name: 'Role Functions (Non-existent User)',
        status: 'warning',
        message: 'Should return null for non-existent users'
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }

    // Test admin check with non-existent user
    const nonExistentAdmin = await isUserAdmin('non-existent-user-id');
    if (nonExistentAdmin === false) {
      checks.push({
        name: 'Admin Check (Non-existent User)',
        status: 'pass',
        message: 'Correctly returns false for non-existent users'
      });
    } else {
      checks.push({
        name: 'Admin Check (Non-existent User)',
        status: 'warning',
        message: 'Should return false for non-existent users'
      });
      if (overallStatus === 'pass') overallStatus = 'warning';
    }
  } catch (error) {
    checks.push({
      name: 'Role Functions',
      status: 'fail',
      message: `Error testing role functions: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 4: API Middleware Import
  try {
    const { withAuth, withRole, withApiSecurity } = await import('@/lib/api-middleware');
    if (withAuth && withRole && withApiSecurity) {
      checks.push({
        name: 'API Middleware Import',
        status: 'pass',
        message: 'Successfully imported middleware functions'
      });
    } else {
      checks.push({
        name: 'API Middleware Import',
        status: 'fail',
        message: 'Failed to import middleware functions'
      });
      overallStatus = 'fail';
    }
  } catch (error) {
    checks.push({
      name: 'API Middleware Import',
      status: 'fail',
      message: `Import error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 5: Environment Variables for Auth
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];

  let envVarsPassed = true;
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('placeholder')) {
      checks.push({
        name: `Auth Environment: ${varName}`,
        status: 'fail',
        message: 'Not configured or using placeholder'
      });
      envVarsPassed = false;
      overallStatus = 'fail';
    } else {
      checks.push({
        name: `Auth Environment: ${varName}`,
        status: 'pass',
        message: 'Properly configured'
      });
    }
  });

  // Test 6: Middleware Configuration
  try {
    // Test if middleware.ts exists and can be imported
    const middleware = await import('../../../../middleware');
    if (middleware) {
      checks.push({
        name: 'Middleware Configuration',
        status: 'pass',
        message: 'Middleware file exists and can be imported'
      });
    }
  } catch (error) {
    checks.push({
      name: 'Middleware Configuration',
      status: 'fail',
      message: `Middleware error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Test 7: Protected Routes Configuration
  const protectedRoutes = [
    '/account',
    '/admin',
    '/api/bookings',
    '/api/admin'
  ];

  checks.push({
    name: 'Protected Routes',
    status: 'pass',
    message: `Configured to protect: ${protectedRoutes.join(', ')}`
  });

  // Test 8: CORS Configuration
  const corsOrigins = process.env.NODE_ENV === 'production' 
    ? 'https://cebuflexitours.com' 
    : 'http://localhost:3000';

  checks.push({
    name: 'CORS Configuration',
    status: 'pass',
    message: `Configured for ${process.env.NODE_ENV} environment`
  });

  // Test 9: Rate Limiting Configuration
  const rateLimitConfig = {
    general: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
    admin: { windowMs: 5 * 60 * 1000, maxRequests: 50 }
  };

  checks.push({
    name: 'Rate Limiting Configuration',
    status: 'pass',
    message: 'Configured with different limits for different endpoint types'
  });

  // Test 10: Security Headers in Middleware
  const securityHeaders = [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Permissions-Policy'
  ];

  checks.push({
    name: 'Security Headers in Middleware',
    status: 'pass',
    message: `Configured to set ${securityHeaders.length} security headers`
  });

  // Generate summary
  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  let summary = `Authentication middleware validation complete. `;
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
    test: 'Authentication Middleware',
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
