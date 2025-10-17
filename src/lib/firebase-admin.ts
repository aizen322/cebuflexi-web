import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
let adminApp;
let adminAuth;
let adminDb;

if (!getApps().length) {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
} else {
  adminApp = getApps()[0];
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
}

export { adminAuth, adminDb };

// Helper function to verify ID token
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, user: decodedToken };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to get user by UID
export async function getUserByUid(uid: string) {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return { success: true, user: userRecord };
  } catch (error) {
    console.error('Get user failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to create custom claims for roles
export async function setUserRole(uid: string, role: 'user' | 'admin' | 'moderator') {
  try {
    await adminAuth.setCustomUserClaims(uid, { role });
    return { success: true };
  } catch (error) {
    console.error('Set user role failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to check if user has admin role
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUser(uid);
    return user.customClaims?.role === 'admin';
  } catch (error) {
    console.error('Check admin role failed:', error);
    return false;
  }
}

// Helper function to get user role
export async function getUserRole(uid: string): Promise<string | null> {
  try {
    const user = await adminAuth.getUser(uid);
    return user.customClaims?.role || 'user';
  } catch (error) {
    console.error('Get user role failed:', error);
    return null;
  }
}

// Helper function to create user
export async function createUser(email: string, password: string, displayName?: string) {
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });
    
    // Set default role
    await setUserRole(userRecord.uid, 'user');
    
    return { success: true, user: userRecord };
  } catch (error) {
    console.error('Create user failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to delete user
export async function deleteUser(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    return { success: true };
  } catch (error) {
    console.error('Delete user failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to update user
export async function updateUser(uid: string, updates: {
  email?: string;
  displayName?: string;
  emailVerified?: boolean;
  disabled?: boolean;
}) {
  try {
    const userRecord = await adminAuth.updateUser(uid, updates);
    return { success: true, user: userRecord };
  } catch (error) {
    console.error('Update user failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to list users with pagination
export async function listUsers(maxResults: number = 100, pageToken?: string) {
  try {
    const listUsersResult = await adminAuth.listUsers(maxResults, pageToken);
    return {
      success: true,
      users: listUsersResult.users,
      pageToken: listUsersResult.pageToken,
    };
  } catch (error) {
    console.error('List users failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to generate email verification link
export async function generateEmailVerificationLink(email: string, continueUrl?: string) {
  try {
    const link = await adminAuth.generateEmailVerificationLink(email, {
      url: continueUrl || `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`,
    });
    return { success: true, link };
  } catch (error) {
    console.error('Generate email verification link failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to generate password reset link
export async function generatePasswordResetLink(email: string, continueUrl?: string) {
  try {
    const link = await adminAuth.generatePasswordResetLink(email, {
      url: continueUrl || `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });
    return { success: true, link };
  } catch (error) {
    console.error('Generate password reset link failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to revoke all refresh tokens for a user
export async function revokeRefreshTokens(uid: string) {
  try {
    await adminAuth.revokeRefreshTokens(uid);
    return { success: true };
  } catch (error) {
    console.error('Revoke refresh tokens failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to get user session info
export async function getUserSessionInfo(uid: string) {
  try {
    const user = await adminAuth.getUser(uid);
    return {
      success: true,
      session: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        customClaims: user.customClaims,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        },
      },
    };
  } catch (error) {
    console.error('Get user session info failed:', error);
    return { success: false, error: error.message };
  }
}
