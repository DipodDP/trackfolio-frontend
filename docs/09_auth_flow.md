# 09. Authentication Flow

### Purpose
To define the complete authentication lifecycle, from user login to logout. This document specifies the technical implementation for session management, token handling, and route protection, ensuring a secure and seamless user experience.

### What is covered in this document?
-   The user login, token refresh, and logout processes.
-   The confirmed strategy for handling session tokens (`access_token` and `refresh_token`).
-   The implementation of route protection using Next.js middleware.
-   How user session data is managed on the client.

### Why this step exists
Authentication is a critical, security-sensitive part of any application. A clearly defined flow is essential to protect user data and control access to different parts of the site. This document provides a single source of truth for how auth is implemented, reducing the risk of security flaws and ensuring a consistent user experience.

### Confirmed Authentication Flow

#### Token Handling: Two-Token Strategy

To balance security and user experience, the backend uses a two-token system:

1.  **Access Token (`access_token`)**:
    -   A short-lived JWT returned in the login response body.
    -   **Documented Storage**: Should be stored in memory (e.g., in a Zustand store) and NOT persisted.
    -   **Actual Implementation (2026-01-11)**: Currently stored in `sessionStorage` via `setAccessToken()` in `src/lib/api-client.ts`
        - ⚠️ **Security Note**: Using `sessionStorage` is less secure than memory-only storage but provides better UX (survives page refreshes)
    -   **Usage**: Sent in the `Authorization: Bearer <token>` header for all authenticated API requests.

2.  **Refresh Token (`refresh_token`)**:
    -   A long-lived token used to get a new `access_token` when the old one expires.
    -   **Storage**: Sent from the backend as a secure, `HttpOnly` cookie. This is the most secure method, as it's inaccessible to client-side JavaScript.
    -   **Usage**: The browser automatically sends this cookie on requests to the token refresh endpoint.

---

### Step-by-Step Flow

#### 1. User Login

1.  **UI**: The user enters their credentials into the form on the `/login` page.
2.  **API Call**: The form's `onSubmit` handler calls a mutation that sends a `POST` request to `/api/v1/login`.
    -   **`Content-Type`**: `application/x-www-form-urlencoded`
    -   **Body**: `username=<email>&password=<password>`
3.  **Backend Response**:
    -   **On Success (200 OK)**:
        -   The response body contains the `access_token` and `token_type`.
        -   The response headers set the `refresh_token` as an `HttpOnly` cookie.
    -   **On Failure (401 Unauthorized)**: The backend returns an error, which the frontend displays to the user.
4.  **Client-Side Actions**:
    -   The `access_token` is stored in `sessionStorage`.
    -   The user is redirected to the `/dashboard`.
    -   **Note**: Fetching the user profile (`GET /users/me`) is not yet implemented.

#### 2. Authenticated API Calls

1.  **Request Trigger**: The frontend needs to fetch data from a protected endpoint (e.g., `POST /api/v1/api-clients/{id}/portfolio-analysis/full`).
2.  **Request Interception**: A request interceptor (in our API client) retrieves the `access_token` from `sessionStorage` and adds it to the `Authorization` header.
3.  **Backend Verification**: The backend validates the `access_token`. If valid, it processes the request.

#### 3. Access Token Refresh

1.  **Token Expiration**: The frontend makes an API call with an expired `access_token`, and the backend responds with a `401 Unauthorized` error.
2.  **Refresh Trigger**: An API response interceptor catches the `401` status.
3.  **API Call**: The interceptor sends a `POST` request to `/api/v1/refresh`. The browser automatically includes the `refresh_token` cookie.
4.  **Backend Response**:
    -   **On Success**: The backend returns a new `access_token`.
    -   **On Failure**: The refresh token is invalid or expired. The backend returns a `401`, signaling that the user must log in again.
5.  **Client-Side Actions**:
    -   The new `access_token` is stored in `sessionStorage`.
    -   The original failed request is automatically retried with the new token.
    -   If refresh fails, all session data is cleared, and the user is redirected to `/login`.

#### 4. Route Protection (Client-Side Guard)

**Current Implementation (Updated 2026-01-11):**

1.  **Trigger**: A user attempts to access a protected route (e.g., `/dashboard`).
2.  **Component Execution**: The `AuthGuard` component wraps protected pages (client-side).
3.  **Session Check**: The component checks for the presence of the `access_token` in `sessionStorage`.
    -   **If token exists**: The protected content renders.
    -   **If token does NOT exist**: The user is redirected to `/login` using Next.js router.

**Note:** The documented server-side middleware approach (`src/middleware.ts`) is NOT currently implemented. Route protection is handled entirely client-side via the `AuthGuard` component. This means:
- Protected routes can briefly flash before redirecting
- There's no server-side session validation
- The `refresh_token` cookie check is not implemented in middleware

#### 5. User Logout

1.  **UI**: The user clicks the "Logout" button.
2.  **API Call**: The frontend sends a `POST` request to `/api/v1/logout`. The `Authorization` header and `refresh_token` cookie are included.
3.  **Backend Action**: The backend invalidates both the access and refresh tokens (e.g., via a blacklist) and sends instructions to clear the `HttpOnly` cookie.
4.  **Client-Side Cleanup**: The frontend clears all session-related state from `sessionStorage`.
5.  **Redirect**: The user is redirected to `/login`.

### Current Implementation Summary (Updated 2026-01-11)

**✅ What IS Implemented:**
- Login page with form-urlencoded submission (`/login`)
- Access token storage in `sessionStorage`
- Axios request interceptor adding Bearer token to all requests
- Axios response interceptor for automatic token refresh on 401 errors
- Client-side route protection via `AuthGuard` component
- Token management functions (`getAccessToken`, `setAccessToken`, `clearTokens`)
- Automatic redirect to `/login` on auth failures

**⚠️ Implementation Differences from Documentation:**
- **Token Storage**: Uses `sessionStorage` instead of Zustand/memory-only (less secure but better UX)
- **Route Protection**: Uses client-side `AuthGuard` component instead of Next.js middleware
- **No User Profile Fetch**: Login doesn't fetch `/users/me` data after successful authentication
- **No State Management**: Not using Zustand yet; relying on `sessionStorage` directly

**❌ What is intentionally NOT done yet:**
- Server-side middleware route protection (`src/middleware.ts`)
- "Remember Me" functionality (though the long-lived refresh token provides similar behavior)
- Password reset flows
- Role-based access control (RBAC)
- User profile/session state management with Zustand
- Logout functionality is not implemented.

### Verification & Open Questions
-   **Verified**: This flow is now aligned with the backend documentation in `trackfolio/docs/technical/api-integration.md` and `KNOWLEDGE_BASE.md`. The use of `HttpOnly` cookies for refresh tokens is a security best practice.
-   **To Be Confirmed**:
    -   The exact lifetime/expiration for the `access_token` and `refresh_token`. This is needed to fine-tune the client-side logic.
    -   The exact structure of the error response when a token is invalid versus when it is expired, to ensure the refresh logic triggers correctly.
    -   Whether to migrate from `sessionStorage` to Zustand for better security
    -   Whether to implement server-side middleware for route protection