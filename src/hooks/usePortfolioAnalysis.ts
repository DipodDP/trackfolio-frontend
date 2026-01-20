import { useQuery } from '@tanstack/react-query';
import { getFullPortfolioAnalysis } from '@/services/api/portfolio';

export function usePortfolioAnalysis(
  apiClientId: number | null | undefined,
  accountIds: string[]
) {
  return useQuery({
    queryKey: ['portfolio-analysis', apiClientId, accountIds],
    queryFn: () => {
      if (!apiClientId) throw new Error('API client ID required');
      return getFullPortfolioAnalysis(apiClientId, { account_ids: accountIds });
    },
    enabled: !!apiClientId && accountIds.length > 0,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000 // Auto-refresh every minute
  });
}