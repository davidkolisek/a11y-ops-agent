# ADR 002 — Engine stays headless and Node-only

- **Status:** accepted
- **Date:** 2026-07-24

## Context

Scanning requires Playwright/Chromium. Bundling that into a Vite browser app is unsafe and impractical.

## Decision

- All crawl/scan/AI/report **business logic** lives in `packages/engine`.
- The engine exposes `scan(options): Promise<AccessibilityReport>`.
- `apps/web` must **not** import `@a11y-agent-ops/engine`.
- Browser hosts talk to a `ScanClient` (mock or future HTTP API).

## Consequences

- CLI and future workers share one pipeline.
- Web can ship a polished UX with mocks before a backend exists.
- Real SaaS scans require a server-side runner (API and/or worker).
