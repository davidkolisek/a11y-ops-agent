# Scanning architecture

## Engine API

```ts
scan(options: ScanOptions): Promise<AccessibilityReport>
```

- No Commander, no `console.log`, no interactive prompts.
- Progress via optional `onProgress` callbacks.
- File artifacts (screenshots/tasks/HTML) are produced when output dirs are configured.

## CLI

Thin host:

1. Parse argv (Commander)
2. Call `scan()`
3. Print progress
4. Open post-scan UX

## Web

```text
UI → useScan() → ScanClient → scanWebsite() → Netlify Function → engine.scan()
                 → toReportPresentation() → ReportPage audiences
```

| Module | Role |
| --- | --- |
| `apps/web/src/api/scan.ts` | HTTP client (`scanWebsite`) — only place that knows the function path |
| `apps/web/src/services/scan/createScanClient.ts` | Swap HTTP ↔ mock |
| `apps/web/src/composables/useScan.ts` | start / cancel / reset |
| `apps/web/src/stores/scan.ts` | Session state |
| `apps/web/src/lib/report/` | Map report → UI model |
| `netlify/functions/scan` (→ `apps/web/netlify/functions`) | Stateless handler: validate URL → `engine.scan()` → JSON |

## Compatibility checklist

1. Response JSON maps to `AccessibilityReport` (embedded screenshot data URLs).
2. Cancel maps to `AbortSignal` on `fetch`.
3. Report UI keeps using `toReportPresentation(report)`.
