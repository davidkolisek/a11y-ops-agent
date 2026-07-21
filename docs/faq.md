# FAQ

## What does it scan?

Any site you can open in a browser — Vue, React, Angular, Svelte, Java/Spring, WordPress, Drupal, plain HTML. No framework or build-tool dependency.

## How does it work?

```text
URL
 │
 ├─► Playwright crawl (Chromium, network idle, same-origin links)
 │
 ├─► axe-core scan per page (violations only)
 │
 ├─► Screenshot each violation (highlight + A11Y-00N label)
 │
 ├─► Optional AI remediation analysis
 │
 └─► .a11y-ops-report/<project>/  →  index.html + tasks/ + screenshots/
```

## Requirements

- Node.js 18+
- Chromium (installed once via `npx playwright install chromium`)

## Where is the report?

Under `.a11y-ops-report/<project>/`. By default `<project>` is the target hostname. Re-scanning the same project overwrites that folder (latest run only).

```bash
open .a11y-ops-report/example.com/index.html
```

## What do the Markdown tasks look like?

One file per issue, formatted for ticket systems:

```markdown
# A11Y-001: Buttons must have discernible text

Priority:
Critical

URL:
https://example.com/checkout

Component/Selector:
`button.icon-only`

Screenshot:
`../screenshots/A11Y-001.png`

## Problem
…

## User impact
…

## Recommended fix
…

## WCAG reference
…
```

## Project structure (source)

```text
src/
  cli/           Command entry + audit orchestrator
  crawler/       Playwright site crawl
  scanner/       axe-core accessibility scanning
  screenshots/   Violation screenshots
  ai/            OpenAI-compatible analysis
  reports/       Markdown tasks + HTML report
  config/        Zod schemas + a11y-ops.config.* loader
  utils/         Shared helpers
  types/         Shared types
```

## More

- [Configuration](configuration.md)
- [CLI](cli.md)
- [AI](ai.md)
- [Examples](examples.md)
- [Roadmap](roadmap.md)
