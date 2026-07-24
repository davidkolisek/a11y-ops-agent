# Netlify Functions

Stateless serverless host for accessibility scans.

Path on disk: `apps/web/netlify/functions` (repo-root `netlify/` is a symlink for the same tree).

## `scan`

`POST /.netlify/functions/scan`

```json
{ "url": "https://example.com" }
```

Optional: `cliOverrides` (`aiMode`, `maxPages`, …).

Response:

```json
{ "success": true, "data": { /* AccessibilityReport */ } }
```

or

```json
{ "success": false, "error": "message" }
```

Uses `@a11y-agent-ops/engine` + `@sparticuz/chromium` on Netlify (Playwright’s bundled browser is not available in Functions). Local `netlify dev` uses normal Playwright Chromium when not in a Lambda-like env.
