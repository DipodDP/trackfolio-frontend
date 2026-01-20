export const MOCK_USER = {
  id: 1,
  username: "testuser",
  email: "testuser@example.com",
  full_name: "Test User",
  disabled: false,
};

export const MOCK_LOGIN_RESPONSE = {
  access_token: "fake-access-token",
  token_type: "bearer",
};

export const MOCK_PORTFOLIO_ANALYSIS = {
  consolidated_portfolio: {
    total_amount_portfolio: { currency: "RUB", units: 100000, nano: 0 },
    cash_balance: { currency: "RUB", units: 10000, nano: 0 },
    total_amount_currencies: { currency: "RUB", units: 10000, nano: 0 },
  },
  enriched_positions: [
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      instrument_type: "share",
      current_price: { currency: "USD", units: 150, nano: 0 },
      quantity: { units: 10, nano: 0 },
      total: { currency: "USD", units: 1500, nano: 0 },
      proportion_in_portfolio: "0.15",
      profit: "100",
      profit_fifo: "100",
    },
    {
      ticker: "GOOG",
      name: "Alphabet Inc.",
      instrument_type: "share",
      current_price: { currency: "USD", units: 100, nano: 0 },
      quantity: { units: 5, nano: 0 },
      total: { currency: "USD", units: 500, nano: 0 },
      proportion_in_portfolio: "0.05",
      profit: "50",
      profit_fifo: "50",
    },
  ],
  plan_positions: [],
  structure_analysis: {
    current_high_risk: { component_proportions: { shares: "0.15" } },
    current_low_risk: { component_proportions: { corp_bonds: "0", gov_bonds: "0" } },
    plan_high_risk: { component_proportions: { shares: "0.3" } },
    plan_low_risk: { component_proportions: { corp_bonds: "0.1", gov_bonds: "0.1" } },
  },
  total_additional_cash: { currency: "RUB", units: 0, nano: 0 },
  proportion_in_portfolio: {},
};
