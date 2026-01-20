// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
}



// API Client Types
export interface ApiClient {
  id: number;
  user_id: string;
  broker_type: string;
  is_sandbox: boolean;
  created_at: string;
  token?: string;
}

export interface BrokerAccount {
  id: string;
  name: string;
  broker_type: string;
  is_active: boolean;
}

export interface BrokerAccountsResponse {
  accounts: BrokerAccount[];
  total_count: number;
  api_client_id: number;
  broker_type: string;
  is_sandbox: boolean;
}

// Portfolio Types
export interface PortfolioAnalysisRequest {
  account_ids: string[];
  additional_cash: number;
}

export interface ProportionInPortfolio {
  shares_proportion: number;
  bonds_proportion: number;
  etf_proportion: number;
  currencies_proportion: number;
}

export interface ConsolidatedPortfolio {
  total_amount_shares: number;
  total_amount_bonds: number;
  total_amount_etf: number;
  total_amount_currencies: number;
  total_amount_portfolio: number;
  total_additional_cash: number;
  proportion_in_portfolio: ProportionInPortfolio;
}

export interface EnrichedPosition {
  figi: string;
  instrument_type: "share" | "bond" | "etf" | "currency";
  quantity: number;
  current_price: number;
  ticker: string;
  name: string;
  lot: number;
  corrected_average_position_price: number;
  total: number;
  proportion: number;
  proportion_in_portfolio: number;
  profit: number;
  profit_fifo: number;
}

export interface StructurePart {
  low_risk_total_amount?: number;
  low_risk_total_proportion?: number;
  gov_bonds_amount?: number;
  gov_bonds_proportion?: number;
  corp_bonds_amount?: number;
  corp_bonds_proportion?: number;
  high_risk_total_amount?: number;
  high_risk_total_proportion?: number;
  shares_amount?: number;
  shares_proportion?: number;
  etf_amount?: number;
  etf_proportion?: number;
}

export interface PortfolioStructureAnalysis {
  total_amount: number;
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

export interface PlanPosition {
  figi: string;
  ticker: string;
  name: string;
  plan_quantity: number;
  plan_total: number;
  plan_proportion_in_portfolio: number;
  to_buy_lots: number;
  target_profit: number;
  exit_drawdown: number;
  exit_profit_price: number;
  exit_loss_price: number;
  target_progress: number | null;
}

export interface PortfolioAnalysisResponse {
  consolidated_portfolio: ConsolidatedPortfolio;
  enriched_positions: EnrichedPosition[];
  structure_analysis: PortfolioStructureAnalysis;
  plan_positions: PlanPosition[];
}

// Trading Types
export interface MarketOrderRequest {
  account_id: string;
  figi: string;
  direction: "BUY" | "SELL";
  lots: number;
}

export interface MarketOrderResponse {
  order_id: string;
  status: string;
  executed_quantity: number;
  total_order_amount: number;
  executed_order_price: number;
  message: string;
}

// Instrument Types
export interface Instrument {
  figi: string;
  ticker: string;
  name: string;
  instrument_type: string;
  currency: string;
  lot: number;
}

// Position Attributes Types
export interface PositionAttributes {
  figi: string;
  user_id: string;
  target_profit: number;
  exit_drawdown: number;
  created_at: string;
  updated_at: string;
}

// Portfolio Structure (Risk Profile) Types
export interface PortfolioStructure {
  id: number;
  user_id: string;
  risk_profile: number;
  max_risk_part_drawdown: number;
  risk_proportion: number;
  corp_bonds_proportion: number;
  shares_proportion: number;
  created_at: string;
  updated_at: string;
}

// Error Response Type
export interface ApiError {
  detail: string;
  code?: string;
}