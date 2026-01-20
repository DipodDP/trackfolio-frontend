### PORTFOLIO_API_MIGRATION_PLAN.md

#### 1. Executive Summary

The goal is to ensure the new backend API can fully support the portfolio UI, which was previously powered by a legacy frontend. After analyzing the legacy application's data and the new backend's capabilities, this report concludes that the existing `/api/v1/api-clients/{api_client_id}/portfolio-analysis/full` endpoint is comprehensive and well-structured. It provides all the necessary data, albeit in a different format than the legacy API. Instead of creating a new endpoint to replicate the old format, we will use the new endpoint and adapt the frontend to its more modern and convenient structure. This approach avoids creating a redundant "legacy" layer in the backend.

#### 2. Legacy Portfolio Table – Observed Behavior

The legacy frontend at `https://trackfolio.vercel.app/` fetches portfolio data from a `/api/portfolio` endpoint. The JSON response has the following key components:

* **Root Object**:
  * `total_amount_shares`, `total_amount_bonds`, `total_amount_etf`, `total_amount_currencies`, `total_amount_portfolio`: Objects in `MoneyValue` format (`{ currency: string, units: number, nano: number }`).
  * `total_additional_cash`: `MoneyValue` object.
  * `positions`: An array of objects representing current holdings.
  * `plan_positions`: An array of objects for the planned portfolio state.
  * `proportion_in_portfolio`: An object with asset class proportions.

* **`positions` Object Fields**: `figi`, `instrument_type`, `quantity`, `average_position_price`, `expected_yield`, `current_price`, `average_position_price_fifo`, `ticker`, `name`, `lot`, `total`, `proportion_in_portfolio`, `profit_fifo`.

* **`plan_positions` Object Fields**: `figi`, `plan_quantity`, `ticker`, `name`, `plan_total`, `plan_proportion_in_portfolio`, `to_buy_lots`, `target_profit`, `exit_drawdown`, `exit_profit_price`, `exit_loss_price`, `target_progress`.

The data contains both raw values (prices, quantities) and derived values (totals, profits, proportions).

#### 3. Required Data Contract

To fully render the portfolio table as seen in the legacy app, the frontend requires all the fields listed above. The `MoneyValue` format from the legacy system (with `units` and `nano`) is well-suited for handling monetary values. The new backend uses `Decimal` strings, which is also a good practice that the frontend can adapt to.

#### 4. Current Backend Assessment

The new backend exposes a powerful endpoint: `/api/v1/api-clients/{api_client_id}/portfolio-analysis/full`.

* **Endpoint**: `POST /api/v1/api-clients/{api_client_id}/portfolio-analysis/full`
* **Request**: Requires a list of `account_ids`.
* **Response**: Returns a `FullPortfolioAnalysisResponse` object which is highly structured and contains:
  * `consolidated_portfolio`: Contains total values and a list of basic positions. This maps to the root totals and some of the `positions` data.
  * `enriched_positions`: Contains detailed position information, including calculated fields like `market_value` and `profit_loss`. This is the richest source for the main portfolio table.
  * `structure_analysis`: Contains data for the portfolio structure table (risk parts, components).
  * `plan_positions`: Contains the rebalancing plan, similar to the legacy `plan_positions`.
  * `total_additional_cash`: Present at the root.

The data models are well-defined in `backend/src/app/schemas/portfolio_analysis.py`.

#### 5. Gap Analysis

The primary "gap" is not a lack of data, but a difference in structure. The new API is more organized and less flat than the legacy one.

| Feature/Field | Legacy API (`/api/portfolio`) | New API (`.../full`) | Gap & Action |
| :--- | :--- | :--- | :--- |
| **Data Structure** | Flat structure with `positions` and `plan_positions` arrays. | Nested structure with `consolidated_portfolio`, `enriched_positions`, `plan_positions`. | **CONFIRMED.** **Action:** No backend action needed. The frontend will adapt to consume the new, better-structured response. |
| **Position Data** | Single `positions` array. | `enriched_positions` array contains all necessary UI data. | **CONFIRMED.** `enriched_positions` provides all the fields required by the legacy `positions` array, often with clearer naming (e.g., `market_value`). |
| **Plan Data** | `plan_positions` array. | `plan_positions` array exists and is very similar. | **CONFIRMED.** The new `plan_positions` structure is almost identical and provides all necessary data. |
| **Monetary Values** | Uses `MoneyValue` format (`units`, `nano`). | Uses `Decimal` strings. | **CONFIRMED.** This is a good approach. The frontend can parse these strings to avoid floating-point inaccuracies. |
| **`proportion_in_portfolio`** | Present in each object in the `positions` array. | Not present in the `EnrichedPositionResponse`. | **GAP IDENTIFIED.** This field represents the asset's weight in the total portfolio. **Action:** Add `proportion_in_portfolio` to the `EnrichedPositionResponse` schema and implement the calculation in the backend service. |

#### 6. Proposed Backend Changes (Revised)

We will use the existing `/api/v1/api-clients/{api_client_id}/portfolio-analysis/full` endpoint and make one addition:

1. **Add `proportion_in_portfolio` to `EnrichedPositionResponse`:**
    * **File to Modify**: `backend/src/app/schemas/portfolio_analysis.py`.
    * **Change**: Add `proportion_in_portfolio: str` to the `EnrichedPositionResponse` schema.
    * **File to Modify**: `backend/src/app/services/t_investments/portfolio_analysis.py`.
    * **Change**: In the `analyze_full_portfolio` method, calculate the `proportion_in_portfolio` for each enriched position using its `market_value` and the `total_amount_portfolio`.
    * **File to Modify**: `backend/src/app/api/v1/portfolio_analysis.py`.
    * **Change**: Update the `_convert_to_response` function to map the new `proportion_in_portfolio` field.

This single change makes the existing endpoint fully capable of supporting the new frontend's portfolio view.

#### 7. Validation & Testing Plan

1. **Unit Tests**: Add a unit test for the backend service to verify that `proportion_in_portfolio` is correctly calculated.
2. **Integration Tests**: Update the integration test for the `/api-clients/{api_client_id}/portfolio-analysis/full` endpoint to check for the presence and correctness of the new field.
3. **Frontend Adaptation**: The frontend team will update the `Portfolio` component in `trackfolio-next` to fetch and display data from the `.../full` endpoint, adapting to its structure.

#### 8. Open Questions / Unknowns

* **CONFIRMATION NEEDED**: The calculation for `expected_yield` and `profit_fifo` from the legacy API needs to be cross-verified with the `profit_loss` field in the new `EnrichedPositionResponse` to ensure they represent the same value. This can be confirmed by inspecting the backend logic that calculates `profit_loss`.
