# ADR 004 — SaaS domains stay outside the engine

- **Status:** accepted
- **Date:** 2026-07-24

## Context

Future features (orgs, billing, schedules, teams) must not pollute the open-source scan engine used by the CLI.

## Decision

- Engine understands **URLs, WCAG, reports** — not tenants or invoices.
- SaaS concepts live in future `apps/api` / web `domains/*`.
- API jobs pass scan inputs into `engine.scan()` and store results with tenant metadata **outside** the engine.

## Consequences

- Engine remains usable as a library/CLI forever.
- Multi-tenant rules (quotas, roles) are enforced at the API edge.
- Slightly more mapping code at the API boundary — acceptable trade-off.
