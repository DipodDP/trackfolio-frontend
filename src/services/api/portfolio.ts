import { MoneyValue, FullPortfolioAnalysisRequest, FullPortfolioAnalysisResponse } from '@/types/portfolio';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// Helper function to get auth token - can be easily mocked in tests
export function getAuthToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export async function getFullPortfolioAnalysis(
  apiClientId: number,
  request: FullPortfolioAnalysisRequest
): Promise<FullPortfolioAnalysisResponse> {
  const accessToken = getAuthToken();
  if (!accessToken) {
    throw new Error('Authentication token not found.');
  }

  const response = await fetch(
    `${API_BASE_URL}/api-clients/${apiClientId}/portfolio-analysis/full`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    throw new Error(`Portfolio analysis failed: ${response.statusText}`);
  }

  return response.json();
}
