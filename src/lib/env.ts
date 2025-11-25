import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Environment variable validation and type-safe access
 * 
 * This ensures all required environment variables are set and properly typed.
 * Missing or invalid environment variables will throw an error at build time.
 */
export const env = createEnv({
  /**
   * Server-side environment variables
   * These are only available on the server
   */
  server: {
    // Node environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    
    // Firebase Admin SDK
    FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),
    
    // Upstash Redis (Rate Limiting)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    
    // Security
    JWT_SECRET: z.string().min(32).optional(),
    SESSION_SECRET: z.string().min(32).optional(),
    ADMIN_SETUP_SECRET: z.string().min(16).optional(),
    
    // Stripe (Payment)
    STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  },
  
  /**
   * Client-side environment variables
   * These are exposed to the browser (must start with NEXT_PUBLIC_)
   */
  client: {
    // Firebase Client SDK
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
    
    // Application
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    
    // Stripe (Public Key)
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().startsWith("pk_").optional(),
  },
  
  /**
   * Runtime environment - map env vars to the schema
   */
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ADMIN_SETUP_SECRET: process.env.ADMIN_SETUP_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    
    // Client
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  },
  
  /**
   * Skip validation in certain environments
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  
  /**
   * Makes sure empty strings are treated as undefined
   */
  emptyStringAsUndefined: true,
});

/**
 * Helper to check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

/**
 * Helper to check if Firebase Admin is properly configured
 */
export function isFirebaseAdminConfigured(): boolean {
  return !!(
    env.FIREBASE_PROJECT_ID &&
    env.FIREBASE_CLIENT_EMAIL &&
    env.FIREBASE_PRIVATE_KEY
  );
}

/**
 * Helper to check if Upstash Redis is configured
 */
export function isUpstashConfigured(): boolean {
  return !!(
    env.UPSTASH_REDIS_REST_URL &&
    env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * Helper to check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    env.STRIPE_SECRET_KEY &&
    env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
  );
}

export default env;

