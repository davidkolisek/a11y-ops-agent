# a11y-ops-agent

**Framework-independent accessibility auditing for real-world web apps.**

`a11y-ops-agent` crawls your site in a real browser, runs axe-core WCAG checks, captures highlighted screenshots, optionally explains issues with AI, and ships Jira-ready tasks plus an HTML report — so accessibility work becomes actionable, not just a score.

```bash
npm install -g a11y-ops-agent
a11y-ops-agent scan https://example.com
```

---

## What is a11y-ops-agent?

`a11y-ops-agent` is a Node.js CLI that audits any website or web application you can open in a browser:

- Vue, React, Angular, Svelte
- Java / Spring and other server-rendered apps
- CMS sites (WordPress, Drupal, …)
- Plain HTML

It does **not** depend on your framework or build tooling. Point it at a URL and it:

1. Crawls internal pages (SPA-aware, waits for network idle)
2. Scans each page with **axe-core** (WCAG A / AA / AAA)
3. Screenshots every violation with a red highlight + ID label
4. Optionally analyzes issues with an **OpenAI-compatible** API
5. Writes **Markdown tasks** and a self-contained **HTML dashboard**

---

## Why it exists

Most accessibility tools stop at “here are violations.” Teams still have to:

- reproduce the issue visually
- explain impact to developers and product
- file tickets with enough context to fix

`a11y-ops-agent` closes that gap. Each finding becomes a copy/paste-ready task with selector, screenshot, WCAG reference, and a practical fix suggestion — ready for Jira, Linear, or GitHub Issues.

---

## Requirements

- **Node.js 18+**
- **Chromium** (installed once via Playwright)

---

## Installation

```bash
npm install -g a11y-ops-agent
npx playwright install chromium
```

Or use it without a global install:

```bash
npx a11y-ops-agent scan https://example.com
```

---

## Quick start

```bash
a11y-ops-agent scan https://example.com
```

Local app:

```bash
a11y-ops-agent scan http://localhost:3000
```

Limit crawl size and set WCAG level:

```bash
a11y-ops-agent scan https://example.com --max-pages 100 --wcag-level AA
```

---

## What you get

After a scan, output is stored **per project** under `.a11y-ops-report/<project>/` so auditing multiple sites does not overwrite each other.

By default `<project>` is the target URL hostname (e.g. `example.com`). Override with `--project <name>` or `projectName` in config. Re-scanning the **same** project still overwrites that project’s folder (latest run only).

```text
.a11y-ops-report/
├── example.com/
│   ├── index.html          # HTML dashboard report
│   ├── screenshots/        # Highlighted PNGs (A11Y-001.png, …)
│   └── tasks/              # Jira-ready Markdown tickets (A11Y-001.md, …)
└── example-two.com/
    ├── index.html
    ├── screenshots/
    └── tasks/
```

### `index.html`

A responsive, dependency-free HTML report with:

