/**
 * Trading types for order execution
 */

export type OrderDirection = "BUY" | "SELL";

export interface PlaceOrderParams {
  apiClientId: number;
  accountId: string;
  figi: string;
  lots: number;
  direction: OrderDirection;
  /** UUID identifying this order attempt; reuse it when retrying an order whose outcome is unknown */
  idempotencyKey: string;
}

export interface OrderResponse {
  order_id: string;
  status: string;
  executed_quantity: number;
  total_order_amount: string;
  executed_order_price: string;
  message: string;
}

export interface OrderRequest {
  figi: string;
  lots: number;
  direction: OrderDirection;
  account_id: string;
  idempotency_key: string;
}
