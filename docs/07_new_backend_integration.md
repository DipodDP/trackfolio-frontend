# 07. New Backend Integration

### Purpose
To provide a clear, step-by-step strategy for connecting the frontend application to the new backend API. This document outlines how to handle data fetching, from initial mocking to live integration, while maintaining a clean and scalable architecture.

### What is covered in this document?
-   Setting up a dedicated, centralized API client with data transformation.
-   A strategy for using mock data to enable independent frontend development.
-   The process for fetching portfolio data using a `POST` request.
-   The final switch from mock data to the live backend API.

### Why this step exists
A systematic approach to backend integration is essential. By starting with a mock API, the frontend team can build and test the entire UI without waiting for the backend to be ready. This decouples development timelines and allows for a smoother final integration, as the data contract will have already been implemented and tested on the frontend.

### Implementation Plan

#### Step 1: Set Up the API Client

1.  **Create an API Service Directory**:
    All backend-related communication will be centralized in `src/services/`. We'll have `apiClient.ts` for the client setup and `portfolio.service.ts` for feature-specific functions.

2.  **Install Fetching and Transformation Libraries**:
    `axios` simplifies requests, and `camelcase-keys` helps transform the API's `snake_case` responses.
    ```bash
    pnpm add axios camelcase-keys
    ```

3.  **Configure Environment Variables**:
    Add the API base URL to `.env.local`.
    ```env
    # .env.local
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
    ```

4.  **Create the API Client with Interceptors**:
    Create `src/services/apiClient.ts` to handle requests and response transformations.
    ```typescript
    // src/services/apiClient.ts
    import axios from 'axios';
    import camelCaseKeys from 'camelcase-keys';

    const apiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    });

    // Add request interceptor for auth token here later.

    // Response interceptor to transform snake_case to camelCase
    apiClient.interceptors.response.use(
      (response) => {
        if (response.data) {
          response.data = camelCaseKeys(response.data, { deep: true });
        }
        return response;
      }
    );

    export default apiClient;
    ```

#### Step 2: Create the Portfolio Service and Mock Data

1.  **Create the Service Function**:
    In `src/services/portfolio.service.ts`, define the function to fetch portfolio data.

    ```typescript
    // src/services/portfolio.service.ts
    import apiClient from './apiClient';
    import { PortfolioAnalysisRequest, PortfolioAnalysisResponse } from '@/types/api.contracts'; // Assuming contracts are moved to a central types dir

    // --- Mocking Setup ---
    import mockPortfolioData from './mock-portfolio-analysis.json';
    const MOCK_API = true; // Set to false to hit the real API

    export const getPortfolioAnalysis = async (
      apiClientId: string,
      requestBody: PortfolioAnalysisRequest
    ): Promise<PortfolioAnalysisResponse> => {
      if (MOCK_API) {
        console.log("Using mock portfolio analysis data");
        // In a real mock, you might even transform this to camelCase
        return Promise.resolve(mockPortfolioData as PortfolioAnalysisResponse);
      }
      
      const response = await apiClient.post<PortfolioAnalysisResponse>(
        `/api-clients/${apiClientId}/portfolio-analysis/full`,
        requestBody // Axios handles JS object to JSON conversion
      );
      return response.data;
    };
    ```

2.  **Create Mock Data**:
    Create `src/services/mock-portfolio-analysis.json` with a structure matching the `PortfolioAnalysisResponse` interface from `06-backend-interface-contracts.md`.

    ```json
    // src/services/mock-portfolio-analysis.json
    {
      "consolidated_portfolio": {
        "total_amount_portfolio": { "currency": "rub", "units": 1245678, "nano": 900000000 },
        /* ... other snake_case fields ... */
      },
      "enriched_positions": [
        {
          "figi": "BBG004730N88",
          "ticker": "SBER",
          "name": "Сбер Банк",
          /* ... other snake_case fields ... */
        }
      ],
      "structure_analysis": { /* ... */ },
      "plan_positions": [ /* ... */ ]
    }
    ```

#### Step 3: Fetch Data in a Page Component

Use the new service in a page like `src/app/dashboard/page.tsx`.

```tsx
// src/app/dashboard/page.tsx
import { getPortfolioAnalysis } from '@/services/portfolio.service';
import { PortfolioAnalysisResponse } from '@/types/api.contracts';

// This is a React Server Component.
// It will need parameters for the API client and accounts.
// For now, we'll hardcode them for the example.
export default async function DashboardPage() {
  const apiClientId = "1"; // This would come from session/context
  const requestBody = {
    account_ids: ["ACCOUNT_123"], // This would come from user selection
    additional_cash: 0,
  };

  const data: PortfolioAnalysisResponse = await getPortfolioAnalysis(apiClientId, requestBody);

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Note: after transformation, we use camelCase */}
      <p>
        Total Value: 
        {data.consolidatedPortfolio.totalAmountPortfolio.units.toLocaleString()}
      </p>
      {/* Render the rest of the dashboard using the transformed data */}
    </div>
  );
}
```

#### Step 4: Switching to the Live API

When ready, the only change required is in `src/services/portfolio.service.ts`:
```typescript
// src/services/portfolio.service.ts
// ...
const MOCK_API = false; // Set to false to hit the real API
// ...
```
The request/response interceptors in the `apiClient` will handle auth and data transformation, so the rest of the app logic remains clean.

### What should work at the end?
-   A centralized API client handles `snake_case` to `camelCase` transformation.
-   The dashboard page fetches data from the mock file using a `POST` request pattern.
-   The application is ready for a seamless switch to the live backend.

### What is intentionally NOT done yet?
-   Implementation of the authentication token request interceptor.
-e-   Comprehensive error handling for API requests.
-   Client-side loading states (UI will load instantly from the mock).

### Verification & Open Questions
-   **Verified**: This pattern is now aligned with the backend's `POST` endpoint for portfolio analysis and correctly anticipates the `snake_case` data format.
-   **To Be Confirmed**: The method for retrieving the active `apiClientId` and the list of `account_ids` on the frontend. This will likely involve another API call and state management.