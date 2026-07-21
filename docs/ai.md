# AI analysis

AI is **optional**. The crawl, axe-core scan, screenshots, HTML report, and Markdown tasks always run. AI only enriches the written guidance for each issue.

## With vs without AI

| | Without AI | With AI |
| --- | --- | --- |
| When | No `OPENAI_API_KEY`, or `--ai-mode off`, or `ai.enabled: false` | Key set and AI enabled (`auto` / `on`) |
| Cost / time | Free, faster | Uses tokens; CLI prints usage + estimated USD |
| HTML report | Same dashboard, score, screenshots, rules | Same structure — richer explanations and fixes |
| Issue title | axe-core help text | Short, developer-oriented title from the model |
| Description | Raw axe description (+ failure summary) | Practical explanation of *why* it fails |
| User impact | Generic impact based on axe severity | Concrete UX impact (screen readers, keyboard, etc.) |
| Suggested fix | Generic WCAG-aligned boilerplate + affected HTML | Concrete fix (attributes, markup, components) |
| Priority | Mapped from axe impact | Model priority (`critical` \| `high` \| `medium` \| `low`) |
| Language (`--sk`) | UI labels + fallback copy in Slovak; axe rule text stays English | UI + AI prose in Slovak |

**Bottom line:** without AI you still get a full audit. With AI, tickets become actionable remediation notes.

## Setup

```bash
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini   # optional
# export OPENAI_BASE_URL=https://api.openai.com/v1   # optional, OpenAI-compatible providers

a11y-ops scan https://example.com
```

Skip AI:

```bash
a11y-ops scan https://example.com --ai-mode off
```

## Modes

| Mode | Behavior |
| --- | --- |
| `--ai-mode auto` (default) | Run AI when the API key is present; otherwise skip quietly |
| `--ai-mode on` | Require AI (fails without a key) |
| `--ai-mode off` | Always skip AI |

Works with OpenAI and compatible endpoints (Azure OpenAI, OpenRouter, LiteLLM, local gateways) via `OPENAI_BASE_URL`.

When AI runs, each violation is analyzed and validated (title, summary, explanation, fix, UX impact, priority, effort). The CLI prints aggregated token usage and an estimated USD cost when pricing is known.
