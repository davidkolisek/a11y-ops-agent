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

## Globálne CLI vs per-project

Dva rôzne workflowy:

| | Globálne CLI (`npm i -g`) | Per-project |
| --- | --- | --- |
| Kedy | Skenuješ URL odkiaľkoľvek | Audituješ jednu appku v jej repo |
| AI kľúč | `~/.a11y-ops/.env` (raz) | to isté, alebo project `.env` |
| Defaulty | `~/.a11y-ops/a11y-ops.config.ts` | voliteľné |
| Nastavenia appky | CLI flagy | `a11y-ops.config.ts` v repo |

Priorita: **CLI flagy > project config > global config > built-in defaulty**.

---

## AI setup (sprav raz)

AI je voliteľné. Bez kľúča stále dostaneš plný audit (skóre, screenshoty, úlohy). S kľúčom sú vysvetlenia a opravy lepšie.

**Odporúčané pri globálnej inštalácii** — vytvor `~/.a11y-ops/.env`:

```bash
mkdir -p ~/.a11y-ops
cat > ~/.a11y-ops/.env << 'EOF'
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1
EOF
```

Potom z ľubovoľného priečinka:

```bash
a11y-ops scan https://example.com
```

Alternatívy:

- export v shelli (`~/.zshrc`): `export OPENAI_API_KEY=sk-...`
- project `.env` v aktuálnom pracovnom adresári

| Režim | Správanie |
| --- | --- |
| `--ai-mode auto` (default) | AI beží, keď je kľúč dostupný |
| `--ai-mode on` | AI je povinné (bez kľúča spadne) |
| `--ai-mode off` | AI sa vždy preskočí |

Funguje s OpenAI aj kompatibilnými endpointmi cez `OPENAI_BASE_URL`.

---

## Konfigurácia

### Globálne defaulty (`~/.a11y-ops/`)

Pre globálne CLI — defaulty pre každý sken:

```bash
# ~/.a11y-ops/a11y-ops.config.ts
export default {
  maxPages: 50,
  wcagLevel: 'AA',
  ai: { enabled: true },
};
```

### Per-project (voliteľné)

Keď `cd`neš do appky a chceš crawl pravidlá len pre ňu, daj do koreňa `a11y-ops.config.ts`:

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

Podporované aj: `.js`, `.mjs`, `.cjs`, `.json`. Alebo `--config ./path/to/config.ts`.

| Option | Popis |
| --- | --- |
| `maxPages` | Max. počet stránok (default `50`) |
| `ignorePaths` | Prefixy ciest, ktoré sa preskočia |
| `includePaths` | Ak je nastavené, crawlí len zhodné cesty |
| `wcagLevel` | `A` \| `AA` \| `AAA` (default `AA`) |
| `locale` | `en` (default) alebo `sk` |
| `projectName` | Priečinok pod `.a11y-ops-report/<name>/` |
| `ai.enabled` | Zapnúť AI, keď je dostupný API kľúč |

---

## Výstup

```text
.a11y-ops-report/<project>/
├── index.html      # Interaktívny HTML dashboard
├── screenshots/    # Zvýraznené PNG ku každému porušeniu
└── tasks/          # Markdown tickety pre Jira / Linear / GitHub
```

Zapisuje sa relatívne k **aktuálnemu pracovnému adresáru**. `<project>` je predvolene hostname.

Po skene sa report otvorí v prehliadači a CLI ostane bežať s malým menu.

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
