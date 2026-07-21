# CLI

## Commands

```bash
a11y-ops scan <url> [options]
```

## Flags

| Flag | Overrides |
| --- | --- |
| `--max-pages <n>` | `maxPages` |
| `--wcag-level <level>` | `wcagLevel` (`A` \| `AA` \| `AAA`) |
| `--ai-mode <auto\|on\|off>` | `ai.enabled` |
| `--sk` | `locale: 'sk'` (Slovak output; default English) |
| `--project <name>` | `projectName` (report folder name) |
| `--config <path>` | Use a specific config file |
| `-v, --verbose` | Detailed progress logs |

## Console output

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
  Tokens: 48,210 · Est. cost: $0.0101 (gpt-4o-mini)
✓ Tasks generated
✓ Report created

Final output:

Report:
.a11y-ops-report/example.com/index.html

Tasks:
.a11y-ops-report/example.com/tasks/
```

## Development

```bash
git clone <repo-url>
cd a11y-agent-ops
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
