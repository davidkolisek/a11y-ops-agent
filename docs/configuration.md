# Configuration

Two layers — use one or both.

## Precedence

**CLI flags > project config > global config > built-in defaults**

## Global config (`~/.a11y-ops/`)

Best fit for a global CLI install (`npm i -g`). Applies to every scan from any directory.

```bash
mkdir -p ~/.a11y-ops
```

`~/.a11y-ops/a11y-ops.config.ts`:

```ts
export default {
  maxPages: 50,
  wcagLevel: 'AA',
  ai: { enabled: true },
};
```

Also: `.js`, `.mjs`, `.cjs`, `.json`.

## Project config (cwd)

Best fit when auditing a specific app in its repository. Create `a11y-ops.config.ts` in the project root — loaded automatically from the current working directory.

```ts
export default {
  maxPages: 50,

  ignorePaths: ['/admin'],

  includePaths: ['/checkout'],

  ai: {
    enabled: true,
  },
};
```

Or pass an explicit file: `--config ./path/to/config.ts`.

## Options

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

CLI flags override config when provided. See [CLI](cli.md).

## AI keys

See [AI](ai.md) — typically `~/.a11y-ops/.env` for global use.
