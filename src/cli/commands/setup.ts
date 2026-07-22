import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Command } from 'commander';

import { getGlobalConfigDir } from '../../config/paths.js';
import { blank, log, ok } from '../logger.js';
import { openDirectory } from '../open-path.js';

const ENV_EXAMPLE = `# OpenAI-compatible provider (optional — scans work without AI)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Optional: Azure OpenAI, OpenRouter, LiteLLM, local gateways, …
# OPENAI_BASE_URL=https://api.openai.com/v1
`;

const CONFIG_EXAMPLE = `/**
 * Global defaults for a11y-ops (applies to every scan).
 * Project-level a11y-ops.config.ts in a repo overrides these.
 */
export default {
  maxPages: 50,
  wcagLevel: 'AA', // 'A' | 'AA' | 'AAA'
  // locale: 'en', // or 'sk'
  ai: {
    enabled: true,
  },
};
`;

export function createSetupCommand(): Command {
  return new Command('setup')
    .description('Create ~/.a11y-ops for global config + AI key, then open the folder')
    .option('--no-open', 'Create files but do not open the folder')
    .action(async (options: { open?: boolean }) => {
      await runSetup({ openFolder: options.open !== false });
    });
}

export async function runSetup(options: { openFolder: boolean }): Promise<void> {
  const dir = getGlobalConfigDir();
  await mkdir(dir, { recursive: true });

  const envPath = path.join(dir, '.env');
  const envExamplePath = path.join(dir, '.env.example');
  const configPath = path.join(dir, 'a11y-ops.config.ts');

  const created: string[] = [];

  if (!(await exists(envPath))) {
    await writeFile(envPath, ENV_EXAMPLE, 'utf8');
    created.push('.env');
  }

  if (!(await exists(envExamplePath))) {
    await writeFile(envExamplePath, ENV_EXAMPLE, 'utf8');
    created.push('.env.example');
  }

  if (!(await exists(configPath))) {
    await writeFile(configPath, CONFIG_EXAMPLE, 'utf8');
    created.push('a11y-ops.config.ts');
  }

  blank();
  ok('Global config folder ready');
  blank();
  log(`Folder:  ${dir}`);
  log(`CLI:     ${resolveCliPath()}`);
  if (created.length > 0) {
    log(`Created: ${created.join(', ')}`);
  } else {
    log('Created: (already set up — existing files left untouched)');
  }
  blank();
  log('Next steps:');
  log('  1. Edit .env → set OPENAI_API_KEY=sk-...  (optional)');
  log('  2. Tweak a11y-ops.config.ts defaults      (optional)');
  log('  3. Run:  a11y-ops scan https://example.com');
  blank();
  log('Tip: npx playwright install chromium   # once, if Chromium is missing');
  blank();

  if (options.openFolder) {
    try {
      await openDirectory(dir);
      ok('Opened config folder in your file manager');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`✗ Could not open folder: ${message}`);
      log(`  Open it manually: ${dir}`);
    }
    blank();
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveCliPath(): string {
  const argv1 = process.argv[1];
  if (argv1) {
    try {
      return path.resolve(argv1);
    } catch {
      // fall through
    }
  }
  return fileURLToPath(import.meta.url);
}
