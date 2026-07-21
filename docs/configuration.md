# Configuration

Create `a11y-ops.config.ts` in your project root. It is loaded automatically.

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

Also supported: `a11y-ops.config.js`, `.mjs`, `.cjs`, `.json`.

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
