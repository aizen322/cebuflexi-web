import type { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth, adminDb, setUserRole } from '@/lib/firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { secret, email } = req.body;

    // Verify secret key
    if (!secret || secret !== process.env.ADMIN_SETUP_SECRET) {
      return res.status(401).json({ error: 'Invalid secret key' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if any admin already exists
    const usersSnapshot = await adminDb.collection('users').get();
    const hasAdmin = usersSnapshot.docs.some(doc => {
      const data = doc.data();
      return data.role === 'admin';
    });

    if (hasAdmin) {
      return res.status(400).json({ 
        error: 'An admin user already exists. Use Firebase Console to manage roles.' 
      });
    }

    // Get the user by email
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (error) {
      return res.status(404).json({ 
        error: 'User not found. Please create an account first, then run this setup.' 
      });
    }

    // Set admin role (custom claim)
    const roleResult = await setUserRole(userRecord.uid, 'admin');
    if (!roleResult.success) {
      return res.status(500).json({ 
        error: 'Failed to set admin role',
        details: roleResult.error 
      });
    }

    // Update user document in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      role: 'admin',
      updatedAt: new Date(),
    }, { merge: true });

    // Revoke all refresh tokens to force re-authentication with new custom claim
    const { revokeRefreshTokens } = await import('@/lib/firebase-admin');
    await revokeRefreshTokens(userRecord.uid);

    return res.status(200).json({ 
      success: true, 
      message: `Admin role granted to ${email}. Please sign out and sign back in to refresh your token.`,
      uid: userRecord.uid
    });

  } catch (error: any) {
    console.error('Setup admin error:', error);
    return res.status(500).json({ 
      error: 'Failed to setup admin',
      details: error.message 
    });
  }
}


