# System overview

## Monorepo (npm workspaces)

```text
a11y-agent-ops/
├── apps/
│   ├── web/          # Public Vue SPA (scan UI + reports)
│   ├── api/          # Reserved — future SaaS HTTP API (no package yet)
│   └── worker/       # Reserved — future job runner (no package yet)
├── netlify/              # Symlink → apps/web/netlify (functions live with the web app package)
│   └── functions/        # Stateless scan function (engine host)
├── packages/
│   ├── shared/       # Domain types shared by CLI, engine, web
│   ├── engine/       # Headless scan pipeline (crawl → axe → AI → report)
│   └── cli/          # Published npm CLI (`a11y-ops` / `a11y-agent-ops`)
└── docs/
    └── architecture/ # This documentation
```

Workspaces are declared in the root `package.json` as `packages/*` and `apps/*`.  
Directories under `apps/` **without** a `package.json` are intentional placeholders and are ignored by npm workspaces.

## Runtime boundaries

| Surface | Runs where | Talks to |
| --- | --- | --- |
| **CLI** | User machine / CI | `engine` directly |
| **Engine** | Node process | Playwright, axe-core, optional OpenAI-compatible API |
| **Web** | Browser | `ScanClient` → `scanWebsite()` |
| **Netlify Function `scan`** | Netlify | `engine.scan()` (stateless) |
| **API** (future SaaS) | Server | DB, auth, queue — not used for public scans today |
| **Worker** (future) | Background process | Queue + `engine` |

```text
Today:
  CLI ──────────────► engine
  Web ──► scanWebsite() ──► /.netlify/functions/scan ──► engine
```

## Dependency rule

- `shared` has **no** runtime dependency on engine/cli/web.
- `engine` depends on `shared` only.
- `cli` depends on `engine` + `shared`.
- `web` may depend on `shared` types, **never** on `engine` (Playwright cannot ship to the browser).

## Source of truth for scan results

The canonical result type is `AccessibilityReport` in `@a11y-agent-ops/shared`.  
CLI, mocks, future API responses, and web report UI should all speak this shape (or a thin DTO that maps 1:1 to it).
