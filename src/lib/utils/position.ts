import { EnrichedPosition, PlanPosition } from "@/types/portfolio";
import { TablePosition } from "@/types/position";
import { quotationToNumber } from "@/utils/formatters";

/**
 * Filters out currency positions from the positions array
 */
export function filterNonCurrencyPositions(
  positions: EnrichedPosition[]
): EnrichedPosition[] {
  return positions.filter((pos) => pos.instrument_type !== "currency");
}

/**
 * Merges enriched position with plan position data
 */
export function mergePositionWithPlan(
  enrichedPos: EnrichedPosition,
  planPos: PlanPosition | undefined
): TablePosition {
  // Use backend-computed P&L values directly
  const totalProfitPercent = enrichedPos.total_profit_percent !== null
    ? parseFloat(enrichedPos.total_profit_percent)
    : parseFloat(enrichedPos.profit);

  return {
    // Core identification
    figi: enrichedPos.figi,
    ticker: enrichedPos.ticker,
    name: enrichedPos.name,
    instrument_type: enrichedPos.instrument_type,

    // Current position data
    quantity: quotationToNumber(enrichedPos.quantity),
    current_price: enrichedPos.current_price,
    total: enrichedPos.total,
    proportion: parseFloat(enrichedPos.proportion),
    proportion_in_portfolio: parseFloat(enrichedPos.proportion_in_portfolio),
    profit: enrichedPos.total_pnl,
    profit_percentage: totalProfitPercent,
    lot: enrichedPos.lot_size,

    // P&L Breakdown
    realized_pnl: enrichedPos.realized_pnl,
    unrealized_pnl: enrichedPos.unrealized_pnl,
    total_pnl: enrichedPos.total_pnl,
    total_profit_percent: enrichedPos.total_profit_percent !== null
      ? parseFloat(enrichedPos.total_profit_percent)
      : null,
    unrealized_profit_percent: parseFloat(enrichedPos.profit),
    profit_fifo: parseFloat(enrichedPos.profit_fifo),
    expected_yield: enrichedPos.expected_yield,
    total_nkd: enrichedPos.total_nkd,

    // Plan data (with defaults if plan doesn't exist)
    plan_quantity: planPos?.plan_quantity ? quotationToNumber(planPos.plan_quantity) : 0,
    plan_total: planPos?.plan_total ?? {
      currency: enrichedPos.current_price.currency,
      units: 0,
      nano: 0,
    },
    plan_proportion_in_portfolio: planPos?.plan_proportion_in_portfolio ? parseFloat(planPos.plan_proportion_in_portfolio) : 0,
    to_buy_lots: planPos?.to_buy_lots ? quotationToNumber(planPos.to_buy_lots) : 0,
    target_profit: planPos?.target_profit ? parseFloat(planPos.target_profit) : 1.65,
    exit_drawdown: planPos?.exit_drawdown ? parseFloat(planPos.exit_drawdown) : 0.5,
    exit_profit_price: planPos?.exit_profit_price ?? {
      currency: enrichedPos.current_price.currency,
      units: 0,
      nano: 0,
    },
    exit_loss_price: planPos?.exit_loss_price ?? {
      currency: enrichedPos.current_price.currency,
      units: 0,
      nano: 0,
    },
    target_progress: planPos?.target_progress !== null && planPos?.target_progress !== undefined ? parseFloat(planPos.target_progress) : null,
  };
}

/**
 * Transforms API response data into table format
 * Filters currencies and merges enriched positions with plan positions
 */
export function transformToTableFormat(
  enrichedPositions: EnrichedPosition[],
  planPositions: PlanPosition[]
): TablePosition[] {
  // Filter out currency positions
  const nonCurrencyPositions = filterNonCurrencyPositions(enrichedPositions);

  // Create a map of plan positions for quick lookup
  const planPositionsMap = new Map<string, PlanPosition>();
  planPositions.forEach((planPos) => {
    planPositionsMap.set(planPos.figi, planPos);
  });

  // Merge enriched positions with their plan data
  return nonCurrencyPositions.map((enrichedPos) => {
    const planPos = planPositionsMap.get(enrichedPos.figi);
    return mergePositionWithPlan(enrichedPos, planPos);
  });
}

/**
 * Determines profit status based on profit_fifo value
 */
export function getProfitStatus(
  profit_percentage: number
): "profit" | "loss" | "neutral" {
  if (profit_percentage > 0.01) return "profit"; // > 1%
  if (profit_percentage < -0.01) return "loss"; // < -1%
  return "neutral";
}

/**
 * Formats profit value for display with color coding
 */
export function formatProfitDisplay(profit_percentage: number): {
  text: string;
  color: string;
  icon: string;
} {
  const status = getProfitStatus(profit_percentage);
  const percentage = (profit_percentage * 100).toFixed(2);

  if (status === "profit") {
    return {
      text: `+${percentage}%`,
      color: "text-success",
      icon: "trending_up",
    };
  } else if (status === "loss") {
    return {
      text: `${percentage}%`,
      color: "text-error",
      icon: "trending_down",
    };
  } else {
    return {
      text: `${percentage}%`,
      color: "text-secondary-text",
      icon: "trending_flat",
    };
  }
}

/**
 * Calculates the disbalance between current and target proportion
 */
export function calculateDisbalance(
  currentProportion: number,
  targetProportion: number
): number {
  if (targetProportion === 0) return 0;
  return ((currentProportion - targetProportion) / targetProportion) * 100;
}

/**
 * Formats instrument type for display
 * Colors match Risk Allocation scheme:
 * - Shares: bg-primary (red)
 * - ETFs: bg-coral (orange)
 * - Bonds: bg-warning (yellow)
 */
export function formatInstrumentType(
  instrumentType: string
): { label: string; color: string } {
  switch (instrumentType) {
    case "share":
      return { label: "Share", color: "bg-primary" };
    case "bond":
      return { label: "Bond", color: "bg-warning" };
    case "etf":
      return { label: "ETF", color: "bg-coral" };
    case "currency":
      return { label: "Currency", color: "bg-secondary-text" };
    default:
      return { label: instrumentType, color: "bg-secondary-text" };
  }
}
