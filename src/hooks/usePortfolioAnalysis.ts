import { useQuery } from '@tanstack/react-query';
import { getFullPortfolioAnalysis } from '@/services/api/portfolio';
import { numberToMoneyValue } from '@/lib/utils/money';

export function usePortfolioAnalysis(
  apiClientId: number | null | undefined,
  accountIds: string[],
  externalCash?: number
) {
  // Convert externalCash (number) to MoneyValue format
  const externalCashValue = externalCash && externalCash > 0
    ? numberToMoneyValue(externalCash)
    : undefined;

  return useQuery({
    queryKey: ['portfolio-analysis', apiClientId, accountIds, externalCash],
    queryFn: () => {
      if (!apiClientId) throw new Error('API client ID required');
      return getFullPortfolioAnalysis(apiClientId, {
        account_ids: accountIds,
        external_cash: externalCashValue
      });
    },
    enabled: !!apiClientId && accountIds.length > 0,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000 // Auto-refresh every minute
  });
}