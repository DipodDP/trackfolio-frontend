# 08. UI State and Data Flow

### Purpose
To define a clear and consistent strategy for managing state within the application. This document outlines which tools and patterns to use for different types of state, ensuring a predictable data flow and a maintainable codebase.

### What is covered in this document?
-   The different categories of state in the application.
-   The recommended libraries and techniques for managing each category.
-   A high-level overview of the data flow, from the backend to the UI components.

### Why this step exists
State management is one of the most complex aspects of a frontend application. A poorly defined strategy leads to bugs, performance issues, and code that is difficult to reason about. By establishing clear patterns from the start, we can build a scalable and robust application where data flows in a predictable and easily debuggable way.

### Categories of State

We will categorize state into three types:

1.  **Server Cache (Remote State)**: Data that originates from the backend. This is the most common type of state in our application (e.g., dashboard data, user positions). This data is fetched, cached, and synchronized with the server.
2.  **Global UI State**: State that is shared across multiple, non-related components. This state is created and managed on the client. Examples include the current authenticated user's information or the visibility of a mobile navigation menu.
3.  **Local UI State**: State that is confined to a single component or a small group of related components. Examples include form input values or whether a dropdown is open.

---

### Proposed State Management Strategy

#### 1. Server Cache: React Query (`@tanstack/react-query`)

For fetching, caching, and mutating data from the backend, we will use **React Query**. While the Next.js App Router handles initial data fetching in Server Components, React Query is invaluable for client-side scenarios:
-   Re-fetching data automatically on window focus or network reconnection.
-   Mutating data (e.g., adding an asset) and then automatically re-fetching related queries.
-   Handling complex caching logic, loading states, and error states with minimal code.

**Implementation:**
-   Install the library: `pnpm add @tanstack/react-query`.
-   Wrap the application in a `QueryClientProvider`.
-   Use the `useQuery` hook for data fetching and `useMutation` for data updates in Client Components.

#### 2. Global UI State: Zustand

For simple, global client-side state, we will use **Zustand**. It provides a minimal, hook-based API that is easy to use and avoids the boilerplate of more complex solutions like Redux.

**Implementation:**
-   Install the library: `pnpm add zustand`.
-   Create a "store" to hold a slice of global state (e.g., a `sessionStore` for user data).
-   Use the store's hook in any component to access or update the state.

**Example `sessionStore`:**
```typescript
// src/stores/session.ts
import { create } from 'zustand';

interface SessionState {
  user: {
    name: string;
    email: string;
  } | null;
  setUser: (user: SessionState['user']) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

#### 3. Local UI State: React Hooks

For state that is not shared, we will use React's built-in hooks.
-   **`useState`**: The default choice for simple state (strings, booleans, numbers).
-   **`useReducer`**: For more complex state logic within a component, where one event can lead to multiple state transitions.

---

### High-Level Data Flow

1.  **Initial Page Load (Server)**:
    -   A user requests a page (e.g., `/dashboard`).
    -   The Next.js Server Component for that page fetches data directly using our API service (`getDashboardData`).
    -   The server renders the HTML with the data and sends it to the client.

2.  **Client-Side Interaction (Browser)**:
    -   The user clicks a "Refresh" button in a Client Component.
    -   The component calls a function that uses React Query's `queryClient.invalidateQueries()`.
    -   React Query automatically re-fetches the dashboard data from the backend.
    -   While fetching, React Query provides a `isLoading` status, allowing the UI to show a loading spinner.
    -   Once the data arrives, the component re-renders with the new information.

### What should work at the end?
-   A clear set of rules for where to put different types of state.
-   Developers know which tool to reach for (`useState`, `Zustand`, `React Query`) based on the task at hand.
-   The foundation for a scalable and maintainable state management architecture is in place.

### What is intentionally NOT done yet?
-   No actual stores or queries have been implemented.
-   Providers (like `QueryClientProvider`) have not been added to the root layout yet.

### Verification & Open Questions
-   **Verified**: The chosen libraries (`React Query`, `Zustand`) are industry standards and work well with Next.js. This three-tiered approach to state is a proven pattern.
-   **Assumed**: The application will have enough client-side interactivity to justify the inclusion of `React Query` and `Zustand`. (This is a safe assumption for this type of application).
-   **To Be Confirmed**: Are there any other categories of global state anticipated beyond user session information?
