# E2E Testing Guide

## Overview
End-to-end tests use Playwright to verify complete user workflows including registration, login, portfolio management, and trading.

## Prerequisites
- Production build: `pnpm run build`
- Running production server: `pnpm run start`

## Running Tests Locally

### Method 1: Two Terminal Approach (Recommended)

**Terminal 1 - Start Production Server:**
```bash
cd frontend
pnpm run build
pnpm run start
```
Wait until you see: `✓ Ready on http://localhost:3000`

**Terminal 2 - Run Tests:**
```bash
cd frontend
pnpm test:e2e
```

### Method 2: One-liner (After Build)
If you've already built the app:
```bash
pnpm run start &  # Start server in background
sleep 5           # Wait for server to be ready
pnpm test:e2e     # Run tests
```

## Test Files
- `tests/e2e/user-flow.spec.ts`: Main user workflows
  - Full user flow (register → login → add API client → view dashboard)
  - Invalid login error handling
  - Portfolio analysis failure handling

## Debugging Tests

### UI Mode (Interactive)
```bash
pnpm test:e2e:ui
```

### Headed Mode (See Browser)
```bash
pnpm test:e2e:headed
```

### Debug Mode (Step Through)
```bash
pnpm test:e2e:debug
```

### View Test Report
After tests run, open the HTML report:
```bash
npx playwright show-report
```

## CI/CD Integration

For continuous integration environments, ensure the server is started as a background process before running tests:

```yaml
# Example GitHub Actions workflow
- name: Build frontend
  run: |
    cd frontend
    pnpm install
    pnpm run build

- name: Start production server
  run: |
    cd frontend
    pnpm run start &

- name: Wait for server to be ready
  run: npx wait-on http://localhost:3000 --timeout 60000

- name: Run E2E tests
  run: |
    cd frontend
    pnpm test:e2e
```

## Troubleshooting

### Tests timeout connecting to server
**Problem**: Tests fail with "page.goto: net::ERR_CONNECTION_REFUSED"

**Solution**: Ensure the production server is running:
```bash
# Check if server is running
curl http://localhost:3000

# If not, start it:
pnpm run build && pnpm run start
```

### Port 3000 already in use
**Problem**: Server fails to start with "EADDRINUSE: address already in use"

**Solution**: Kill the existing process:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Tests fail with authentication errors
**Problem**: Tests fail during login step

**Solution**: The tests use mocked API responses, so this shouldn't happen. If it does:
1. Check that the test file has correct mock data
2. Verify the login form selectors match the actual UI
3. Check browser console for JavaScript errors

## Test Architecture

The E2E tests use:
- **Playwright** for browser automation
- **Request mocking** to stub backend API calls (no real backend needed)
- **Page Object Model** patterns for maintainability
- **Automatic screenshots** on failure for debugging

All API calls are mocked, so tests are fast and don't require a running backend server.

## Adding New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import Playwright test utilities
3. Use `page.route()` to mock API calls
4. Write test scenarios using `test()` blocks
5. Use `expect()` for assertions

Example:
```typescript
import { test, expect } from '@playwright/test';

test('new feature works', async ({ page }) => {
  // Mock API response
  await page.route('**/api/v1/some-endpoint', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ data: 'test' }),
    });
  });

  // Navigate and test
  await page.goto('/');
  await expect(page.getByText('Expected Text')).toBeVisible();
});
```

## Performance Expectations

- **Build time**: 1-2 minutes (first time)
- **Server startup**: 5-15 seconds
- **Test execution**: 30-60 seconds (3 test scenarios)
- **Total time**: 2-4 minutes (including build)

Subsequent runs without rebuilding: 45-75 seconds
