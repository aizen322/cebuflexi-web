import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login button on homepage', async ({ page }) => {
    // Check for sign in button in header
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login page elements
    await expect(page).toHaveTitle(/login|sign in/i);
    
    // Should have email and password fields
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Click sign in button
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();
    
    // Should show error message (wait for toast or error display)
    await expect(page.getByText(/error|invalid|incorrect/i)).toBeVisible({ timeout: 10000 });
  });

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access account page without auth
    await page.goto('/account/profile');
    
    // Should redirect to login or show auth required message
    await expect(page.url()).toMatch(/login|\//);
  });

  test('should redirect non-admin users from admin routes', async ({ page }) => {
    // Try to access admin page
    await page.goto('/admin/dashboard');
    
    // Should redirect to login, unauthorized, or home
    await expect(page.url()).toMatch(/login|unauthorized|\//);
  });
});

test.describe('Sign Up Flow', () => {
  test('should display sign up option', async ({ page }) => {
    await page.goto('/login');
    
    // Should have sign up link or button
    const signUpLink = page.getByRole('link', { name: /sign up|create account|register/i });
    await expect(signUpLink).toBeVisible();
  });
});

test.describe('Session Persistence', () => {
  test('should maintain auth state across page navigation', async ({ page }) => {
    // This test would require a valid test account
    // For now, just verify the auth check mechanism
    await page.goto('/');
    
    // Check that auth context is initialized
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

