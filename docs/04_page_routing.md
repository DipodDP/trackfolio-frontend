# 04. Page Routing

### Purpose
To define the application's navigational structure and map it to both the file-based routing system of Next.js and the backend API endpoints that will provide the data for each page.

### What is covered in this document?
-   The application's UI routes.
-   The corresponding file structure within `src/app`.
-   The primary backend endpoints associated with each route.
-   A strategy for handling public vs. protected routes.

### Why this step exists
A well-defined routing plan is the skeleton of the application. Mapping UI routes to specific backend endpoints upfront clarifies data dependencies, ensures a logical user experience, and provides a clear development roadmap.

### Proposed Routing Structure

| Route              | Page Purpose                      | Primary Backend Endpoint(s)                                    | Type      |
| ------------------ | --------------------------------- | -------------------------------------------------------------- | --------- |
| `/`                | Redirects to `/dashboard`.        | N/A                                                            | Protected |
| `/login`           | User login page.                  | `POST /api/v1/login`                                           | Public    |
| `/register`        | User registration page.           | `POST /api/v1/users` (Assumed)                                 | Public    |
| `/dashboard`       | Main portfolio analysis view.     | `POST /api/v1/api-clients/{id}/portfolio-analysis/full`        | Protected |
| `/assets`          | View and manage user assets.      | Likely a detailed view derived from the main portfolio analysis endpoint. | Protected |
| `/reports`         | View/generate financial reports.  | `GET /api/v1/api-clients/{id}/operations` (for history)         | Protected |
| `/settings`        | Manage connections and strategy.  | `GET /api/v1/api-clients`, `GET /api/v1/portfolio-structures`, `GET /api/v1/position-attributes` | Protected |


### Implementation Plan

1.  **Public Routes**:
    -   The `/login` and `/register` pages will be directly accessible.

2.  **Protected Routes**:
    -   A route group `(protected)` will be created at `src/app/(protected)/`.
    -   A `layout.tsx` file inside this group will contain the shared UI for all protected pages (e.g., main navigation, header).
    -   A `middleware.ts` file at the root (`src/middleware.ts`) will be responsible for checking for the `refresh_token` cookie to protect routes. If the cookie is missing, it will redirect to `/login`.

    **Proposed Protected Route Structure:**
    ```
    src/
    └── app/
        ├── (protected)/
        │   ├── dashboard/
        │   │   └── page.tsx
        │   ├── assets/
        │   │   └── page.tsx
        │   ├── reports/
        │   │   └── page.tsx
        │   └── settings/
        │       └── page.tsx
        │   └── layout.tsx     // Shared layout for protected pages
        ├── login/
        │   └── page.tsx
        └── register/
            └── page.tsx
    ```

### What should work at the end?
-   A clear plan for the application's file structure is defined.
-   Each page has a designated data source from the backend API.
-   A clear strategy for separating public and protected content is in place.

### What is intentionally NOT done yet?
-   No page files or components have been created.
-   The detailed implementation of authentication logic in the middleware is not specified here.

### Verification & Open Questions
-   **Verified**: The proposed routes align with the design prototypes and standard application patterns. The backend endpoints are now aligned with the backend documentation.
-   **Assumed**:
    -   A `/register` flow is required.
    -   The `/assets` page will reuse data from the main portfolio analysis call, possibly with more detailed views.
-   **To Be Confirmed**: The exact list of routes for the initial release needs final confirmation. The proposed structure is a comprehensive starting point.