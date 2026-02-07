import { test, expect } from "@playwright/test";
import {
  MOCK_USER,
  MOCK_LOGIN_RESPONSE,
  MOCK_REFRESH_RESPONSE,
} from "./mocks/data";

const BASE_URL = "http://localhost:3000";

test.describe("Token Refresh Flow", () => {
  test("should automatically refresh token on 401", async ({ page }) => {
    let refreshCalled = false;

    // Mock login
    await page.route("**/api/v1/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_LOGIN_RESPONSE),
      });
    });

    // Mock user profile: first call returns 401, subsequent calls succeed
    let userCallCount = 0;
    await page.route("**/api/v1/users/me", async (route) => {
      userCallCount++;
      if (userCallCount === 1) {
        // First call after login succeeds (used during login flow)
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_USER),
        });
      } else if (userCallCount === 2) {
        // Second call returns 401 to trigger refresh
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Token expired" }),
        });
      } else {
        // After refresh, succeed
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_USER),
        });
      }
    });

    // Mock refresh endpoint
    await page.route("**/api/v1/refresh", async (route) => {
      refreshCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_REFRESH_RESPONSE),
      });
    });

    // Mock portfolio analysis
    await page.route(
      "**/api/v1/api-clients/*/portfolio-analysis/full",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      }
    );

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel("Username or Email").fill(MOCK_USER.username);
    await page.locator("#password").fill("anypassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

    // The interceptor should have called refresh when it got a 401
    // and retried the original request
    expect(refreshCalled).toBe(true);
  });

  test("should redirect to login on refresh failure", async ({ page }) => {
    // Mock login
    await page.route("**/api/v1/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_LOGIN_RESPONSE),
      });
    });

    // Mock user profile: first call succeeds, second returns 401
    let userCallCount = 0;
    await page.route("**/api/v1/users/me", async (route) => {
      userCallCount++;
      if (userCallCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_USER),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Token expired" }),
        });
      }
    });

    // Mock refresh endpoint — fails
    await page.route("**/api/v1/refresh", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Refresh token invalid" }),
      });
    });

    // Mock portfolio analysis
    await page.route(
      "**/api/v1/api-clients/*/portfolio-analysis/full",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      }
    );

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel("Username or Email").fill(MOCK_USER.username);
    await page.locator("#password").fill("anypassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should be redirected to login after failed refresh
    await expect(page).toHaveURL(`${BASE_URL}/login`, { timeout: 10000 });
  });

  test("should not loop infinitely on persistent 401", async ({ page }) => {
    let refreshCallCount = 0;

    // Mock login
    await page.route("**/api/v1/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_LOGIN_RESPONSE),
      });
    });

    // Mock user profile — always returns 401
    let userMeCallCount = 0;
    await page.route("**/api/v1/users/me", async (route) => {
      userMeCallCount++;
      if (userMeCallCount === 1) {
        // First call succeeds (login flow)
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_USER),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Token expired" }),
        });
      }
    });

    // Mock refresh — always succeeds but the retried request still fails
    await page.route("**/api/v1/refresh", async (route) => {
      refreshCallCount++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_REFRESH_RESPONSE),
      });
    });

    // Mock portfolio analysis
    await page.route(
      "**/api/v1/api-clients/*/portfolio-analysis/full",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      }
    );

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel("Username or Email").fill(MOCK_USER.username);
    await page.locator("#password").fill("anypassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for navigation to settle
    await page.waitForTimeout(3000);

    // Refresh should be called at most once per failed request (no infinite loop)
    // The _retry flag prevents the interceptor from calling refresh more than once
    expect(refreshCallCount).toBeLessThanOrEqual(2);
  });
});
