'use client';

import { useState } from 'react';
import { ModelPortfolioImport } from './ModelPortfolioImport';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getModelPortfolio, getProposal, applyProposal } from '@/services/api/recommendations';
import { getApiErrorMessage } from '@/lib/api-error';
import type { Proposal, ProposalItem } from '@/types/recommendations';

const actions: Record<ProposalItem['action'], string> = {
  add: 'Add', increase: 'Increase', decrease: 'Decrease', close: 'Close',
  keep: 'Keep', no_weight: 'No target weight', unresolved: 'Instrument not found',
};
const warnings = {
  qualified_investors_only: 'Qualified investors only',
  market_orders_unavailable: 'Market orders unavailable',
};
const percent = (value: string | null) => value === null ? '—' : `${(Number(value) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
const canApply = (item: ProposalItem) => !!item.figi && item.proposed_plan_proportion !== null && ['add', 'increase', 'decrease', 'close'].includes(item.action);

// Remount local selection when the user or broker changes.
export function RecommendationsPanel(props: { apiClientId: number | null; userId: string }) {
  return <RecommendationsWorkspace key={`${props.userId}:${props.apiClientId}`} {...props} />;
}

function RecommendationsWorkspace({ apiClientId, userId }: { apiClientId: number | null; userId: string }) {
  const queryClient = useQueryClient();
  const modelKey = ['model-portfolio', userId];
  const proposalKey = ['recommendations-proposal', userId, apiClientId];
  const [selection, setSelection] = useState<{ proposal: Proposal; figis: string[] } | null>(null);
  const [message, setMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const model = useQuery({ queryKey: modelKey, queryFn: getModelPortfolio, retry: false, refetchOnWindowFocus: false });
  const proposal = useQuery({ queryKey: proposalKey, queryFn: () => getProposal(apiClientId!), enabled: !!apiClientId && !!model.data && !model.isError, retry: false, refetchOnWindowFocus: false });
  const selected = selection && selection.proposal === proposal.data ? selection.figis : [];
  const apply = useMutation({
    mutationFn: (figis: string[]) => applyProposal(apiClientId!, figis),
    retry: false,
    onSuccess: async (result) => {
      setSelection(null);
      setMessage(`Applied ${result.applied.length} target change${result.applied.length === 1 ? '' : 's'}. No orders were placed.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: proposalKey }),
        queryClient.invalidateQueries({ queryKey: ['portfolio-analysis'] }),
      ]);
    },
  });
  const busy = apply.isPending || proposal.isFetching || importing;
  const missingModel = (model.error as { response?: { status?: number } } | null)?.response?.status === 404;

  return <div className="space-y-6">
    <section className="card space-y-4" aria-labelledby="model-title">
      <h2 id="model-title" className="text-2xl font-display text-primary-text">Model portfolio</h2>
      {model.isPending && <p role="status">Loading model portfolio…</p>}
      {missingModel && <p>No model portfolio yet. Import a model portfolio checkpoint to get started.</p>}
      {model.isError && !missingModel && <div role="alert"><p>{getApiErrorMessage(model.error, 'Could not load the model portfolio.')}</p><button className="btn-secondary mt-2" onClick={() => model.refetch()}>Retry model portfolio</button></div>}
      {model.data && <>
        <p className="text-secondary-text">Updated {new Date(model.data.updated_at).toLocaleString()} · {model.data.portfolio.positions.length} positions</p>
        <p className="whitespace-pre-wrap">{model.data.portfolio.structure_notes}</p>
        <details><summary className="cursor-pointer text-primary">View model positions</summary>
          <ul className="mt-3 divide-y divide-border">{model.data.portfolio.positions.map((position, index) => <li key={index} className="py-3">
            <strong>{position.name}</strong> <span className="text-secondary-text">{position.ticker || position.isin} · {position.status} · {position.target_weight_percent === null ? 'No weight stated' : `${position.target_weight_percent}%`}</span>
            <p>{position.comment}</p>
            {position.target_price !== null && <p className="text-sm text-secondary-text">Channel target price: {position.target_price}</p>}
          </li>)}</ul>
        </details>
      </>}
      <ModelPortfolioImport disabled={apply.isPending || model.isPending || model.isFetching} replacing={!!model.data} onBusyChange={setImporting} onSaved={async stored => {
        setSelection(null); apply.reset();
        await queryClient.cancelQueries({ queryKey: ['recommendations-proposal', userId] });
        queryClient.setQueryData(modelKey, stored);
        await queryClient.invalidateQueries({ queryKey: ['recommendations-proposal', userId] });
        setMessage('Model portfolio imported. Review the proposed targets below.');
      }} />
    </section>

    <section className="card space-y-4" aria-labelledby="proposal-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 id="proposal-title" className="text-2xl font-display text-primary-text">Review target changes</h2><p className="text-secondary-text">Choose the allocations to apply. This updates targets without placing orders.</p></div>
        {apiClientId && model.data && <button className="btn-secondary disabled:opacity-50" disabled={busy} onClick={() => { setSelection(null); setMessage(''); apply.reset(); void proposal.refetch(); }}>Refresh proposal</button>}
      </div>
      {!apiClientId && <p>Select a broker connection in <Link href="/settings/api-clients" className="text-primary underline">API client settings</Link> to review target changes.</p>}
      {proposal.isFetching && <p role="status">Loading proposal…</p>}
      {proposal.isError && <p role="alert" className="text-error">{getApiErrorMessage(proposal.error, 'Could not load the proposal. Refresh to try again.')}</p>}
      {proposal.data && !proposal.isError && <>
        <p className="text-secondary-text">Proposed model allocation: <strong className="text-primary-text">{percent(proposal.data.proposed_total)}</strong></p>
        {Number(proposal.data.proposed_total) > 1 && <p className="text-warning">Model weights exceed 100%. Portfolio analysis normalizes targets when their total exceeds 100%.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <caption className="sr-only">Current and proposed portfolio targets</caption>
            <thead className="border-b border-border text-secondary-text"><tr>{['Select', 'Instrument', 'Change', 'Current', 'Proposed', 'Context'].map(label => <th key={label} scope="col" className="px-3 py-3">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">{proposal.data.items.map((item, index) => <tr key={item.figi || `unresolved-${index}`}>
              <td className="px-3 py-4">{canApply(item) && <input type="checkbox" aria-label={`Select ${item.name}`} disabled={busy || apply.isError} checked={selected.includes(item.figi!)} onChange={e => {
                apply.reset(); setMessage('');
                setSelection({ proposal: proposal.data!, figis: e.target.checked ? [...selected, item.figi!] : selected.filter(figi => figi !== item.figi) });
              }} className="h-4 w-4 accent-coral" />}</td>
              <td className="px-3 py-4"><strong>{item.name}</strong><p className="text-secondary-text">{item.ticker || item.isin || 'No identifier'}</p></td>
              <td className="px-3 py-4">{actions[item.action]}</td>
              <td className="px-3 py-4 tabular-nums whitespace-nowrap">{percent(item.current_plan_proportion)}</td>
              <td className="px-3 py-4 tabular-nums whitespace-nowrap font-semibold">{percent(item.proposed_plan_proportion)}</td>
              <td className="px-3 py-4 min-w-48"><p>{item.comment}</p>{item.target_price !== null && <p className="text-secondary-text">Channel target price: {item.target_price}</p>}{item.warnings.map(warning => <p key={warning} className="text-warning">{warnings[warning] || warning}</p>)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {proposal.data.items.length === 0 && <p>The model portfolio has no positions to compare.</p>}
        <p className="text-sm text-secondary-text">Channel target prices are reference values; they do not change profit targets. The latest model is checked again when you apply.</p>
        <button className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled={busy || apply.isError || selected.length === 0} onClick={() => { setMessage(''); apply.mutate(selected); }}>Apply selected targets ({selected.length})</button>
        {proposal.data.not_in_model.length > 0 && <div className="border-t border-border pt-4"><h3 className="font-semibold">Targets outside the model</h3><p className="text-secondary-text mb-2">These targets stay unchanged.</p><ul className="space-y-2">{proposal.data.not_in_model.map(target => <li key={target.figi} className="flex justify-between gap-4"><span>{target.name || target.ticker || target.figi}</span><span className="tabular-nums">{percent(target.current_plan_proportion)}</span></li>)}</ul></div>}
      </>}
      {apply.isError && <p role="alert" className="text-error">{getApiErrorMessage(apply.error, 'Could not apply targets.')} Refresh the proposal before trying again.</p>}
      {message && <p role="status" className="text-success">{message} <Link href="/positions" className="underline">Review assets</Link></p>}
    </section>
  </div>;
}
