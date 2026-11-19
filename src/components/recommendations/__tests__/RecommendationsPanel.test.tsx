import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '@/lib/api-client';
import { RecommendationsPanel } from '../RecommendationsPanel';
import type { Proposal } from '@/types/recommendations';

const model = { portfolio: { structure_notes: 'Diversified model', positions: [] }, last_message_id: 42, updated_at: '2026-11-17T16:27:26Z' };
const item = { name: 'Sberbank', ticker: 'SBER', isin: null, asset_class: 'share', figi: 'FIGI1', lot: 1, action: 'increase' as const, current_plan_proportion: '0.05', proposed_plan_proportion: '0.1', target_price: 400, comment: 'Hold', warnings: ['market_orders_unavailable' as const] };
const proposal: Proposal = { items: [item, { ...item, name: 'Unknown', figi: null, action: 'unresolved' }], not_in_model: [{ figi: 'OTHER', name: 'Existing target', ticker: 'OLD', current_plan_proportion: '0.2' }], proposed_total: '0.1', model_updated_at: model.updated_at };
let mock: MockAdapter;
let client: QueryClient;
beforeEach(() => {
  mock = new MockAdapter(apiClient);
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  mock.onGet('/recommendations/model-portfolio').reply(200, model);
  mock.onGet('/api-clients/7/recommendations/proposal').reply(200, proposal);
});
afterEach(() => { mock.restore(); client.clear(); });
const mount = (id: number | null = 7) => render(<QueryClientProvider client={client}><RecommendationsPanel apiClientId={id} userId="user1" /></QueryClientProvider>);

it('requires selection, shows warnings, applies only selected targets, and refreshes analysis', async () => {
  mock.onPost('/api-clients/7/recommendations/proposal/apply').reply(200, { applied: [item] });
  client.setQueryData(['portfolio-analysis', 7], { cached: true });
  mount();
  const checkbox = await screen.findByRole('checkbox', { name: 'Select Sberbank' });
  expect(screen.getByRole('button', { name: /Apply selected targets/ })).toBeDisabled();
  expect(screen.getAllByText('Market orders unavailable').length).toBeGreaterThan(0);
  expect(screen.getByText('Existing target')).toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: 'Select Unknown' })).not.toBeInTheDocument();
  fireEvent.click(checkbox);
  fireEvent.click(screen.getByRole('button', { name: /Apply selected targets/ }));
  await screen.findByText('Applied 1 target change. No orders were placed.');
  expect(JSON.parse(mock.history.post[0].data)).toEqual({ figis: ['FIGI1'] });
  expect(mock.history.post).toHaveLength(1);
  expect(client.getQueryState(['portfolio-analysis', 7])?.isInvalidated).toBe(true);
  await waitFor(() => expect(mock.history.get.filter(r => r.url?.endsWith('/proposal')).length).toBeGreaterThan(1));
});

it('imports a validated checkpoint and loads proposals after a missing model', async () => {
  mock.onGet('/recommendations/model-portfolio').reply(404, { message: 'Model portfolio not found' });
  mock.onPut('/recommendations/model-portfolio').reply(200, model);
  mount();
  await screen.findByText(/No model portfolio yet/);
  fireEvent.change(screen.getByLabelText('Model portfolio JSON'), { target: { value: JSON.stringify({ portfolio: model.portfolio, last_message_id: 42 }) } });
  fireEvent.click(screen.getByRole('button', { name: 'Import model portfolio' }));
  await screen.findByText('Model portfolio imported. Review the proposed targets below.');
  await screen.findByRole('checkbox', { name: 'Select Sberbank' });
  expect(JSON.parse(mock.history.put[0].data)).toEqual({ portfolio: model.portfolio, last_message_id: 42 });
  expect(mock.history.post).toHaveLength(0);
});

it('shows structured apply errors and requires a refresh before retrying', async () => {
  mock.onPost('/api-clients/7/recommendations/proposal/apply').reply(504, { code: 'TIMEOUT', message: 'Broker timed out', details: {}, trace_id: 'trace-42' });
  mount();
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Sberbank' }));
  fireEvent.click(screen.getByRole('button', { name: /Apply selected targets/ }));
  await screen.findByText(/Broker timed out.*trace-42/);
  expect(mock.history.post).toHaveLength(1);
  expect(screen.getByRole('button', { name: /Apply selected targets/ })).toBeDisabled();
});

it.each(['not json', '{"messages":[]}', JSON.stringify({ portfolio: { structure_notes: '', positions: [{ name: 'Invalid' }] } })])('rejects invalid checkpoint %s without sending it', async json => {
  mount();
  await screen.findByText('Diversified model');
  fireEvent.change(screen.getByLabelText('Model portfolio JSON'), { target: { value: json } });
  fireEvent.click(screen.getByRole('button', { name: 'Replace model portfolio' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/Invalid/);
  expect(mock.history.put).toHaveLength(0);
});

it('does not request a broker proposal without a selected connection', async () => {
  mount(null);
  await screen.findByText('Diversified model');
  expect(screen.getByRole('link', { name: 'API client settings' })).toHaveAttribute('href', '/settings/api-clients');
  expect(mock.history.get.filter(r => r.url?.includes('/api-clients/'))).toHaveLength(0);
});

it('clears the selection when the selected broker changes', async () => {
  mock.onGet('/api-clients/8/recommendations/proposal').reply(200, proposal);
  const view = mount();
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Select Sberbank' }));
  view.rerender(<QueryClientProvider client={client}><RecommendationsPanel apiClientId={8} userId="user1" /></QueryClientProvider>);
  expect(await screen.findByRole('checkbox', { name: 'Select Sberbank' })).not.toBeChecked();
  expect(screen.getByRole('button', { name: /Apply selected targets/ })).toBeDisabled();
});

it('shows proposal errors with a retry action', async () => {
  mock.onGet('/api-clients/7/recommendations/proposal').reply(502, { message: 'Broker unavailable', trace_id: 'trace-7' });
  mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('Broker unavailable (ref: trace-7)');
  expect(screen.getByRole('button', { name: 'Refresh proposal' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: /Apply selected targets/ })).not.toBeInTheDocument();
});
