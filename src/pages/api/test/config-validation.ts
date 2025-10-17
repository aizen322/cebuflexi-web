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

  // Check Firebase Client Configuration
  const firebaseClientVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  let firebaseClientPassed = true;
  firebaseClientVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'your_firebase_value') {
      checks.push({
        name: `Firebase Client: ${varName}`,
        status: 'fail',
        message: 'Not configured or using placeholder value'
      });
      firebaseClientPassed = false;
      overallStatus = 'fail';
    } else {
      checks.push({
        name: `Firebase Client: ${varName}`,
        status: 'pass',
        message: 'Configured correctly'
      });
    }
  });

  // Check Firebase Admin Configuration
  const firebaseAdminVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];

  let firebaseAdminPassed = true;
  firebaseAdminVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('placeholder')) {
      checks.push({
        name: `Firebase Admin: ${varName}`,
        status: 'fail',
        message: 'Not configured or using placeholder value'
      });
      firebaseAdminPassed = false;
      overallStatus = 'fail';
    } else {
      checks.push({
        name: `Firebase Admin: ${varName}`,
        status: 'pass',
        message: 'Configured correctly'
      });
    }
  });

  // Check Project ID Match
  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const adminProjectId = process.env.FIREBASE_PROJECT_ID;
  
  if (clientProjectId && adminProjectId && clientProjectId === adminProjectId) {
    checks.push({
      name: 'Project ID Consistency',
      status: 'pass',
      message: 'Client and Admin project IDs match'
    });
  } else {
    checks.push({
      name: 'Project ID Consistency',
      status: 'fail',
      message: 'Client and Admin project IDs do not match'
    });
    overallStatus = 'fail';
  }

  // Check Private Key Format
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    // Check if it contains the private key markers
    const hasMarkers = privateKey.includes('-----BEGIN PRIVATE KEY-----') && 
                      privateKey.includes('-----END PRIVATE KEY-----');
    
    // Check if it has proper formatting (actual newlines which is what we want)
    const hasNewlines = privateKey.includes('\n');
    
    // Check minimum length (private keys are long)
    const hasProperLength = privateKey.length > 100;
    
    if (hasMarkers && hasNewlines && hasProperLength) {
      checks.push({
        name: 'Private Key Format',
        status: 'pass',
        message: 'Correctly formatted with proper line breaks'
      });
    } else {
      let issues = [];
      if (!hasMarkers) issues.push('missing private key markers');
      if (!hasNewlines) issues.push('missing line breaks (\\n)');
      if (!hasProperLength) issues.push('key too short');
      
      checks.push({
        name: 'Private Key Format',
        status: 'fail',
        message: `Format issues: ${issues.join(', ')}. Ensure private key has \\n for line breaks`
      });
      overallStatus = 'fail';
    }
  }

  // Check Security Secrets
  const jwtSecret = process.env.JWT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;

  if (jwtSecret && jwtSecret.length >= 32 && !jwtSecret.includes('your_')) {
    checks.push({
      name: 'JWT Secret',
      status: 'pass',
      message: 'Configured with sufficient length'
    });
  } else {
    checks.push({
      name: 'JWT Secret',
      status: 'fail',
      message: 'Not configured or too short (minimum 32 characters)'
    });
    overallStatus = 'fail';
  }

  if (sessionSecret && sessionSecret.length >= 32 && !sessionSecret.includes('your_')) {
    checks.push({
      name: 'Session Secret',
      status: 'pass',
      message: 'Configured with sufficient length'
    });
  } else {
    checks.push({
      name: 'Session Secret',
      status: 'fail',
      message: 'Not configured or too short (minimum 32 characters)'
    });
    overallStatus = 'fail';
  }

  if (jwtSecret && sessionSecret && jwtSecret === sessionSecret) {
    checks.push({
      name: 'Secret Uniqueness',
      status: 'warning',
      message: 'JWT and Session secrets should be different'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  } else {
    checks.push({
      name: 'Secret Uniqueness',
      status: 'pass',
      message: 'JWT and Session secrets are different'
    });
  }

  // Check Application Configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && (appUrl.startsWith('http://') || appUrl.startsWith('https://'))) {
    checks.push({
      name: 'Application URL',
      status: 'pass',
      message: 'Properly configured with protocol'
    });
  } else {
    checks.push({
      name: 'Application URL',
      status: 'warning',
      message: 'Should include protocol (http:// or https://)'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  }

  // Test Firebase Admin SDK Initialization
  try {
    const { adminAuth } = await import('@/lib/firebase-admin');
    if (adminAuth) {
      checks.push({
        name: 'Firebase Admin SDK',
        status: 'pass',
        message: 'Successfully initialized'
      });
    } else {
      checks.push({
        name: 'Firebase Admin SDK',
        status: 'fail',
        message: 'Failed to initialize'
      });
      overallStatus = 'fail';
    }
  } catch (error) {
    checks.push({
      name: 'Firebase Admin SDK',
      status: 'fail',
      message: `Initialization error: ${error.message}`
    });
    overallStatus = 'fail';
  }

  // Check Node Environment
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'development' || nodeEnv === 'production' || nodeEnv === 'test') {
    checks.push({
      name: 'Node Environment',
      status: 'pass',
      message: `Set to ${nodeEnv}`
    });
  } else {
    checks.push({
      name: 'Node Environment',
      status: 'warning',
      message: 'Should be development, production, or test'
    });
    if (overallStatus === 'pass') overallStatus = 'warning';
  }

  // Generate summary
  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  let summary = `Configuration validation complete. `;
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
    test: 'Configuration Validation',
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
