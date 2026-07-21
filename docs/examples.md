# Examples

## Production URL

```bash
a11y-ops scan https://example.com --max-pages 50
```

## Local app

```bash
a11y-ops scan http://localhost:3000
```

## Focus on checkout only

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
a11y-ops scan https://shop.example.com
```

## Override config from the CLI

```bash
a11y-ops scan https://example.com --max-pages 100 --ai-mode off
```

## Strict WCAG AAA

```bash
a11y-ops scan https://example.com --wcag-level AAA
```

## Named project folder

```bash
a11y-ops scan https://staging.example.com --project vehicle-insurance
```

Writes to `.a11y-ops-report/vehicle-insurance/` instead of the hostname. Useful when the same host serves multiple products.

## Slovak report language

```bash
a11y-ops scan https://example.com --sk
```

Generates the HTML report, Markdown tasks, and AI explanations in Slovak. Default without `--sk` is English.

Or in config:

```ts
export default {
  locale: 'sk', // 'en' | 'sk'
};
```

## Verbose debugging

```bash
a11y-ops scan http://localhost:3000 --verbose
```
