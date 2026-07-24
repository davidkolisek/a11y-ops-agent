# ADR 001 — Monorepo with npm workspaces

- **Status:** accepted
- **Date:** 2026-07-24

## Context

We need one repo for the published CLI, the reusable scan engine, shared types, and a web app — without pnpm or Turborepo complexity.

## Decision

Use **native npm workspaces** with:

- `packages/shared`, `packages/engine`, `packages/cli`
- `apps/web` (and later `apps/api`, `apps/worker` when implemented)

The published npm package remains `a11y-agent-ops` from `packages/cli`.

## Consequences

- Simple toolchain; one lockfile.
- CLI publish vendors workspace builds for a self-contained tarball.
- Empty future apps must **omit** `package.json` until they have code (workspaces only pick up packages).
