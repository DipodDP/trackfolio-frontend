# Trackfolio Frontend - Implementation Guide Index

## 1. Introduction

**Purpose**: This documentation set provides a comprehensive guide for developing the Trackfolio frontend. It is designed to be a single source of truth for human developers and AI code agents, ensuring consistency and adherence to architectural decisions.

**How to Use This Guide**: Start with the "Onboarding Path" section. For specific tasks, navigate to the relevant architectural or implementation guide. Always prefer the definitions in these documents over inferring logic from the codebase.

---

## 2. Onboarding Path for New Developers & Agents

To get started with the project, follow these documents in order:

1.  **[01_overview_and_goals.md](./01_overview_and_goals.md)**: Understand the project's high-level vision and objectives.
2.  **[02_project_setup.md](./02_project_setup.md)**: Set up your local development environment.
3.  **[03_app_creation.md](./03_app_creation.md)**: Create the initial application scaffold.
4.  **[05_design_system_integration.md](./05_design_system_integration.md)**: Configure the project's styling and visual theme.

---

## 3. Architecture & Core Concepts

This section describes the foundational architecture of the frontend application. **Read these documents before implementing new features.**

*   **Routing and Page Structure**: For information on the application's page hierarchy and how pages map to backend endpoints, see **[04_page_routing.md](./04_page_routing.md)**.

*   **State Management and Data Flow**: To understand how data is managed, refer to **[08_ui_state_and_data_flow.md](./08_ui_state_and_data_flow.md)**. It defines our three categories of state and the tools for each:
    *   **Server State**: React Query (`@tanstack/react-query`)
    *   **Global UI State**: Zustand
    *   **Local UI State**: React Hooks (`useState`, `useReducer`)

---

## 4. Backend Integration (Critical)

This section contains the most critical information for ensuring the frontend communicates correctly with the backend.

*   **API Contracts (Source of Truth)**: For all API endpoint definitions, request payloads, and response schemas, refer to **[06_backend_interface_contracts.md](./06_backend_interface_contracts.md)**. This is the definitive source of truth for all data structures.

*   **Authentication Lifecycle**: The complete user authentication flow is detailed in **[09_auth_flow.md](./09_auth_flow.md)**. It covers the two-token strategy (`access_token` and `refresh_token`), login/logout procedures, and route protection. **Read this before implementing any user-facing protected features.**

*   **API Client Implementation**: For a step-by-step guide on setting up the API client, mocking data, and handling `snake_case` to `camelCase` transformation, see **[07_new_backend_integration.md](./07_new_backend_integration.md)**.

---

## 5. Development & Quality Assurance

*   **Testing Strategy**: The high-level approach to unit, integration, and end-to-end testing is defined in **[10_testing_and_validation.md](./10_testing_and_validation.md)**.

*   **Current Implementation Status**: For a real-time snapshot of development progress and what has actually been built versus what was planned, see **[CONTEXT.md](./CONTEXT.md)**. This document tracks phase completion, implementation differences, and priority recommendations. It is validated using Playwright MCP exploration.

---

## 6. Open Questions & Known Gaps

The following areas require further definition and are documented as gaps. Do not invent solutions for these; seek clarification first.

*   **API Error Handling**: The exact schema for structured API error responses is not yet defined. See `06_backend_interface_contracts.md`.
*   **API Pagination**: The contract for paginated data is not yet defined. See `06_backend_interface_contracts.md`.
*   **Active API Client**: The logic for managing the user's active broker connection (`apiClientId`) is not specified. See "Documentation Issues & Gaps" in `index.md` (this file).
