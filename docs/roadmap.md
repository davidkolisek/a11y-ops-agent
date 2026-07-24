# Roadmap

MVP focus: crawl → axe-core → screenshots → tasks → HTML report, with optional AI.

## Architecture (SaaS-ready structure)

See **[docs/architecture/](./architecture/README.md)** for monorepo boundaries, ADRs, and reserved folders for Projects, Organizations, Billing, Workers, etc.

No backend/auth/API is implemented yet — only structure and decisions.

## Planned

- CI-friendly exit codes / severity thresholds
- Incremental / diff scans between runs
- More ticket export formats (GitHub Issues, Linear API)
- Auth / cookie support for protected environments
- Parallel page scanning for larger sites

## SaaS ideas (documented, not built)

- Team dashboards across multiple projects
- Scan history & scheduled scans
- Organizations, billing, notifications
- Public API + worker queue

## Ideas

- Custom rule packs beyond axe-core defaults
- Browser extension companion for one-off pages

Contributions and feedback welcome — open an issue or PR.
