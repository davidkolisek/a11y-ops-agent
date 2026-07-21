🇺🇸 English | 🇸🇰 [Slovensky](README.sk.md)

# a11y-agent-ops

**Accessibility audits that turn into developer-ready tasks.**

Crawl any website in a real browser, run axe-core WCAG checks, capture highlighted screenshots, and get Markdown tickets plus an HTML report. Optional AI explanations make each finding actionable — not just another score.

---

## Features

- Framework independent — works with any stack or plain HTML
- AI-powered accessibility explanations
- Highlighted screenshots for every violation
- Developer-ready Markdown tasks
- Self-contained HTML report
- Works on any website or localhost

---

## Installation

```bash
npm install -g a11y-agent-ops
npx playwright install chromium
```

Or without a global install:

```bash
npx a11y-agent-ops scan https://example.com
```

Requires Node.js 18+.

---

## Quick Start

```bash
a11y-ops scan http://localhost:3000
```

```bash
a11y-ops scan https://example.com
```

---

## Output

```text
.a11y-ops-report/<project>/
├── index.html      # Interactive HTML dashboard
├── screenshots/    # Highlighted PNGs per violation
└── tasks/          # Markdown tickets ready for Jira / Linear / GitHub
```

`<project>` defaults to the target hostname (override with `--project`).

---

## Why A11yOps?

Most accessibility tools stop at listing violations. Teams still have to reproduce issues, explain impact, and write tickets.

A11yOps closes that gap — each finding becomes a copy/paste-ready task with selector, screenshot, WCAG reference, and a practical fix.

---

## License

MIT

---

Further reading: [Configuration](docs/configuration.md) · [CLI](docs/cli.md) · [AI](docs/ai.md) · [Examples](docs/examples.md) · [FAQ](docs/faq.md) · [Roadmap](docs/roadmap.md)
