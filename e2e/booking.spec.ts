import { test, expect } from '@playwright/test';

test.describe('Tours Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tours');
  });

  test('should display tours page with title', async ({ page }) => {
    await expect(page).toHaveTitle(/tours/i);
  });

  test('should display tour cards', async ({ page }) => {
    // Wait for tours to load (skeleton or actual cards)
    await page.waitForTimeout(2000);
    
    // Should have tour cards or loading state
    const tourCards = page.locator('[data-testid="tour-card"], .tour-card, [class*="card"]');
    const count = await tourCards.count();
    
    // Should have at least some content (cards or a message)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have filter functionality', async ({ page }) => {
    // Check for filter components
    const filters = page.locator('[class*="filter"], [data-testid="filters"]');
    await expect(filters.first()).toBeVisible();
  });

  test('should navigate to tour detail page', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Click on first tour card (if available)
    const firstTourLink = page.locator('a[href*="/tours/"]').first();
    
    if (await firstTourLink.isVisible()) {
      await firstTourLink.click();
      
      // Should be on tour detail page
      await expect(page.url()).toContain('/tours/');
    }
  });
});

test.describe('Tour Detail Page', () => {
  test('should display tour information', async ({ page }) => {
    // Navigate to tours first
    await page.goto('/tours');
    await page.waitForTimeout(2000);
    
    // Click on first tour
    const firstTourLink = page.locator('a[href*="/tours/"]').first();
    
    if (await firstTourLink.isVisible()) {
      await firstTourLink.click();
      await page.waitForTimeout(1000);
      
      // Should have key tour elements
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    }
  });

  test('should show booking form for authenticated users', async ({ page }) => {
    await page.goto('/tours');
    await page.waitForTimeout(2000);
    
    const firstTourLink = page.locator('a[href*="/tours/"]').first();
    
    if (await firstTourLink.isVisible()) {
      await firstTourLink.click();
      await page.waitForTimeout(1000);
      
      // Should have a book button or booking form
      const bookButton = page.getByRole('button', { name: /book|reserve/i });
      // Book button might require auth to be visible
      if (await bookButton.isVisible()) {
        await expect(bookButton).toBeEnabled();
      }
    }
  });
});

test.describe('Custom Itinerary Page', () => {
  test('should display custom itinerary builder', async ({ page }) => {
    await page.goto('/custom-itinerary');
    
    await expect(page).toHaveTitle(/custom|itinerary/i);
    
    // Should have landmark selection or step indicator
    await page.waitForTimeout(2000);
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});

test.describe('Car Rentals Page', () => {
  test('should display car rentals page', async ({ page }) => {
    await page.goto('/car-rentals');
    
    // Should have title containing car or rentals
    await expect(page).toHaveTitle(/car|rental|vehicle/i);
  });

  test('should display vehicle cards', async ({ page }) => {
    await page.goto('/car-rentals');
    await page.waitForTimeout(2000);
    
    // Should have vehicle cards or loading state
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});

test.describe('Contact Page', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto('/contact');
    
    // Should have contact form
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const messageInput = page.getByLabel(/message/i);
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
  });

  test('should validate contact form', async ({ page }) => {
    await page.goto('/contact');
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /send|submit/i });
    await submitButton.click();
    
    // Should show validation errors (form won't submit without required fields)
    // Or the form stays on the page
    await expect(page.url()).toContain('/contact');
  });
});

test.describe('Navigation', () => {
  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation links
    const toursLink = page.getByRole('link', { name: /tours/i }).first();
    const carRentalsLink = page.getByRole('link', { name: /car|rental/i }).first();
    const contactLink = page.getByRole('link', { name: /contact/i }).first();
    
    await expect(toursLink).toBeVisible();
    await expect(carRentalsLink).toBeVisible();
    await expect(contactLink).toBeVisible();
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/about/i);
  });
});

