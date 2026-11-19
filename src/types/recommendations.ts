export interface ModelPosition {
  name: string;
  ticker: string | null;
  isin: string | null;
  asset_class: 'share' | 'corp_bond' | 'gov_bond' | 'etf' | 'currency' | 'other';
  status: 'open' | 'closed';
  target_weight_percent: number | null;
  target_price: number | null;
  comment: string;
  updated_message_id: number;
}

export interface ModelPortfolioWrite {
  portfolio: { structure_notes: string; positions: ModelPosition[] };
  last_message_id?: number | null;
}

export interface ModelPortfolioRead extends ModelPortfolioWrite {
  updated_at: string;
}

export interface ProposalItem {
  name: string;
  ticker: string | null;
  isin: string | null;
  asset_class: string;
  figi: string | null;
  lot: number | null;
  action: 'add' | 'increase' | 'decrease' | 'close' | 'keep' | 'no_weight' | 'unresolved';
  current_plan_proportion: string | null;
  proposed_plan_proportion: string | null;
  target_price: number | null;
  comment: string;
  warnings: ('qualified_investors_only' | 'market_orders_unavailable')[];
}

export interface Proposal {
  items: ProposalItem[];
  not_in_model: {
    figi: string;
    ticker: string | null;
    name: string | null;
    current_plan_proportion: string;
  }[];
  proposed_total: string;
  model_updated_at: string | null;
}
