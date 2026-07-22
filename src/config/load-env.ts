import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getGlobalConfigDir } from './paths.js';

/**
 * Load env files for AI keys and related settings.
 *
 * Precedence (highest wins):
 * 1. Already-set process.env (shell / CI)
 * 2. `<cwd>/.env` (per-project)
 * 3. `~/.a11y-ops/.env` (global CLI)
 *
 * Missing files are ignored.
 */
export async function loadEnvFiles(
  options: {
    cwd?: string;
    homeDir?: string;
    env?: NodeJS.ProcessEnv;
  } = {},
): Promise<{ loaded: string[] }> {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? process.env;
  const globalDir = getGlobalConfigDir(options.homeDir);

  const candidates = [path.join(globalDir, '.env'), path.join(cwd, '.env')];
  const loaded: string[] = [];
  const fileValues: Record<string, string> = {};

  for (const filePath of candidates) {
    const parsed = await readEnvFile(filePath);
    if (!parsed) {
      continue;
    }
    loaded.push(filePath);
    Object.assign(fileValues, parsed);
  }

  for (const [key, value] of Object.entries(fileValues)) {
    if (env[key] === undefined || env[key] === '') {
      env[key] = value;
    }
  }

  return { loaded };
}

async function readEnvFile(filePath: string): Promise<Record<string, string> | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return parseEnv(raw);
  } catch {
    return null;
  }
}

/** Minimal `.env` parser (KEY=VALUE, ignores comments / blank lines). */
export function parseEnv(raw: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const exportPrefix = trimmed.startsWith('export ')
      ? trimmed.slice('export '.length).trim()
      : trimmed;

    const eq = exportPrefix.indexOf('=');
    if (eq <= 0) {
      continue;
    }

    const key = exportPrefix.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    let value = exportPrefix.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}
