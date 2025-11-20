import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken } from '@/lib/firebase-admin';
import { setSessionCookie, clearSessionCookie, getTokenFromRequest } from '@/lib/auth-session';

type Data = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { action, token } = req.body;

  if (action === 'set') {
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    try {
      // Verify the token before setting the cookie
      const verification = await verifyIdToken(token);
      
      if (!verification.success) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      // Set the session cookie
      setSessionCookie(res, token);
      
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error setting session cookie:', error);
      return res.status(500).json({ success: false, error: 'Failed to set session' });
    }
  }

  if (action === 'clear') {
    // Clear the session cookie
    clearSessionCookie(res);
    
    return res.status(200).json({ success: true });
  }

  if (action === 'verify') {
    // Verify existing session cookie
    const existingToken = getTokenFromRequest(req);
    
    if (!existingToken) {
      return res.status(401).json({ success: false, error: 'No session found' });
    }

    try {
      const verification = await verifyIdToken(existingToken);
      
      if (!verification.success) {
        clearSessionCookie(res);
        return res.status(401).json({ success: false, error: 'Invalid session' });
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error verifying session:', error);
      clearSessionCookie(res);
      return res.status(401).json({ success: false, error: 'Invalid session' });
    }
  }

  return res.status(400).json({ success: false, error: 'Invalid action' });
}

