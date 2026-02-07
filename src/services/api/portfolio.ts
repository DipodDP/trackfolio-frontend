import { FullPortfolioAnalysisRequest, FullPortfolioAnalysisResponse } from '@/types/portfolio';
import apiClient from '@/lib/api-client';

export async function getFullPortfolioAnalysis(
  apiClientId: number,
  request: FullPortfolioAnalysisRequest
): Promise<FullPortfolioAnalysisResponse> {
  const response = await apiClient.post<FullPortfolioAnalysisResponse>(
    `/api-clients/${apiClientId}/portfolio-analysis/full`,
    request
  );

  return response.data;
}
