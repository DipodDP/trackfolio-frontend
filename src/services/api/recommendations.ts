import apiClient from '@/lib/api-client';
import type { Proposal, ProposalItem, ModelPortfolioWrite, ModelPortfolioRead } from '@/types/recommendations';

export async function getProposal(apiClientId: number): Promise<Proposal> {
  const { data } = await apiClient.get<Proposal>(`/api-clients/${apiClientId}/recommendations/proposal`);
  return data;
}

export async function applyProposal(apiClientId: number, figis: string[], revision: string): Promise<{ applied: ProposalItem[] }> {
  const { data } = await apiClient.post<{ applied: ProposalItem[] }>(
    `/api-clients/${apiClientId}/recommendations/proposal/apply`, { figis, revision }
  );
  return data;
}

export async function getModelPortfolio(): Promise<ModelPortfolioRead> {
  const { data } = await apiClient.get<ModelPortfolioRead>('/recommendations/model-portfolio');
  return data;
}

export async function saveModelPortfolio(body: ModelPortfolioWrite): Promise<ModelPortfolioRead> {
  const { data } = await apiClient.put<ModelPortfolioRead>('/recommendations/model-portfolio', body);
  return data;
}
