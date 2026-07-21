🇸🇰 Slovensky | 🇺🇸 [English](README.md)

# a11y-agent-ops

**Audity prístupnosti, z ktorých vzniknú hotové úlohy pre vývojárov.**

Prejde ľubovoľný web v reálnom prehliadači, spustí axe-core WCAG kontroly, urobí zvýraznené screenshoty a vygeneruje Markdown tickety plus HTML report. Voliteľné AI vysvetlenia robia z každého nálezu niečo, na čom sa dá hneď pracovať — nie len ďalšie skóre.

---

## Funkcie

- Nezávislé od frameworku — funguje s akýmkoľvek stackom aj čistým HTML
- AI vysvetlenia problémov s prístupnosťou
- Zvýraznené screenshoty ku každému porušeniu
- Markdown úlohy pripravené pre vývojárov
- Samostatný HTML report
- Funguje na akomkoľvek webe aj na localhoste

---

## Inštalácia

```bash
npm install -g a11y-agent-ops
npx playwright install chromium
```

Alebo bez globálnej inštalácie:

```bash
npx a11y-agent-ops scan https://example.com
```

Vyžaduje Node.js 18+.

---

## Rýchly štart

```bash
a11y-ops scan http://localhost:3000
```

```bash
a11y-ops scan https://example.com
```

---

## Výstup

```text
.a11y-ops-report/<project>/
├── index.html      # Interaktívny HTML dashboard
├── screenshots/    # Zvýraznené PNG ku každému porušeniu
└── tasks/          # Markdown tickety pre Jira / Linear / GitHub
```

`<project>` je predvolene hostname cieľovej URL (prepíšete cez `--project`).

---

## Prečo A11yOps?

Väčšina nástrojov na prístupnosť skončí pri zozname porušení. Tím si stále musí problémy reprodukovať, vysvetliť dopad a napísať tickety.

A11yOps túto medzeru zatvára — z každého nálezu vznikne úloha pripravená na skopírovanie: selektor, screenshot, WCAG referencia a praktický návrh opravy.

---

## Licencia

MIT

---

Ďalšie čítanie: [Konfigurácia](docs/configuration.md) · [CLI](docs/cli.md) · [AI](docs/ai.md) · [Príklady](docs/examples.md) · [FAQ](docs/faq.md) · [Roadmapa](docs/roadmap.md)
