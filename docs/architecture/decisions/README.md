# Architecture Decision Records

ADRs capture **why** we chose a structure — not implementation tutorials.

## Format

Each ADR is a short markdown file:

- **Status:** proposed | accepted | superseded
- **Context:** what forced the decision
- **Decision:** what we do
- **Consequences:** trade-offs

## Index

| ID | Title | Status |
| --- | --- | --- |
| [001](./001-monorepo-npm-workspaces.md) | Monorepo with npm workspaces | accepted |
| [002](./002-engine-boundary.md) | Engine stays headless and Node-only | accepted |
| [003](./003-web-scan-adapter.md) | Web uses a ScanClient adapter | accepted |
| [004](./004-saas-domain-separation.md) | SaaS domains stay outside the engine | accepted |
| [005](./005-defer-backend-packages.md) | Defer API/worker packages until real code | accepted |
| [006](./006-feature-folders-in-web.md) | Reserve web `domains/*` feature folders | accepted |
