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
    -   **Storage**: Stored in memory (e.g., in a Zustand store). It should **not** be persisted in `localStorage`.
    -   **Usage**: Sent in the `Authorization: Bearer <token>` header for all authenticated API requests.

2.  **Refresh Token (`refresh_token`)**:
    -   A long-lived token used to get a new `access_token` when the old one expires.
    -   **Storage**: Sent from the backend as a secure, `HttpOnly` cookie. This is the most secure method, as it's inaccessible to client-side JavaScript.
    -   **Usage**: The browser automatically sends this cookie on requests to the token refresh endpoint.

---

### Step-by-Step Flow

#### 1. User Login

1.  **UI**: The user enters their credentials into the form on the `/sign-in` page.
2.  **API Call**: The form's `onSubmit` handler calls a mutation that sends a `POST` request to `/api/v1/login`.
    -   **`Content-Type`**: `application/x-www-form-urlencoded`
    -   **Body**: `username=<email>&password=<password>`
3.  **Backend Response**:
    -   **On Success (200 OK)**:
        -   The response body contains the `access_token` and `token_type`.
        -   The response headers set the `refresh_token` as an `HttpOnly` cookie.
    -   **On Failure (401 Unauthorized)**: The backend returns an error, which the frontend displays to the user.
4.  **Client-Side Actions**:
    -   The `access_token` is stored in the client-side state management (Zustand store).
    -   The frontend fetches the user's profile data via `GET /api/v1/users/me` and populates the user store.
    -   The user is redirected to the `/dashboard`.

#### 2. Authenticated API Calls

1.  **Request Trigger**: The frontend needs to fetch data from a protected endpoint (e.g., `POST /api/v1/api-clients/{id}/portfolio-analysis/full`).
2.  **Request Interception**: A request interceptor (in our API client) retrieves the `access_token` from the Zustand store and adds it to the `Authorization` header.
3.  **Backend Verification**: The backend validates the `access_token`. If valid, it processes the request.

#### 3. Access Token Refresh

1.  **Token Expiration**: The frontend makes an API call with an expired `access_token`, and the backend responds with a `401 Unauthorized` error.
2.  **Refresh Trigger**: An API response interceptor catches the `401` status.
3.  **API Call**: The interceptor sends a `POST` request to `/api/v1/refresh`. The browser automatically includes the `refresh_token` cookie.
4.  **Backend Response**:
    -   **On Success**: The backend returns a new `access_token`.
    -   **On Failure**: The refresh token is invalid or expired. The backend returns a `401`, signaling that the user must log in again.
5.  **Client-Side Actions**:
    -   The new `access_token` is stored in the Zustand store.
    -   The original failed request is automatically retried with the new token.
    -   If refresh fails, all session data is cleared, and the user is redirected to `/sign-in`.

#### 4. Route Protection (Middleware)

1.  **Trigger**: A user attempts to access a protected route (e.g., `/dashboard`).
2.  **Middleware Execution**: The `src/middleware.ts` file runs on the server.
3.  **Session Check**: The middleware checks for the presence of the `refresh_token` cookie on the incoming request (as the `access_token` is not available server-side).
    -   **If cookie exists**: The request is allowed to proceed.
    -   **If cookie does NOT exist**: The user is redirected to `/sign-in`.

#### 5. User Logout

1.  **UI**: The user clicks the "Logout" button.
2.  **API Call**: The frontend sends a `POST` request to `/api/v1/logout`. The `Authorization` header and `refresh_token` cookie are included.
3.  **Backend Action**: The backend invalidates both the access and refresh tokens (e.g., via a blacklist) and sends instructions to clear the `HttpOnly` cookie.
4.  **Client-Side Cleanup**: The frontend clears all session-related state from the Zustand store.
5.  **Redirect**: The user is redirected to `/sign-in`.

### What is intentionally NOT done yet?
-   "Remember Me" functionality (though the long-lived refresh token provides similar behavior).
-   Password reset flows.
-   Role-based access control (RBAC).

### Verification & Open Questions
-   **Verified**: This flow is now aligned with the backend documentation in `trackfolio/docs/technical/api-integration.md` and `KNOWLEDGE_BASE.md`. The use of `HttpOnly` cookies for refresh tokens is a security best practice.
-   **To Be Confirmed**:
    -   The exact lifetime/expiration for the `access_token` and `refresh_token`. This is needed to fine-tune the client-side logic.
    -   The exact structure of the error response when a token is invalid versus when it is expired, to ensure the refresh logic triggers correctly.