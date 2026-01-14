import { MoneyValue, EnrichedPosition, PlanPosition } from "./api";

/**
 * Table position type - combines enriched position data with plan position data
 * Used for displaying positions in the data table
 */
export interface TablePosition {
  // Core identification
  figi: string;
  ticker: string;
  name: string;
  instrument_type: "share" | "bond" | "etf" | "currency";

  // Current position data (from EnrichedPosition)
  quantity: number;
  current_price: MoneyValue;
  total: MoneyValue;
  proportion: number; // Proportion within instrument type
  proportion_in_portfolio: number; // Proportion in total portfolio
  profit: MoneyValue | null; // Absolute profit
  profit_fifo: number; // Profit percentage (FIFO method)
  lot: number;

  // Plan data (from PlanPosition)
  plan_quantity: number;
  plan_total: MoneyValue;
  plan_proportion_in_portfolio: number;
  to_buy_lots: number; // Positive = buy, negative = sell
  target_profit: number;
  exit_drawdown: number;
  exit_profit_price: MoneyValue;
  exit_loss_price: MoneyValue;
  target_progress: number | null; // Progress towards target (percentage)
}

/**
 * Helper type for filtering options
 */
export const INSTRUMENT_TYPES = {
  SHARE: "share",
  BOND: "bond",
  ETF: "etf",
  CURRENCY: "currency",
} as const;

export type InstrumentType = (typeof INSTRUMENT_TYPES)[keyof typeof INSTRUMENT_TYPES];

/**
 * Helper type for sorting direction indicators
 */
export const PROFIT_STATUS = {
  PROFIT: "profit",
  LOSS: "loss",
  NEUTRAL: "neutral",
} as const;

export type ProfitStatus = (typeof PROFIT_STATUS)[keyof typeof PROFIT_STATUS];
