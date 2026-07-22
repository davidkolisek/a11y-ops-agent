🇸🇰 Slovensky | 🇺🇸 [English](https://github.com/davidkolisek/a11y-agent-ops/blob/master/README.md)

# a11y-agent-ops

**Audity prístupnosti, z ktorých vzniknú hotové úlohy pre vývojárov.**

Prejde ľubovoľný web v reálnom prehliadači, spustí axe-core WCAG kontroly, urobí zvýraznené screenshoty a vygeneruje Markdown tickety plus HTML report. Voliteľné AI vysvetlenia robia z každého nálezu niečo, na čom sa dá hneď pracovať — nie len ďalšie skóre.

**GitHub:** [github.com/davidkolisek/a11y-agent-ops](https://github.com/davidkolisek/a11y-agent-ops) · **npm:** [npmjs.com/package/a11y-agent-ops](https://www.npmjs.com/package/a11y-agent-ops)

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
a11y-ops scan https://example.com
```

Užitočné flagy:

```bash
a11y-ops scan https://example.com --max-pages 50 --wcag-level AA
a11y-ops scan https://example.com --project my-app --sk
a11y-ops scan https://example.com --ai-mode off
```

| Flag | Popis |
| --- | --- |
| `--max-pages <n>` | Max. počet stránok na crawl |
| `--wcag-level <A\|AA\|AAA>` | WCAG úroveň (default `AA`) |
| `--ai-mode <auto\|on\|off>` | Režim AI analýzy |
| `--project <name>` | Názov priečinka reportu |
| `--sk` | Report / úlohy / AI po slovensky |
| `-v, --verbose` | Podrobné logy |

---

## Konfigurácia

V koreni projektu vytvor `a11y-ops.config.ts` — načíta sa automaticky.

```ts
export default {
  maxPages: 50,
  wcagLevel: 'AA',
  ignorePaths: ['/admin'],
  includePaths: ['/checkout'],
  locale: 'sk', // alebo 'en'
  projectName: 'my-app',
  ai: {
    enabled: true,
  },
};
```

Podporované aj: `a11y-ops.config.js`, `.mjs`, `.cjs`, `.json`.

CLI flagy majú prednosť pred config súborom.

| Option | Popis |
| --- | --- |
| `maxPages` | Max. počet stránok (default `50`) |
| `ignorePaths` | Prefixy ciest, ktoré sa preskočia |
| `includePaths` | Ak je nastavené, crawlí len zhodné cesty |
| `wcagLevel` | `A` \| `AA` \| `AAA` (default `AA`) |
| `locale` | `en` (default) alebo `sk` |
| `projectName` | Priečinok pod `.a11y-ops-report/<name>/` |
| `ai.enabled` | Zapnúť AI, keď je dostupný API kľúč |

Detailne: [docs/configuration.md](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/configuration.md)

---

## AI (voliteľné)

AI je voliteľné. Crawl, axe-core, screenshoty, HTML report a Markdown úlohy bežia vždy. AI len obohatí názvy, vysvetlenia a návrhy opráv.

```bash
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini          # voliteľné
# export OPENAI_BASE_URL=https://...     # voliteľné (OpenAI-kompatibilné providery)

a11y-ops scan https://example.com
```

| Režim | Správanie |
| --- | --- |
| `--ai-mode auto` (default) | AI beží, keď je nastavený `OPENAI_API_KEY` |
| `--ai-mode on` | AI je povinné (bez kľúča spadne) |
| `--ai-mode off` | AI sa vždy preskočí |

Funguje s OpenAI aj kompatibilnými endpointmi (Azure OpenAI, OpenRouter, LiteLLM, lokálne gatewaye) cez `OPENAI_BASE_URL`.

Detailne: [docs/ai.md](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/ai.md)

---

## Výstup

```text
.a11y-ops-report/<project>/
├── index.html      # Interaktívny HTML dashboard
├── screenshots/    # Zvýraznené PNG ku každému porušeniu
└── tasks/          # Markdown tickety pre Jira / Linear / GitHub
```

`<project>` je predvolene hostname cieľovej URL (prepíšeš cez `--project` alebo `projectName` v configu).

Po skene sa report otvorí v prehliadači a CLI ostane bežať s malým menu (znova otvoriť / otvoriť priečinok / skopírovať cestu / ukončiť).

---

## Prečo A11yOps?

Väčšina nástrojov na prístupnosť skončí pri zozname porušení. Tím si stále musí problémy reprodukovať, vysvetliť dopad a napísať tickety.

A11yOps túto medzeru zatvára — z každého nálezu vznikne úloha pripravená na skopírovanie: selektor, screenshot, WCAG referencia a praktický návrh opravy.

---

## Dokumentácia

- [Konfigurácia](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/configuration.md)
- [CLI](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/cli.md)
- [AI](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/ai.md)
- [Príklady](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/examples.md)
- [FAQ](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/faq.md)
- [Roadmapa](https://github.com/davidkolisek/a11y-agent-ops/blob/master/docs/roadmap.md)

---

## Licencia

MIT
