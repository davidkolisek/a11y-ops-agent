# ADR 006 — Reserve web `domains/*` feature folders

- **Status:** accepted
- **Date:** 2026-07-24

## Context

The web app will grow from a public scanner into an authenticated product. Dumping every future screen into `views/` becomes messy.

## Decision

Reserve `apps/web/src/domains/<feature>/` folders (projects, organizations, teams, history, schedules, billing, notifications) with README placeholders.

- Public/marketing + scan flow stay in existing `views/`, `components/`, `services/scan/`.
- SaaS screens land in `domains/*` when built.
- No routes registered for these domains until features exist.

## Consequences

- Clear place for future UI without building unused routers.
- Avoids a second micro-frontend or package split too early.
