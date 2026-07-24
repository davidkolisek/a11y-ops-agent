# Domains

We split the product into two domain groups so SaaS features do not tangle with the scan engine.

## 1. Scanning domain (exists today)

Owned primarily by `packages/engine` + `packages/shared` scan/report types.

| Concept | Meaning |
| --- | --- |
| Target URL | Site under audit |
| Crawl | Page discovery |
| Violations | axe-core findings |
| AccessibilityReport | Full audit output |
| Tasks / HTML report | Artifacts for humans |

**Invariant:** scanning is framework-agnostic and runnable without accounts, orgs, or billing.

## 2. SaaS domain (planned)

Owned later by `apps/api`, web `domains/*`, and optional packages — **not** by the engine.

| Domain | Responsibility |
| --- | --- |
| **Organizations** | Tenant boundary, plan, billing customer |
| **Team members** | Membership, roles inside an org |
| **Projects** | Named site/app under an org; default URLs & settings |
| **History** | Past scan runs & stored reports |
| **Scheduled scans** | Cron-like recurring jobs per project |
| **API keys** | Programmatic access to trigger/fetch scans |
| **Billing** | Plans, usage limits, invoices |
| **Notifications** | Email/Slack when a scan finishes or regresses |
| **Worker queue** | Async execution of long-running scans |

## Ownership guidelines

| Change type | Land in |
| --- | --- |
| Crawl / axe / AI / report generation | `packages/engine` |
| Shared result/config types | `packages/shared` |
| CLI flags & UX | `packages/cli` |
| Browser UI for scanning/reports | `apps/web` |
| Multi-tenant SaaS UI screens | `apps/web/src/domains/<name>` |
| Persistence, auth, billing webhooks | `apps/api` (future) |
| Background scan execution | `apps/worker` (future) |

## Do not

- Put organization/billing types inside `engine`.
- Call Playwright from `apps/web`.
- Create repository interfaces “for later” with no storage behind them.
