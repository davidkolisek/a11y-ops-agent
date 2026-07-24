# Future worker (`apps/worker`)

**Status:** reserved placeholder — **not implemented**.

## Purpose

Background process that:

- Pulls jobs from a queue (scheduled scans, on-demand scans)
- Runs `engine.scan()`
- Stores `AccessibilityReport` + artifacts
- Emits completion events for notifications

## When to promote this folder

Add `package.json` when the first queue consumer is written.  
Until then, local/dev scans can remain mock (web) or in-process (CLI).

## Rules

- One job = one scan invocation (keep retries idempotent at the API layer).
- Engine stays free of queue SDKs; the worker is the adapter.

See [saas-expansion.md](../../docs/architecture/saas-expansion.md).
