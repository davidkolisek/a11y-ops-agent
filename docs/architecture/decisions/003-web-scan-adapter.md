# ADR 003 — Web uses a ScanClient adapter

- **Status:** accepted
- **Date:** 2026-07-24
- **Updated:** 2026-07-24

## Context

The web app needs a complete scan UX, with a thin seam between UI and scan execution.

## Decision

Introduce a small host-agnostic interface:

```ts
interface ScanClient {
  scan(options: ScanOptions & { signal?: AbortSignal }): Promise<AccessibilityReport>
}
```

- Default: `createHttpScanClient()` → `scanWebsite()` → `POST /.netlify/functions/scan`
- Fallback: `createMockScanClient()` when `VITE_USE_MOCK_SCAN=true`
- UI uses `useScan()` only; UI must not reference Netlify URLs

## Consequences

- Single Netlify project (static web + functions)
- No standalone API server for public scans
- Progress is approximated (JSON request/response, not a stream)
