# ADR 005 — Defer backend packages until real code exists

- **Status:** accepted
- **Date:** 2026-07-24

## Context

It is tempting to scaffold empty `api`, `worker`, `db`, and `auth` packages “for later.” Empty packages rot and create fake confidence.

## Decision

- Document future apps under `apps/api` and `apps/worker` with README placeholders only.
- Do **not** add `package.json`, frameworks, or ORM stubs until the first real endpoint/job is implemented.
- Do **not** invent repository interfaces without a storage backend.

## Consequences

- Docs carry the architectural intent.
- When backend work starts, we choose stack versions that are current — not outdated scaffolds.
- Slightly more setup on day one of backend work — preferred over years of dead code.
