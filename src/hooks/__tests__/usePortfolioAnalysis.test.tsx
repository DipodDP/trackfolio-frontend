import { renderHook, act, waitFor } from '@testing-library/react'; // Add act
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePortfolioAnalysis } from '../usePortfolioAnalysis';
import { FullPortfolioAnalysisResponse } from '@/types/portfolio';
import * as PortfolioService from '@/services/api/portfolio'; // Use * as import

let queryClient: QueryClient; // Declare it but don't initialize globally

const mockFullPortfolioAnalysisResponse: FullPortfolioAnalysisResponse = {
  consolidated_portfolio: {
    total_amount_portfolio: { currency: 'RUB', units: 1000, nano: 0 },
    total_amount_shares: { currency: 'RUB', units: 500, nano: 0 },
    total_amount_bonds: { currency: 'RUB', units: 300, nano: 0 },
    total_amount_etf: { currency: 'RUB', units: 100, nano: 0 },
    total_amount_currencies: { currency: 'RUB', units: 100, nano: 0 },
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

describe('usePortfolioAnalysis', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ // Initialize in beforeEach
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity, // Disable garbage collection
          refetchInterval: false // Disable refetch interval
        }
      }
    });
    jest.clearAllMocks();
    jest.spyOn(PortfolioService, 'getFullPortfolioAnalysis').mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve(mockFullPortfolioAnalysisResponse), 50));
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should not fetch if apiClientId is undefined', () => {
    const { result } = renderHook(
      () => usePortfolioAnalysis(undefined, ['2000000000']),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(PortfolioService.getFullPortfolioAnalysis).not.toHaveBeenCalled();
  });

  it('should fetch data when apiClientId is provided', async () => {
    let result: any;
    act(() => {
      ({ result } = renderHook(
        () => usePortfolioAnalysis(123, ['2000000000']),
        { wrapper }
      ));
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(PortfolioService.getFullPortfolioAnalysis).toHaveBeenCalledWith(
      123,
      { account_ids: ['2000000000'] }
    );
  });

  it('should update query when account_ids change', async () => {
    let result: any;
    let rerender: any;
    act(() => {
      ({ result, rerender } = renderHook(
        ({ accountIds }) => usePortfolioAnalysis(123, accountIds),
        {
          wrapper,
          initialProps: { accountIds: ['2000000000'] }
        }
      ));
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(PortfolioService.getFullPortfolioAnalysis).toHaveBeenCalledTimes(1);

    // Clear mock calls to check for subsequent calls after rerender
    (PortfolioService.getFullPortfolioAnalysis as jest.Mock).mockClear();

    act(() => {
      rerender({ accountIds: ['2000000001'] });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(PortfolioService.getFullPortfolioAnalysis).toHaveBeenCalledTimes(1); // One call for the rerender
    expect(PortfolioService.getFullPortfolioAnalysis).toHaveBeenCalledWith(
      123,
      { account_ids: ['2000000001'] }
    );
  });
});
