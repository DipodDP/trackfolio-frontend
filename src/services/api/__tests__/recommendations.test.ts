import MockAdapter from 'axios-mock-adapter';
import apiClient from '@/lib/api-client';
import { getProposal, applyProposal, getModelPortfolio, saveModelPortfolio } from '../recommendations';

describe('recommendations API', () => {
  let mock: MockAdapter;
  beforeEach(() => { mock = new MockAdapter(apiClient); });
  afterEach(() => mock.restore());

  it('loads the selected broker proposal and preserves decimal weights', async () => {
    const proposal = { items: [], not_in_model: [], proposed_total: '0.125', model_updated_at: null };
    mock.onGet('/api-clients/7/recommendations/proposal').reply(200, proposal);
    expect(await getProposal(7)).toEqual(proposal);
  });
});

it('applies only explicit FIGIs, including an empty selection', async () => {
  const mock = new MockAdapter(apiClient);
  try {
    mock.onPost('/api-clients/7/recommendations/proposal/apply').reply(200, { applied: [] });
    await applyProposal(7, ['FIGI1'], 'reviewed');
    await applyProposal(7, [], 'reviewed');
    expect(mock.history.post.map(r => JSON.parse(r.data))).toEqual([{ figis: ['FIGI1'], revision: 'reviewed' }, { figis: [], revision: 'reviewed' }]);
  } finally { mock.restore(); }
});
it('stores and reads the checkpoint envelope without losing metadata', async () => {
  const mock = new MockAdapter(apiClient);
  const body = { portfolio: { structure_notes: 'Bonds', positions: [] }, last_message_id: 42 };
  const stored = { ...body, updated_at: '2026-11-17T16:27:26Z' };
  try {
    mock.onPut('/recommendations/model-portfolio').reply(200, stored);
    mock.onGet('/recommendations/model-portfolio').reply(200, stored);
    expect(await saveModelPortfolio(body)).toEqual(stored);
    expect(await getModelPortfolio()).toEqual(stored);
    expect(JSON.parse(mock.history.put[0].data)).toEqual(body);
  } finally { mock.restore(); }
});
