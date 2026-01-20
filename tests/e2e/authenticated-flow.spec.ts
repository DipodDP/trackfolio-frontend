import { test, expect } from "@playwright/test";
import {
  MOCK_USER,
  MOCK_LOGIN_RESPONSE,
  MOCK_PORTFOLIO_ANALYSIS,
} from "./mocks/data";

const BASE_URL = "http://localhost:3000";

test.describe("Authenticated User Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock login API call
    await page.route("**/api/v1/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_LOGIN_RESPONSE),
      });
    });

    // Mock user profile API call
    await page.route("**/api/v1/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER),
      });
    });

    // Mock portfolio analysis API call
    await page.route(
      "**/api/v1/api-clients/*/portfolio-analysis/full",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_PORTFOLIO_ANALYSIS),
        });
      }
    );
  });

  test("should successfully log in and display dashboard data", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/login`);

    // Fill in login form
    await page.getByLabel("Username or Email").fill(MOCK_USER.username);
    await page.locator("#password").fill("anypassword"); // Password doesn't matter due to mocking

    // Submit form
    await page.getByRole("button", { name: "Sign In" }).click();

    // Expect to be redirected to the dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);

    // Verify dashboard elements and mocked data
    await expect(page.getByText(`Welcome, ${MOCK_USER.full_name}`)).toBeVisible();
    await expect(page.getByText("Total Portfolio Value")).toBeVisible();
    await expect(page.getByText("RUB 100,000")).toBeVisible(); // Check for formatted value
    await expect(page.getByText("Apple Inc.")).toBeVisible();
    await expect(page.getByText("Alphabet Inc.")).toBeVisible();
  });
});
