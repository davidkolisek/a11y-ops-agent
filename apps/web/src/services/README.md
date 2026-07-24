# Services

Host-side integrations for the web app (not Vue components).

| Path | Role |
| --- | --- |
| `scan/` | `ScanClient` adapter (`createScanClient` → HTTP or mock) |

HTTP calls live in `src/api/scan.ts` (`scanWebsite`). UI uses `useScan()` only.

Swap scan execution in `scan/createScanClient.ts`.
