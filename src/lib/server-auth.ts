import { GetServerSidePropsContext } from 'next';

export interface ServerUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Extract user information from middleware-set headers
 * Use this in getServerSideProps to get authenticated user info
 */
export function getServerUser(context: GetServerSidePropsContext): ServerUser | null {
  const { req } = context;
  
  const uid = req.headers['x-user-id'] as string | undefined;
  const email = req.headers['x-user-email'] as string | undefined;
  const isAdmin = req.headers['x-is-admin'] === 'true';

  if (!uid || !email) {
    return null;
  }

  return {
    uid,
    email,
    isAdmin,
  };
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export function requireAuth(context: GetServerSidePropsContext): ServerUser {
  const user = getServerUser(context);
  
  if (!user) {
    const { res } = context;
    const redirectUrl = `/login?redirect=${encodeURIComponent(context.resolvedUrl)}`;
    res.writeHead(302, { Location: redirectUrl });
    res.end();
    // This will never execute, but TypeScript needs it
    throw new Error('Redirecting to login');
  }

  return user;
}

/**
 * Require admin access - redirects to login if not authenticated, or unauthorized if not admin
 */
export function requireAdmin(context: GetServerSidePropsContext): ServerUser {
  const user = requireAuth(context);
  
  if (!user.isAdmin) {
    const { res } = context;
    res.writeHead(302, { Location: '/unauthorized' });
    res.end();
    // This will never execute, but TypeScript needs it
    throw new Error('Redirecting to unauthorized');
  }

  return user;
}

