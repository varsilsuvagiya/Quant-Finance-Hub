/**
 * E2E tests for strategy management
 * @module e2e/strategies.spec
 */

import { test, expect } from "@playwright/test";

test.describe("Strategy Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("should create a new strategy", async ({ page }) => {
    await page.goto("/dashboard");

    // Click create strategy button
    await page.click('button:has-text("Create Strategy")');

    // Fill in form
    await page.fill('input[placeholder*="Strategy name"]', "E2E Test Strategy");
    await page.fill(
      'textarea[placeholder*="Detailed description"]',
      "This is a test strategy created by E2E tests"
    );
    await page.fill('input[placeholder*="Entry"]', "RSI < 30");
    await page.fill('input[placeholder*="Exit"]', "RSI > 70");
    await page.fill('input[placeholder*="Timeframe"]', "1h");

    // Submit form
    await page.click('button:has-text("Create Strategy")');

    // Should see success message and new strategy
    await expect(page.locator("text=E2E Test Strategy")).toBeVisible();
  });

  test("should search for strategies", async ({ page }) => {
    await page.goto("/dashboard");

    // Search for strategy
    await page.fill('input[placeholder*="Search"]', "Test");
    await page.waitForTimeout(500); // Wait for debounce

    // Should show filtered results
    await expect(
      page.locator('[data-testid="strategy-card"]').first()
    ).toBeVisible();
  });

  test("should filter strategies by risk level", async ({ page }) => {
    await page.goto("/dashboard");

    // Select risk filter
    await page.click('button:has-text("Risk")');
    await page.click("text=Low");

    // Should show filtered strategies
    await expect(
      page.locator('[data-testid="strategy-card"]').first()
    ).toBeVisible();
  });
});
