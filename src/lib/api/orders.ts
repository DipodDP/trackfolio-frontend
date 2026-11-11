/**
 * Order execution API functions
 */

import apiClient from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import type { PlaceOrderParams, OrderResponse, OrderRequest } from "@/types/trading";

/**
 * A failed order. `outcomeUnknown` is true when the request may still have reached the
 * broker (timeout, gateway or network failure): retry with the same idempotency key so
 * the order cannot be placed twice. When false the order was definitely not placed.
 */
export class OrderError extends Error {
  constructor(
    message: string,
    public readonly outcomeUnknown: boolean
  ) {
    super(message);
    this.name = "OrderError";
  }
}

/**
 * Place a market order for buying or selling an instrument
 *
 * @param params - Order parameters; `idempotencyKey` is a UUID that identifies this order attempt
 * @returns Order execution response with order ID, status, and execution details
 * @throws OrderError with a user-friendly message if order execution fails
 */
export async function placeMarketOrder(params: PlaceOrderParams): Promise<OrderResponse> {
  const { apiClientId, accountId, figi, lots, direction, idempotencyKey } = params;

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
    idempotency_key: idempotencyKey,
  };

  try {
    // Make API call
    const response = await apiClient.post<OrderResponse>(
      `/api-clients/${apiClientId}/orders/market`,
      requestPayload
    );

    return response.data;
  } catch (error: any) {
    const status: number | undefined = error.response?.status;
    if (status === undefined) {
      throw new OrderError("Failed to execute order. Please check your connection.", true);
    }
    const fallback =
      status === 504 ? "Order request timed out. Please try again." : `Order failed with status ${status}`;
    throw new OrderError(getApiErrorMessage(error, fallback), status >= 500);
  }
}
