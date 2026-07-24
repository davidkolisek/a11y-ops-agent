# Architecture

This folder documents how **a11y-agent-ops** is structured today and how it should grow into a SaaS product **without premature backend work**.

## Read first

| Doc | Purpose |
| --- | --- |
| [overview.md](./overview.md) | Current monorepo map and runtime boundaries |
| [domains.md](./domains.md) | Product domains (scan vs SaaS) and ownership |
| [scanning.md](./scanning.md) | How scanning works across CLI, engine, and web |
| [saas-expansion.md](./saas-expansion.md) | Reserved structure for Projects, Billing, Workers, etc. |
| [decisions/](./decisions/) | Architecture Decision Records (ADRs) |

## Principles

1. **Ship what we need now** — CLI + engine + mock-driven web UI.
2. **Keep boundaries honest** — the browser never bundles Playwright/engine.
3. **Prefer folders + docs over empty packages** — add `package.json` only when code exists.
4. **One swap point per concern** — e.g. `createScanClient()` for scan execution.
5. **No fake layers** — no repository/service/factory stacks until there is a real API.

## Explicitly out of scope (today)

- Backend / HTTP API implementation
- Authentication / authorization
- Billing providers
- Workers / queues
- Database schemas

Those are **planned**, documented, and given a home in the tree — not implemented.
