'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { saveModelPortfolio } from '@/services/api/recommendations';
import { getApiErrorMessage } from '@/lib/api-error';
import type { ModelPortfolioRead } from '@/types/recommendations';

const checkpointSchema = z.object({
  portfolio: z.object({
    structure_notes: z.string(),
    positions: z.array(z.object({
      name: z.string().min(1), ticker: z.string().nullable(), isin: z.string().nullable(),
      asset_class: z.enum(['share', 'corp_bond', 'gov_bond', 'etf', 'currency', 'other']),
      status: z.enum(['open', 'closed']), target_weight_percent: z.number().min(0).max(100).nullable(),
      target_price: z.number().nullable(), comment: z.string(), updated_message_id: z.number().int(),
    })),
  }),
  last_message_id: z.number().int().nullable().optional(),
});

export function ModelPortfolioImport({ disabled, replacing, onSaved, onBusyChange }: {
  disabled: boolean; replacing: boolean; onSaved: (model: ModelPortfolioRead) => Promise<void>; onBusyChange: (busy: boolean) => void;
}) {
  const [json, setJson] = useState('');
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const save = useMutation({ mutationFn: saveModelPortfolio, retry: false, onSuccess: onSaved });
  const busy = disabled || save.isPending || reading;

  return <details className="border-t border-border pt-4" open={!replacing}>
    <summary className="cursor-pointer text-primary">{replacing ? 'Replace model portfolio' : 'Import model portfolio'}</summary>
    <form className="mt-4 space-y-3" onSubmit={async e => {
      e.preventDefault();
      setError('');
      let input: unknown;
      try { input = JSON.parse(json); } catch { setError('Invalid JSON. Choose or paste a model portfolio checkpoint.'); return; }
      const result = checkpointSchema.safeParse(input);
      if (!result.success) {
        const issue = result.error.issues[0];
        setError(`Invalid checkpoint at ${issue.path.join('.') || 'root'}: ${issue.message}`);
        return;
      }
      onBusyChange(true);
      try { await save.mutateAsync(result.data); }
      catch (error) { setError(getApiErrorMessage(error, 'Could not import the model portfolio. Try again.')); }
      finally { onBusyChange(false); }
    }}>
      <p className="text-sm text-secondary-text">Choose the JSON checkpoint produced from your channel export, or paste it below. Raw Telegram exports must be processed first. Importing replaces the stored model; position targets change only when you apply a proposal.</p>
      <label className="block text-sm" htmlFor="model-file">Checkpoint file</label>
      <input id="model-file" type="file" accept=".json,application/json" disabled={busy} className="block w-full text-sm" onChange={async e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(''); setReading(true); onBusyChange(true);
        try { setJson(await file.text()); }
        catch { setError('Could not read the file. Try again or paste the JSON below.'); }
        finally { setReading(false); onBusyChange(false); }
      }} />
      <label className="block text-sm" htmlFor="model-json">Model portfolio JSON</label>
      <textarea id="model-json" className="input w-full font-mono text-sm" rows={6} value={json} disabled={busy} onChange={e => setJson(e.target.value)} placeholder={'{"portfolio":{"structure_notes":"…","positions":[]},"last_message_id":42}'} />
      {error && <p role="alert" className="text-error">{error}</p>}
      <button className="btn-secondary disabled:opacity-50" type="submit" disabled={busy || !json.trim()}>{save.isPending ? 'Importing…' : replacing ? 'Replace model portfolio' : 'Import model portfolio'}</button>
    </form>
  </details>;
}
