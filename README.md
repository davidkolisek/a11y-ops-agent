🇺🇸 English | 🇸🇰 [Slovensky](https://github.com/davidkolisek/a11y-agent-ops/blob/master/README.sk.md)

# a11y-agent-ops

**Accessibility audits that turn into developer-ready tasks.**

Crawl any website in a real browser, run axe-core WCAG checks, capture highlighted screenshots, and get Markdown tickets plus an HTML report. Optional AI explanations make each finding actionable — not just another score.

**GitHub:** [github.com/davidkolisek/a11y-agent-ops](https://github.com/davidkolisek/a11y-agent-ops) · **npm:** [npmjs.com/package/a11y-agent-ops](https://www.npmjs.com/package/a11y-agent-ops)

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

After install you should see a short tip. Then run:

```bash
a11y-ops setup
```

That creates `~/.a11y-ops/` (`.env` + config), prints the paths, and opens the folder in Finder / Explorer.

---

## Quick Start

```bash
a11y-ops scan http://localhost:3000
a11y-ops scan https://example.com
```

Useful flags:

```bash
a11y-ops scan https://example.com --max-pages 50 --wcag-level AA
a11y-ops scan https://example.com --project my-app --sk
a11y-ops scan https://example.com --ai-mode off
```

| Flag | Description |
| --- | --- |
| `--max-pages <n>` | Max pages to crawl |
| `--wcag-level <A\|AA\|AAA>` | WCAG level (default `AA`) |
| `--ai-mode <auto\|on\|off>` | AI analysis mode |
| `--project <name>` | Report folder name |
| `--sk` | Slovak report / tasks / AI |
| `-v, --verbose` | Detailed logs |

---

## Global CLI vs per-project

Two different workflows — pick what fits:

| | Global CLI (`npm i -g`) | Per-project |
| --- | --- | --- |
| When | You scan any URL from anywhere | You audit one app in its repo |
| AI key | `~/.a11y-ops/.env` (once) | same, or project `.env` |
| Defaults | `~/.a11y-ops/a11y-ops.config.ts` | optional |
| App-specific settings | CLI flags | `a11y-ops.config.ts` in the repo |

Precedence: **CLI flags > project config > global config > built-in defaults**.

---

## AI setup (do this once)

AI is optional. Without a key you still get the full audit (score, screenshots, tasks). With a key, explanations and fixes get smarter.

**Recommended for a global install** — run:

```bash
a11y-ops setup
```

Or create `~/.a11y-ops/.env` yourself:

```bash
mkdir -p ~/.a11y-ops
cat > ~/.a11y-ops/.env << 'EOF'
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1
EOF
```

Then from any directory:

```bash
a11y-ops scan https://example.com
```

Alternatives:

- export in your shell (`~/.zshrc`): `export OPENAI_API_KEY=sk-...`
- project `.env` in the current working directory (overrides global `.env` for unset shell vars)

| Mode | Behavior |
| --- | --- |
| `--ai-mode auto` (default) | Run AI when a key is available |
| `--ai-mode on` | Require AI (fails without a key) |
| `--ai-mode off` | Always skip AI |

Works with OpenAI and compatible endpoints (Azure OpenAI, OpenRouter, LiteLLM, local gateways) via `OPENAI_BASE_URL`.

---

## Configuration

### Global defaults (`~/.a11y-ops/`)

For a global CLI — defaults that apply to every scan:

```bash
# ~/.a11y-ops/a11y-ops.config.ts
export default {
  maxPages: 50,
  wcagLevel: 'AA',
  ai: { enabled: true },
};
```

### Per-project (optional)

When you `cd` into an app repo and want crawl rules for that app only, add `a11y-ops.config.ts` in the project root:

```ts
export default {
  maxPages: 50,
  wcagLevel: 'AA',
  ignorePaths: ['/admin'],
  includePaths: ['/checkout'],
  locale: 'en', // or 'sk'
  projectName: 'my-app',
  ai: {
    enabled: true,
  },
};
```

Also supported: `.js`, `.mjs`, `.cjs`, `.json`. Or pass `--config ./path/to/config.ts`.

| Option | Description |
| --- | --- |
| `maxPages` | Maximum pages to crawl (default `50`) |
| `ignorePaths` | Path prefixes to skip |
| `includePaths` | If set, only crawl matching paths |
| `wcagLevel` | `A` \| `AA` \| `AAA` (default `AA`) |
| `locale` | `en` (default) or `sk` |
| `projectName` | Folder under `.a11y-ops-report/<name>/` |
| `ai.enabled` | Enable AI when an API key is available |

---

## Output

```text
.a11y-ops-report/<project>/
├── index.html      # Interactive HTML dashboard
├── screenshots/    # Highlighted PNGs per violation
└── tasks/          # Markdown tickets ready for Jira / Linear / GitHub
```

Written relative to your **current working directory**. `<project>` defaults to the target hostname.

After a scan, the report opens in your browser and the CLI stays open with a small menu (open again / open folder / copy path / quit).

---

## Why A11yOps?

Most accessibility tools stop at listing violations. Teams still have to reproduce issues, explain impact, and write tickets.

A11yOps closes that gap — each finding becomes a copy/paste-ready task with selector, screenshot, WCAG reference, and a practical fix.

---

## Docs

- [Architecture](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/architecture/README.md)
- [Configuration](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/configuration.md)
- [CLI](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/cli.md)
- [AI](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/ai.md)
- [Examples](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/examples.md)
- [FAQ](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/faq.md)
- [Roadmap](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/roadmap.md)

---

## License

MIT
