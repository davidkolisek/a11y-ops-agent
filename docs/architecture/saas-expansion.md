# SaaS expansion guide

This document describes **reserved structure** for future SaaS features.  
Nothing here is implemented yet (no API, auth, DB, or billing).

## Reserved applications

| Path | Future role | Status |
| --- | --- | --- |
| `apps/api/` | HTTP API, webhooks, auth middleware | Placeholder README only |
| `apps/worker/` | Consume queue jobs, run `engine.scan()` | Placeholder README only |
| `apps/web/` | SPA + future authenticated app areas | Active |

Add a `package.json` to `apps/api` or `apps/worker` only when implementation starts.

## Reserved web domains

Feature folders under `apps/web/src/domains/` group future UI by product area:

```text
apps/web/src/domains/
├── projects/
├── organizations/
├── teams/
├── history/
├── schedules/
├── billing/
└── notifications/
```

Each folder contains a short README. Add Vue routes/components there when the feature is real.

Suggested (future) route prefixes — not registered today:

| Prefix | Domain |
| --- | --- |
| `/app/orgs` | Organizations |
| `/app/projects` | Projects |
| `/app/history` | Scan history |
| `/app/schedules` | Scheduled scans |
| `/app/settings/billing` | Billing |
| `/app/settings/team` | Team members |

Keep the public marketing + anonymous scanner at `/` and `/scan`.

## Future packages (create when needed)

| Package | When to add |
| --- | --- |
| `@a11y-agent-ops/api-client` | Web + CLI need a typed HTTP SDK |
| `@a11y-agent-ops/auth` | Shared auth helpers across api/web |
| `@a11y-agent-ops/db` | Persistence layer exists |

Do **not** pre-create empty packages.

## Suggested domain model (conceptual)

```text
Organization
  ├── members (User ↔ role)
  ├── billingAccount
  └── projects[]
        ├── settings (URLs, WCAG, schedule)
        └── scanRuns[]
              ├── status / timestamps
              └── AccessibilityReport (payload or object storage ref)
```

Engine remains unaware of Organization / Billing.  
API attaches tenant context **around** a scan job.

## Queue sketch (future)

```text
API  →  enqueue({ projectId, url, requestedBy })
Worker  →  engine.scan(...)
Worker  →  store report + emit notification
```

Technology choice (BullMQ, SQS, Cloud Tasks, …) is deferred until traffic justifies it — see ADR 005.

## Environment variables (future)

Document names early; do not require them today:

| Variable | Surface |
| --- | --- |
| `VITE_API_URL` | Web → API |
| `DATABASE_URL` | API |
| `QUEUE_URL` | API / Worker |
| `AUTH_*` | API / Web |
| `STRIPE_*` or similar | API billing |

## Rollout order (recommended)

1. Persist scan history (API + DB) behind existing `ScanClient`.
2. Projects + Organizations (multi-tenant).
3. Auth / team members.
4. Scheduled scans + worker queue.
5. Billing + entitlements.
6. Public API keys + notifications.
