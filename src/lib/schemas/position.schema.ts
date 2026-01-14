import { z } from "zod";

/**
 * MoneyValue schema - represents monetary amounts with currency
 */
export const MoneyValueSchema = z.object({
  currency: z.string(),
  units: z.number(),
  nano: z.number(),
});

/**
 * TablePosition schema - validates position data for the table
 */
export const TablePositionSchema = z.object({
  // Core identification
  figi: z.string(),
  ticker: z.string(),
  name: z.string(),
  instrument_type: z.enum(["share", "bond", "etf", "currency"]),

  // Current position data
  quantity: z.number(),
  current_price: MoneyValueSchema,
  total: MoneyValueSchema,
  proportion: z.number(),
  proportion_in_portfolio: z.number(),
  profit: MoneyValueSchema.nullable(),
  profit_fifo: z.number(),
  lot: z.number(),

  // Plan data
  plan_quantity: z.number(),
  plan_total: MoneyValueSchema,
  plan_proportion_in_portfolio: z.number(),
  to_buy_lots: z.number(),
  target_profit: z.number(),
  exit_drawdown: z.number(),
  exit_profit_price: MoneyValueSchema,
  exit_loss_price: MoneyValueSchema,
  target_progress: z.number().nullable(),
});

/**
 * Position attributes update schema (for editing positions)
 */
export const PositionAttributesUpdateSchema = z.object({
  figi: z.string(),
  plan_proportion_in_portfolio: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Target proportion in portfolio (0-1)"),
  target_profit: z
    .number()
    .min(1)
    .max(10)
    .optional()
    .describe("Target profit multiplier (1.0-10.0)"),
  exit_drawdown: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("Exit drawdown threshold (0-1)"),
});

// Infer TypeScript types from schemas
export type MoneyValue = z.infer<typeof MoneyValueSchema>;
export type TablePosition = z.infer<typeof TablePositionSchema>;
export type PositionAttributesUpdate = z.infer<
  typeof PositionAttributesUpdateSchema
>;
