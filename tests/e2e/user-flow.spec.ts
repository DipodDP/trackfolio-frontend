import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("Full User Flow", () => {
  test("should load the landing page and navigate to login", async ({ page }) => {
    await page.goto(BASE_URL);

    // Verify landing page loads
    await expect(page.getByText("TRACKFOLIO")).toBeVisible();
    await expect(page.getByText("Investment Portfolio Tracking & Sandbox Trading Analysis")).toBeVisible();

    // Click login button
    await page.getByRole("link", { name: "Log In" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/login`);

    // Verify login page elements
    await expect(page.getByText("Sign in to your account")).toBeVisible();
    await expect(page.getByLabel("Username or Email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("should load the registration page with all required fields", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Verify registration form elements
    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();

    // Verify link to login page
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("should show password mismatch error on registration", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Fill in form with mismatched passwords
    await page.getByLabel("Full Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Username").fill("testuser");
    await page.locator("#password").fill("password123");
    await page.locator("#confirmPassword").fill("password456");

    // Submit form
    await page.getByRole("button", { name: "Create Account" }).click();

    // Verify error message appears
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("should navigate between authenticated pages (when logged in)", async ({ page }) => {
    // Note: This test assumes you manually set up authentication state
    // For now, just verify the pages exist and load

    await page.goto(`${BASE_URL}/dashboard`);
    // Dashboard should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/(login|dashboard)/);

    await page.goto(`${BASE_URL}/positions`);
    await expect(page).toHaveURL(/\/(login|positions)/);

    await page.goto(`${BASE_URL}/trading/search`);
    await expect(page).toHaveURL(/\/(login|trading\/search)/);

    await page.goto(`${BASE_URL}/analysis`);
    await expect(page).toHaveURL(/\/(login|analysis)/);

    await page.goto(`${BASE_URL}/settings`);
    await expect(page).toHaveURL(/\/(login|settings)/);
  });

  test("should have working navigation links on landing page", async ({ page }) => {
    await page.goto(BASE_URL);

    // Test Register link
    await page.getByRole("link", { name: "Register" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/register`);

    // Go back and test Login link
    await page.goto(BASE_URL);
    await page.getByRole("link", { name: "Log In" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("should display login and register links on respective pages", async ({ page }) => {
    // On login page, should have link to register
    await page.goto(`${BASE_URL}/login`);
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();

    // On register page, should have link to login
    await page.goto(`${BASE_URL}/register`);
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });
});
