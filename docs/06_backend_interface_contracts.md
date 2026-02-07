# 06. Backend Interface Contracts

### Purpose
To define the data contracts between the frontend and the new backend API. This document establishes a clear, confirmed schema for API endpoints, their request payloads, and their response structures based on the backend's `KNOWLEDGE_BASE.md`. It serves as the source of truth for frontend data integration.

### What is covered in this document?
-   Confirmed API endpoints for authentication and core application data.
-   TypeScript interfaces defining the shape of data for requests and responses.
-   A note on `snake_case` to `camelCase` data transformation.

### Why this step exists
A well-defined contract is the most critical element for successful frontend-backend integration. By documenting the correct data structures upfront, we can build UI components with confidence and minimize integration friction.

**NOTE ON CASING**: The backend API uses `snake_case` for all fields. The TypeScript interfaces below reflect this. A transformation layer in the frontend's API client will be responsible for converting these to `camelCase` for use within the application.

---

### Authentication API

#### 1. Login Endpoint

-   **Endpoint**: `POST /api/v1/login`
-   **Purpose**: Authenticates a user and returns a session token.
-   **Request `Content-Type`**: `application/x-www-form-urlencoded`

**Request Body (`LoginRequest`)**
```typescript
// This is not a JSON body. The data is sent as form data.
interface LoginRequest {
  username: string; // User's email
  password: string;
}
```

**Response Body (`LoginResponse`)**
```typescript
interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
}
```

#### 2. Refresh Token Endpoint

-   **Endpoint**: `POST /api/v1/refresh`
-   **Purpose**: Exchanges a valid refresh token for a new access token. Performs token rotation.
-   **Authentication**: Requires a valid `refresh_token` cookie (HttpOnly, set during login).

**Request**: No body. The refresh token is sent automatically via the `refresh_token` cookie.

**Response Body (`RefreshResponse`)**
```typescript
interface RefreshResponse {
  access_token: string;
  token_type: 'bearer';
}
```

**Response Headers**: A new `Set-Cookie: refresh_token` header is returned with the rotated refresh token. The old refresh token is blacklisted server-side.

**Behavior:**
- Verifies the user still exists and is not soft-deleted before issuing new tokens.
- Blacklists the old refresh token (token rotation) to prevent reuse.
- Issues a new refresh token via `Set-Cookie`.
- Returns 401 if the refresh token is missing, invalid, blacklisted, or the user no longer exists.

---

### Portfolio API

The primary endpoint for fetching all dashboard data is the Portfolio Analysis endpoint.

#### 1. Get Full Portfolio Analysis

-   **Endpoint**: `POST /api/v1/api-clients/{id}/portfolio-analysis/full`
-   **Purpose**: Fetches a complete, calculated analysis of a user's portfolio across specified accounts.
-   **Authentication**: Requires a valid `access_token`.

**Request Body (`PortfolioAnalysisRequest`)**
```typescript
interface PortfolioAnalysisRequest {
  account_ids: string[];
  additional_cash: number;
}
```

**Response Body (`PortfolioAnalysisResponse`)**
```typescript
// A simplified representation of the main parts of the response.
// See the sub-interfaces for more details.
interface PortfolioAnalysisResponse {
  consolidated_portfolio: ConsolidatedPortfolio;
  enriched_positions: EnrichedPosition[];
  structure_analysis: PortfolioStructureAnalysis;
  plan_positions: PlanPosition[];
}
```

---

### Core Data Structure Interfaces

#### Consolidated Portfolio & Positions

```typescript
interface MoneyValue {
  currency: string;
  units: number;
  nano: number;
}

interface ConsolidatedPortfolio {
  total_amount_shares: MoneyValue;
  total_amount_bonds: MoneyValue;
  total_amount_etf: MoneyValue;
  total_amount_currencies: MoneyValue;
  total_amount_portfolio: MoneyValue;
  total_additional_cash: MoneyValue;
  positions: any[]; // This would be a list of raw positions, but we use enriched_positions
  proportion_in_portfolio: ProportionInPortfolio;
}

interface ProportionInPortfolio {
  shares_proportion: number;
  bonds_proportion: number;
  etf_proportion: number;
  currencies_proportion: number;
}

interface EnrichedPosition {
  figi: string;
  instrument_type: 'share' | 'bond' | 'etf' | 'currency';
  quantity: number;
  current_price: MoneyValue;
  ticker: string;
  name: string;
  lot: number;
  corrected_average_position_price: MoneyValue;
  total: MoneyValue; // Current market value of the position
  proportion: number; // Proportion within its asset class
  proportion_in_portfolio: number; // Proportion of the total portfolio
  profit: number; // Profit based on broker's average
  profit_fifo: number; // Profit based on corrected (FIFO) average
}
```

#### Structure Analysis

```typescript
interface StructurePart {
  low_risk_total_amount?: MoneyValue;
  low_risk_total_proportion?: number;
  gov_bonds_amount?: MoneyValue;
  gov_bonds_proportion?: number;
  corp_bonds_amount?: MoneyValue;
  corp_bonds_proportion?: number;
  high_risk_total_amount?: MoneyValue;
  high_risk_total_proportion?: number;
  shares_amount?: MoneyValue;
  shares_proportion?: number;
  etf_amount?: MoneyValue;
  etf_proportion?: number;
}

interface PortfolioStructureAnalysis {
  total_amount: MoneyValue;
  risk_profile: number;
  max_risk_part_drawdown: number;
  risk_proportion: number;
  corp_bonds_proportion: number;
  shares_proportion: number;
  plan_structure: {
    low_risk_part: StructurePart;
    high_risk_part: StructurePart;
  };
  current_structure: {
    low_risk_part: StructurePart;
    high_risk_part: StructurePart;
  };
}
```

#### Plan Positions (Rebalancing Recommendations)

```typescript
interface PlanPosition {
  figi: string;
  ticker: string;
  name: string;
  plan_quantity: number;
  plan_total: MoneyValue;
  plan_proportion_in_portfolio: number;
  to_buy_lots: number; // Positive to buy, negative to sell
  target_profit: number;
  exit_drawdown: number;
  exit_profit_price: MoneyValue;
  exit_loss_price: MoneyValue;
  target_progress: number | null; // Value between -1.0 and +1.0
}
```

### Other Key Endpoints

#### API Clients
-   `GET /api/v1/api-clients`: Lists all user's broker connections.
-   `POST /api/v1/api-clients`: Adds a new broker connection.
-   `GET /api/v1/api-clients/{id}/accounts`: Lists broker accounts for a specific connection.

#### Portfolio & Position Settings
-   `GET, POST /api/v1/portfolio-structures`: Manage user's portfolio risk profile.
-   `GET, POST /api/v1/position-attributes`: Manage targets for individual positions.

### What is intentionally NOT done yet?
-   Detailed error response formats are not fully specified here, but the backend docs note a plan to move to a structured format: `{ code, message, details, trace_id }`.
-   Pagination contracts for list endpoints are not detailed but will be required.

### Verification & Open Questions
-   **Verified**: The endpoints and data schemas listed are now aligned with the backend documentation (`KNOWLEDGE_BASE.md` and `api-integration.md`).
-   **To Be Confirmed**:
    -   The exact structure of the pagination response (`{ items, total, page, ... }`).
    -   The final, detailed error response schema for different HTTP statuses (e.g., 400, 404, 500).