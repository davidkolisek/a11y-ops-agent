# Shared package domain layout

`@a11y-agent-ops/shared` already holds scan/report/AI/config types used by CLI, engine, and web.

## Future SaaS types

When API + web need shared DTOs for orgs/projects/runs, add them under this folder, for example:

```text
domain/
  organization.ts
  project.ts
  scan-run.ts
  membership.ts
```

**Do not** put Playwright or engine logic here.  
**Do not** add empty type files until the first API contract is real.

Scanning types remain in the existing top-level modules (`scan.ts`, `reports.ts`, …).