- Accessibility score
- Pages scanned / total issues
- Critical / High / Medium breakdown
- Per-issue cards: screenshot, URL, WCAG rule, description, explanation, suggested fix, link to the Markdown task
- Explanation / fix quality depends on whether AI ran (see [AI analysis](#ai-analysis-optional))

Open it in any browser:

```bash
open .a11y-ops-report/example.com/index.html
```

### `screenshots/`

Full-page screenshots for each violation. The affected element is outlined in red and labeled with its id (`A11Y-001`, `A11Y-002`, …).

### `tasks/`

One Markdown file per issue, formatted for ticket systems:

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

---

## Console experience

```text
Starting accessibility audit...
Project: example.com

✓ Crawling pages
✓ Found 25 pages

✓ Running accessibility checks

Issues found:
32

✓ Generating screenshots
✓ AI analysis completed
  Tokens: 48,210 (prompt 41,900 + completion 6,310) · Est. cost: $0.0101 (gpt-4o-mini)
✓ Tasks generated
✓ Report created

Final output:

Report:
.a11y-ops-report/example.com/index.html

Tasks:
.a11y-ops-report/example.com/tasks/
```

---

## Examples

### Audit a production URL

```bash
a11y-ops-agent scan https://example.com --max-pages 50
```

### Focus on checkout only

`a11y-ops.config.ts`:

```ts
export default {
  maxPages: 30,
  includePaths: ['/checkout'],
  ignorePaths: ['/admin', '/api'],
  ai: { enabled: true },
};
```

```bash
a11y-ops-agent scan https://shop.example.com
```

### Override config from the CLI

```bash
a11y-ops-agent scan https://example.com --max-pages 100 --ai-mode off
```

### Strict WCAG AAA

```bash
a11y-ops-agent scan https://example.com --wcag-level AAA
```

### Named project folder

```bash
a11y-ops-agent scan https://staging.example.com --project vehicle-insurance
```

Writes to `.a11y-ops-report/vehicle-insurance/` instead of using the hostname. Useful when the same host serves multiple products.

### Slovak report language

```bash
a11y-ops-agent scan https://example.com --sk
```

Generates the HTML report, Markdown tasks, and AI explanations in Slovak. Default without `--sk` is English.

You can also set this in config:

```ts
export default {
  locale: 'sk', // 'en' | 'sk'
};
```

### Verbose debugging

```bash
a11y-ops-agent scan http://localhost:3000 --verbose
```

---

## Configuration

Create `a11y-ops.config.ts` in your project root. It is loaded automatically.

```ts
export default {
  maxPages: 50,

  ignorePaths: [
    '/admin',
  ],

  includePaths: [
    '/checkout',
  ],

  ai: {
    enabled: true,
  },
};
```

Also supported: `a11y-ops.config.js`, `.mjs`, `.cjs`, `.json`.

| Option | Description |
| --- | --- |
| `maxPages` | Maximum pages to crawl (default `50`) |
| `ignorePaths` | Path prefixes to skip (e.g. `/admin`) |
| `includePaths` | If set, only crawl matching paths |
| `ai.enabled` | Run AI analysis when an API key is available |
| `wcagLevel` | `A` \| `AA` \| `AAA` (default `AA`) |
| `locale` | Report / task / AI language: `en` (default) or `sk` |
| `projectName` | Folder under `.a11y-ops-report/<name>/` (default: target hostname) |
| `reportsDir` / `screenshotsDir` / `tasksDir` | Custom output paths (skips auto per-project nesting when set) |

CLI flags override config when provided:

| Flag | Overrides |
| --- | --- |
| `--max-pages <n>` | `maxPages` |
| `--wcag-level <level>` | `wcagLevel` |
| `--ai-mode <auto\|on\|off>` | `ai.enabled` |
| `--sk` | `locale: 'sk'` (Slovak output; default English) |
| `--project <name>` | `projectName` (report folder name) |
| `--config <path>` | Use a specific config file |
| `-v, --verbose` | Detailed progress logs |

---

## AI analysis (optional)

AI is **optional**. The crawl, axe-core scan, screenshots, HTML report, and Markdown tasks always run. AI only enriches the written guidance for each issue.

| | Without AI | With AI |
| --- | --- | --- |
| When | No `OPENAI_API_KEY`, or `--ai-mode off`, or `ai.enabled: false` | Key set and AI enabled (`auto` / `on`) |
| Cost / time | Free, faster | Uses tokens; CLI prints usage + estimated USD |
| HTML report | Same dashboard, score, screenshots, rules | Same structure — richer explanations and fixes |
| Issue title | axe-core help text (e.g. “Buttons must have discernible text”) | Short, developer-oriented title from the model |
| Description / problem | Raw axe description (+ failure summary) | Practical developer explanation of *why* it fails |
| AI explanation / user impact | Generic impact based on axe severity | Concrete UX impact (screen readers, keyboard, etc.) |
| Suggested / recommended fix | Generic WCAG-aligned boilerplate + affected HTML | Concrete fix (attributes, markup, component changes) |
| Priority | Mapped from axe impact (`critical` / `serious` → …) | Model priority (`critical` \| `high` \| `medium` \| `low`) |
| Language (`--sk`) | UI labels + fallback copy in Slovak; axe rule text stays English | UI + AI prose in Slovak (selectors / rule IDs unchanged) |

**Bottom line:** without AI you still get a full audit artifact (score, screenshots, tickets, WCAG rule links). With AI, tickets and report cards become actionable remediation notes instead of mostly repeating axe output.

When AI runs, each violation is analyzed with a senior-frontend-accessibility-style prompt. Responses are validated with Zod and include title, summary, developer explanation, suggested fix, UX impact, priority, and estimated effort.

After AI finishes, the CLI prints aggregated token usage and an estimated USD cost (when the model has known OpenAI list pricing). Costs are approximate — actual billing may differ for cached tokens, fine-tunes, or non-OpenAI providers.

```bash
# With AI (needs key)
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini   # optional
# export OPENAI_BASE_URL=https://api.openai.com/v1   # optional, OpenAI-compatible providers
a11y-ops-agent scan https://example.com

# Without AI (same report structure, axe-based copy)
a11y-ops-agent scan https://example.com --ai-mode off
```

| Mode | Behavior |
| --- | --- |
| `--ai-mode auto` (default) | Run AI when the API key is present; otherwise skip quietly |
| `--ai-mode on` | Require AI (fails without a key) |
| `--ai-mode off` | Always skip AI |

Works with OpenAI and compatible endpoints (Azure OpenAI, OpenRouter, LiteLLM, local gateways, etc.) via `OPENAI_BASE_URL`.

---

## How it works

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

---

## Development

```bash
git clone <repo-url>
cd a11y-ops-agent
npm install
npx playwright install chromium

npm run dev -- scan http://localhost:3000
npm run build
npm start -- scan https://example.com
```

| Script | Description |
| --- | --- |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run dev` | Run CLI via `tsx` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |

---

## Project structure

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

---

## License

MIT

---

**Ship accessible UI with tickets your team can actually fix.**  
`a11y-ops-agent scan https://your-app.com`
