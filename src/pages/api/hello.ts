import type { NextApiRequest, NextApiResponse } from "next";
import { withApiSecurity, withErrorHandler } from "@/lib/api-middleware";

type Data = {
  name: string;
  message: string;
  timestamp: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  // Example API route with security middleware
  const data: Data = {
    name: "CebuFlexi Tours API",
    message: "Welcome to our secure API endpoint",
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(data);
};

// Apply security middleware
export default withErrorHandler(
  withApiSecurity(null, {
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  })(handler)
);
