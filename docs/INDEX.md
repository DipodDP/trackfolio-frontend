# Trackfolio Frontend - Documentation Index

## Purpose

This documentation set provides a comprehensive guide for developing the Trackfolio frontend. It serves as a single source of truth for developers and AI code agents, ensuring consistency and adherence to architectural decisions.

**How to use**: Start with the onboarding path below. For specific tasks, navigate to the relevant guide. Always cross-reference with [CONTEXT.md](./CONTEXT.md) for actual implementation status.

---

## Onboarding Path

Read these in order to get up to speed:

1. **[00_introduction.md](./00_introduction.md)** — Project context and high-level goals
2. **[01_overview_and_goals.md](./01_overview_and_goals.md)** — Vision and objectives
3. **[02_project_setup.md](./02_project_setup.md)** — Local development environment setup
4. **[03_app_creation.md](./03_app_creation.md)** — Application scaffold (historical reference)
5. **[CONTEXT.md](./CONTEXT.md)** — **Current implementation status** (read this to understand what's built vs. planned)

---

## Architecture & Core Concepts

Read these before implementing new features.

- **Routing & Pages** — [04_page_routing.md](./04_page_routing.md)
  Route hierarchy and page-to-endpoint mapping. *Status: Fully implemented.*

- **Design System** — [05_design_system_integration.md](./05_design_system_integration.md)
  Cosmic Frontier theme, Tailwind config, fonts, global styles. *Status: Fully implemented in `tailwind.config.ts`.*

- **State Management** — [08_ui_state_and_data_flow.md](./08_ui_state_and_data_flow.md)
  Three-tier state strategy: React Query (server), Zustand (global client), React hooks (local).
  *Status: Implemented — Zustand stores in `src/store/`, React Query hook in `src/hooks/usePortfolioAnalysis.ts`.*

---

## Backend Integration

- **API Contracts (Source of Truth)** — [06_backend_interface_contracts.md](./06_backend_interface_contracts.md)
  All endpoint definitions, request payloads, and response schemas.

- **Integration Strategy** — [07_new_backend_integration.md](./07_new_backend_integration.md)
  API client setup, data transformation approach.
  *Status: Implemented — Axios client in `src/lib/api-client.ts`, services in `src/services/api/`.*

- **Authentication** — [09_auth_flow.md](./09_auth_flow.md)
  Two-token strategy, login/logout, route protection.
  *Status: Login + token refresh implemented. Zustand auth store active. Server-side middleware not yet created.*

---

## Development & Quality

- **Testing Strategy** — [10_testing_and_validation.md](./10_testing_and_validation.md)
  Unit (Jest + RTL), integration, and E2E (Playwright) approach.
  *Status: Jest and Playwright configured. 10 test files written. E2E scenarios pending.*

- **Implementation Status** — [CONTEXT.md](./CONTEXT.md)
  Live snapshot of development progress. Updated March 2026.

---

## Key Implementation Files

| Concern | File(s) |
|---------|---------|
| API Client | `src/lib/api-client.ts` |
| Auth Store | `src/store/authStore.ts` |
| App Store | `src/store/appStore.ts` |
| Portfolio Hook | `src/hooks/usePortfolioAnalysis.ts` |
| Portfolio Service | `src/services/api/portfolio.ts` |
| Type Definitions | `src/types/api.ts`, `portfolio.ts`, `position.ts`, `trading.ts` |
| Utility Functions | `src/lib/utils/money.ts`, `position.ts`, `src/utils/formatters.ts` |
| Route Protection | `src/components/AuthGuard.tsx` |

---

## Open Questions & Known Gaps

- **Server-side middleware** — `src/middleware.ts` not yet created; routes protected client-side only
- **Logout** — Flow defined in `09_auth_flow.md` but not yet implemented
- **Register** — UI exists but not connected to backend API
- **Analysis page** — Placeholder; needs full implementation
- **Operations page** — Placeholder; needs transaction history display
- **E2E tests** — Infrastructure configured but no test scenarios written
