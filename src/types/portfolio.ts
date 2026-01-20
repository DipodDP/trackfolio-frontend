// Complete type definitions for new API

/**
 * ISO 4217 currency codes supported by the application.
 * Must match backend CurrencyCode enum.
 */
export type CurrencyCode =
  | "RUB" // Russian Ruble (primary)
  | "USD" // US Dollar
  | "EUR" // Euro
  | "GBP" // British Pound
  | "JPY" // Japanese Yen
  | "CNY" // Chinese Yuan
  | "CHF" // Swiss Franc
  | "AUD" // Australian Dollar
  | "CAD" // Canadian Dollar
  | "HKD" // Hong Kong Dollar
  | "TRY"; // Turkish Lira

/**
 * List of all valid currency codes for validation
 */
export const VALID_CURRENCIES: ReadonlyArray<CurrencyCode> = [
  "RUB",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "CHF",
  "AUD",
  "CAD",
  "HKD",
  "TRY",
] as const;

export interface MoneyValue {
  currency: CurrencyCode;
  units: number;
  nano: number;
}

export interface Quotation {
  units: number;
  nano: number;
}

export interface EnrichedPosition {
  figi: string;
  ticker: string;
  name: string;
  lot_size: number;
  quantity: Quotation;
  instrument_type: "share" | "bond" | "etf" | "currency";
  current_price: MoneyValue;
  average_price: MoneyValue;
  corrected_average_price: MoneyValue;
  average_price_fifo: MoneyValue | null;
  total: MoneyValue;
  expected_yield: MoneyValue | null;
  current_nkd: MoneyValue | null;
  proportion: string;
  proportion_in_portfolio: string;
  profit: string;
  profit_fifo: string;
}

export interface PlanPosition {
  figi: string;
  ticker: string;
  name: string;
  lot: number;
  instrument_type: string;
  plan_proportion_in_portfolio: string;
  target_profit: string;
  exit_drawdown: string;
  current_quantity: number;
  plan_quantity: Quotation;
  to_buy_lots: Quotation;
  current_price: MoneyValue;
  corrected_average_position_price: MoneyValue;
  plan_total: MoneyValue;
  exit_profit_price: MoneyValue;
  exit_loss_price: MoneyValue;
  target_progress: string;
}

export interface RiskPart {
  total_amount: string;
  proportion_in_portfolio: string;
  components: {
    gov_bonds?: string;
    corp_bonds?: string;
    shares?: string;
    etf?: string;
  };
  component_proportions: {
    gov_bonds?: string;
    corp_bonds?: string;
    shares?: string;
    etf?: string;
  };
}

export interface StructureAnalysis {
  total_amount_assets: string;
  current_low_risk: RiskPart;
  current_high_risk: RiskPart;
  plan_low_risk: RiskPart | null;
  plan_high_risk: RiskPart | null;
}

export interface ConsolidatedPortfolio {
  total_amount_portfolio: MoneyValue;
  total_amount_shares: MoneyValue;
  total_amount_bonds: MoneyValue;
  total_amount_etf: MoneyValue;
  total_amount_currencies: MoneyValue;
  cash_balance: MoneyValue;
  positions: any[]; // Basic positions (not used in UI)
}

export interface AssetClassProportions {
  bonds: string;
  shares: string;
  etf: string;
  currencies: string;
}

export interface FullPortfolioAnalysisRequest {
    account_ids: string[];
    additional_cash?: MoneyValue;
}

export interface FullPortfolioAnalysisResponse {
  consolidated_portfolio: ConsolidatedPortfolio;
  enriched_positions: EnrichedPosition[];
  plan_positions: PlanPosition[];
  structure_analysis: StructureAnalysis;
  total_additional_cash: MoneyValue;
  proportion_in_portfolio: AssetClassProportions;
}
