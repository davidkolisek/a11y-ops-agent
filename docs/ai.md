# AI analysis

AI is **optional**. The crawl, axe-core scan, screenshots, HTML report, and Markdown tasks always run. AI only enriches the written guidance for each issue.

## Where to put the API key

For a **global CLI** install, run once:

```bash
a11y-ops setup
```

This creates `~/.a11y-ops/`, writes a starter `.env` + `a11y-ops.config.ts`, and opens the folder.

Or create the env file yourself:

```bash
mkdir -p ~/.a11y-ops
cat > ~/.a11y-ops/.env << 'EOF'
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1
EOF
```

Then `a11y-ops scan …` works from any directory.

### Precedence

1. Already-set environment variables (shell / CI) — highest
2. `<cwd>/.env` (project)
3. `~/.a11y-ops/.env` (global)

You can also put `export OPENAI_API_KEY=sk-...` in `~/.zshrc` / `~/.bashrc`.

## With vs without AI

| | Without AI | With AI |
| --- | --- | --- |
| When | No API key, or `--ai-mode off`, or `ai.enabled: false` | Key available and AI enabled (`auto` / `on`) |
| Cost / time | Free, faster | Uses tokens; CLI prints usage + estimated USD |
| HTML report | Same dashboard, score, screenshots, rules | Same structure — richer explanations and fixes |
| Issue title | axe-core help text | Short, developer-oriented title from the model |
| Description | Raw axe description (+ failure summary) | Practical explanation of *why* it fails |
| User impact | Generic impact based on axe severity | Concrete UX impact (screen readers, keyboard, etc.) |
| Suggested fix | Generic WCAG-aligned boilerplate + affected HTML | Concrete fix (attributes, markup, components) |
| Priority | Mapped from axe impact | Model priority (`critical` \| `high` \| `medium` \| `low`) |

**Bottom line:** without AI you still get a full audit. With AI, tickets become actionable remediation notes.

## Modes

| Mode | Behavior |
| --- | --- |
| `--ai-mode auto` (default) | Run AI when an API key is present; otherwise skip quietly |
| `--ai-mode on` | Require AI (fails without a key) |
| `--ai-mode off` | Always skip AI |

Works with OpenAI and compatible endpoints (Azure OpenAI, OpenRouter, LiteLLM, local gateways) via `OPENAI_BASE_URL`.
