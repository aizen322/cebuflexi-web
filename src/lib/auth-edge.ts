import { jwtVerify, createRemoteJWKSet } from 'jose';

// Firebase project ID from environment variables
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// URL to fetch Firebase public keys
const JWKS_URL = new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');

// Create a remote JWK set to verify the signature
// This automatically caches the keys
const JWKS = createRemoteJWKSet(JWKS_URL);

export interface DecodedToken {
  uid: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
  customClaims?: {
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function verifyIdToken(token: string): Promise<{ success: boolean; user?: DecodedToken; error?: Error }> {
  if (!PROJECT_ID) {
    console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
    return { success: false, error: new Error('Configuration error') };
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
      algorithms: ['RS256'],
    });

    // Extract user info and custom claims
    const user: DecodedToken = {
      uid: payload.sub as string,
      email: payload.email as string,
      picture: payload.picture as string,
      email_verified: payload.email_verified as boolean,
      customClaims: {
        role: (payload.role as string) || 'user',
      },
      ...payload,
    };

    return { success: true, user };
  } catch (error) {
    console.error('Edge token verification failed:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
