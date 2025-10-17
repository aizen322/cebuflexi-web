import { NextApiRequest, NextApiResponse } from 'next';
import { handleCSRFTokenRequest } from '@/lib/csrf';
import { withApiSecurity, withErrorHandler } from '@/lib/api-middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return handleCSRFTokenRequest(req, res);
};

// Apply security middleware
export default withErrorHandler(
  withApiSecurity(null, {
    rateLimit: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 tokens per minute
  })(handler)
);
