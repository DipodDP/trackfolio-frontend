# Model portfolio proposals

The `/analysis` page integrates the recommendations API merged into the backend at
[`7227c8ad`](https://gitlab.com/DipodDP/trackfolio-backend/-/commit/7227c8ad98e57b33b682574aa5ef89aeda230c9a).
The GitLab source was verified on 2026-11-18 (Asia/Bangkok).

## Workflow

1. Select a broker connection in Settings → API clients.
2. Open Analysis. Import a JSON checkpoint produced by the backend's
   `build_model_portfolio.py`, or review the model already stored for your user.
   The checkpoint contains `portfolio` (with `structure_notes` and `positions`)
   and optional `last_message_id`. Raw Telegram exports are not checkpoints.
3. Review the current and proposed target weights, channel comments, and instrument
   warnings. Weights are displayed as percentages; the API returns decimal strings.
4. Select changes and click **Apply selected targets**. This changes position
   targets only. Orders are never placed by this page.
5. Review Assets or Dashboard; cached portfolio analysis is invalidated after apply.

Importing replaces the stored model, but does not apply its targets. The importer
validates the checkpoint before sending it and preserves its last-message metadata.

Only `add`, `increase`, `decrease`, and `close` proposals with a resolved FIGI and
weight can be selected. `keep`, `no_weight`, and `unresolved` are informational.
Qualified-investor and market-order warnings do not prevent updating targets.
Targets outside the model stay unchanged. Channel target prices are informational
and do not update `target_profit`.

The backend rebuilds the proposal at apply time; the API has no version precondition
for locking the displayed weights. The page notes this behavior and sends an explicit
FIGI selection, never an implicit apply-all request. After an apply error, refresh
before selecting changes again. Mutation requests are not automatically retried.
Selections reset on user/broker changes, refresh, import, or successful apply.

## API calls

All paths are relative to `/api/v1` and use the existing authenticated API client.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/recommendations/model-portfolio` | Load the user's stored model |
| PUT | `/recommendations/model-portfolio` | Import/replace a validated checkpoint |
| GET | `/api-clients/{id}/recommendations/proposal` | Resolve instruments and compare targets |
| POST | `/api-clients/{id}/recommendations/proposal/apply` | Apply explicit `{ "figis": [...] }` selection |

## Verification

`npm test -- --runInBand` includes API contract tests and component integration tests
using mocked HTTP responses for import, warnings, selection, cache invalidation,
errors, missing connections, and broker switching. Browser review uses mocked API
responses so it does not modify a live portfolio.
