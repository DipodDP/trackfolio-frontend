import { getFullPortfolioAnalysis } from '../portfolio';
import { FullPortfolioAnalysisResponse } from '@/types/portfolio';
import apiClient from '@/lib/api-client';
import MockAdapter from 'axios-mock-adapter';

// Mock the authStore module
jest.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      accessToken: 'mock-auth-token',
      user: null,
      isAuthenticated: true,
      getAccessToken: () => 'mock-auth-token',
      setAccessToken: jest.fn(),
      logout: jest.fn(),
    })),
  },
}));

const mockFullPortfolioAnalysisResponse: FullPortfolioAnalysisResponse = {
  consolidated_portfolio: {
    total_amount_portfolio: { currency: 'RUB', units: 1000, nano: 0 },
    total_amount_shares: { currency: 'RUB', units: 500, nano: 0 },
    total_amount_bonds: { currency: 'RUB', units: 300, nano: 0 },
    total_amount_etf: { currency: 'RUB', units: 100, nano: 0 },
    total_amount_currencies: { currency: 'RUB', units: 100, nano: 0 },
    currency_breakdown: {
      total_value: { currency: 'RUB', units: 100, nano: 0 },
      holdings: []
    },
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
  total_external_cash: { currency: 'RUB', units: 0, nano: 0 },
  proportion_in_portfolio: { bonds: '0', shares: '0', etf: '0', currencies: '0' }
};

describe('getFullPortfolioAnalysis', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should call correct endpoint with POST method', async () => {
    mock.onPost('/api-clients/123/portfolio-analysis/full').reply(200, mockFullPortfolioAnalysisResponse);

    await getFullPortfolioAnalysis(123, { account_ids: ['2000000000'] });

    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe('/api-clients/123/portfolio-analysis/full');
    expect(mock.history.post[0].headers?.['Authorization']).toBe('Bearer mock-auth-token');
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ account_ids: ['2000000000'] });
  });

  it('should throw error if response is not ok', async () => {
    mock.onPost('/api-clients/123/portfolio-analysis/full').reply(404, { message: 'Not Found' });

    await expect(
      getFullPortfolioAnalysis(123, { account_ids: [] })
    ).rejects.toThrow('Request failed with status code 404');
  });

  it('should include authorization header', async () => {
    mock.onPost('/api-clients/123/portfolio-analysis/full').reply(200, mockFullPortfolioAnalysisResponse);

    await getFullPortfolioAnalysis(123, { account_ids: ['2000000000'] });

    expect(mock.history.post[0].headers?.['Authorization']).toBe('Bearer mock-auth-token');
  });
});
