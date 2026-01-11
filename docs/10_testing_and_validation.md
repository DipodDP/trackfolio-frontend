# 10. Testing and Validation

### Purpose

To define a comprehensive testing strategy that ensures the application is reliable, maintainable, and free of regressions. This document outlines the different types of tests we will write, the tools we will use, and the overall approach to quality assurance.

### What is covered in this document?

- The testing pyramid and our approach to different levels of testing.
- The recommended tools and libraries for each type of test.
- Guidelines on what and how to test.

### Why this step exists

A robust testing strategy is not a "nice-to-have"; it is a critical investment in the long-term health of the project. A good test suite allows developers to:

- Refactor code with confidence, knowing that regressions will be caught.
- Verify that features work as expected.
- Provide clear documentation for how components and functions are intended to be used.
- Catch bugs before they reach production.

---

### The Testing Pyramid

We will adopt the "testing pyramid" model, which prioritizes different types of tests.

1. **Unit Tests (Base of the pyramid)**:
    - **What**: Test the smallest possible units of code in isolation (e.g., a single utility function or a single React component with mocked props).
    - **Goal**: Verify that the unit works correctly given specific inputs.
    - **Speed**: Very fast.

2. **Integration Tests (Middle of the pyramid)**:
    - **What**: Test how multiple units work together. This could be a parent component rendering several children, a component interacting with a state management store, or a page that renders multiple components.
    - **Goal**: Verify that the integrated parts function correctly as a group.
    - **Speed**: Slower than unit tests.

3. **End-to-End (E2E) Tests (Top of the pyramid)**:
    - **What**: Test a complete user flow in a real browser, from start to finish. This is the highest level of testing.
    - **Example**: "A user can log in, navigate to the dashboard, and see their portfolio value."
    - **Goal**: Verify that the entire system works as expected from the user's perspective.
    - **Speed**: Slowest and most brittle, so used sparingly for critical paths.

---

### Tools and Implementation

#### Unit & Integration Tests: Jest + React Testing Library

- **Tools**:
  - [Jest](https://jestjs.io/): The test runner.
  - [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/): For rendering components and interacting with them in a user-centric way.
  - `@testing-library/jest-dom`: Provides custom matchers for Jest to simplify assertions on the DOM (e.g., `toBeInTheDocument()`).

- **Setup**: `create-next-app` comes with Jest support. We will configure it by creating a `jest.config.js` file and setting up the necessary test environment.

- **Guiding Principle**: "Test behavior, not implementation details." We will query for elements the way a user would (by text, label, role) and avoid testing component internals.

#### End-to-End Tests: Playwright

- **Tool**: [Playwright](https://playwright.dev/): A modern E2E testing framework that allows us to automate actions in real browsers (Chrome, Firefox, Safari).

- **Setup**: Playwright can be added to the project with `pnpm create playwright`. We will configure it to run against our local development server.

- **What to Test**: We will create E2E tests for the most critical user flows only:
    1. The login/logout flow.
    2. Verifying that the dashboard renders with mock data.
    3. A core interaction, like adding a new asset (once that feature is built).

### Testing Workflow

1. **Development**: When building a new feature, the developer should write corresponding unit and/or integration tests.
2. **Pull Request**: All tests must pass in the CI/CD pipeline before a pull request can be merged.
3. **Critical Flows**: E2E tests will be run on the main branch and before production deployments to ensure that critical paths are always functional.

### What should work at the end?

- A clear framework for writing and organizing tests is established.
- The project is configured with the necessary tools to run unit, integration, and E2E tests.
- The team has a shared understanding of the importance of testing and the standards to uphold.

### Current Implementation Status (Updated 2026-01-11)

**What IS implemented:**
- Playwright is installed and configured (`@playwright/test` v1.57.0 in devDependencies)
- The development server is functional and accessible at `http://localhost:3000`
- All major pages render correctly (landing, login, register)
- Authentication flow is working (redirects work correctly)

**What is intentionally NOT done yet:**
- No actual test files have been written yet (no `*.test.ts` or `*.spec.ts` files exist)
- The CI/CD pipeline integration for running these tests has not been configured
- Jest configuration has not been set up yet
- React Testing Library setup is pending

### Verification & Open Questions

- **Verified**: The combination of Jest, React Testing Library, and Playwright is a modern, powerful, and widely-adopted stack for testing Next.js applications.
- **Assumed**: The development team is willing to adopt a test-driven mindset and contribute to the test suite.
- **To Be Confirmed**: What is the target code coverage percentage? While 100% is not practical, we should agree on a reasonable target (e.g., 80%) for new code.
