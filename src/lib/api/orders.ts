/**
 * Order execution API functions
 */

import apiClient from "@/lib/api-client";
import type { PlaceOrderParams, OrderResponse, OrderRequest } from "@/types/trading";

/**
 * Place a market order for buying or selling an instrument
 *
 * @param params - Order parameters including API client ID, account ID, FIGI, lots, and direction
 * @returns Order execution response with order ID, status, and execution details
 * @throws Error with user-friendly message if order execution fails
 */
export async function placeMarketOrder(params: PlaceOrderParams): Promise<OrderResponse> {
  const { apiClientId, accountId, figi, lots, direction } = params;

  // Validate parameters
  if (!apiClientId) {
    throw new Error("API client is required");
  }

  if (!accountId) {
    throw new Error("Account ID is required");
  }

  if (!figi) {
    throw new Error("Invalid FIGI format");
  }

  if (lots <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  if (!Number.isInteger(lots)) {
    throw new Error("Quantity must be a whole number");
  }

  // Prepare request payload
  const requestPayload: OrderRequest = {
    figi,
    lots,
    direction,
    account_id: accountId,
  };

  try {
    // Make API call
    const response = await apiClient.post<OrderResponse>(
      `/api-clients/${apiClientId}/orders/market`,
      requestPayload
    );

    return response.data;
  } catch (error: any) {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          throw new Error(JSON.stringify(data.detail) || "Invalid order request");
        case 404:
          throw new Error("API client not found");
        case 504:
          throw new Error("Order request timed out. Please try again.");
        case 502:
          throw new Error(JSON.stringify(data.detail) || "Failed to execute order");
        default:
          throw new Error(JSON.stringify(data.detail) || `Order failed with status ${status}`);
      }
    }

    // Network or unknown error
    throw new Error(error.message || "Failed to execute order. Please check your connection.");
  }
}
