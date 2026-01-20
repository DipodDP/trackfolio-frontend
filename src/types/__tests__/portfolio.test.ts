import { FullPortfolioAnalysisResponse } from '../portfolio';

describe('Portfolio Types', () => {
  it('should validate FullPortfolioAnalysisResponse structure', () => {
    const mockResponse: FullPortfolioAnalysisResponse = {
      consolidated_portfolio: {
        total_amount_portfolio: { currency: 'RUB', units: 0, nano: 0 },
        total_amount_shares: { currency: 'RUB', units: 0, nano: 0 },
        total_amount_bonds: { currency: 'RUB', units: 0, nano: 0 },
        total_amount_etf: { currency: 'RUB', units: 0, nano: 0 },
        total_amount_currencies: { currency: 'RUB', units: 0, nano: 0 },
        cash_balance: { currency: 'RUB', units: 0, nano: 0 },
        positions: []
      },
      enriched_positions: [],
      plan_positions: [],
      structure_analysis: {
        total_amount_assets: '0',
        current_low_risk: {
            total_amount: '0',
            proportion_in_portfolio: '0',
            components: {},
            component_proportions: {}
        },
        current_high_risk: {
            total_amount: '0',
            proportion_in_portfolio: '0',
            components: {},
            component_proportions: {}
        },
        plan_low_risk: null,
        plan_high_risk: null
      },
      total_additional_cash: { currency: 'RUB', units: 0, nano: 0 },
      proportion_in_portfolio: { bonds: '0', shares: '0', etf: '0', currencies: '0' }
    };

    expect(mockResponse).toBeDefined();
    // TypeScript will error if structure is wrong
  });
});
