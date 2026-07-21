import { access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createJiti } from 'jiti';

import { UserConfigSchema, type UserConfig } from './schema.js';

export const CONFIG_FILENAMES = [
  'a11y-ops.config.ts',
  'a11y-ops.config.mts',
  'a11y-ops.config.js',
  'a11y-ops.config.mjs',
  'a11y-ops.config.cjs',
  'a11y-ops.config.json',
] as const;

export interface LoadedProjectConfig {
  /** Absolute path to the config file, or null when none was found */
  path: string | null;
  config: UserConfig;
}

/**
 * Load `a11y-ops.config.*` from `cwd` (or an explicit path).
 * Missing file is OK — returns defaults.
 */
export async function loadProjectConfig(
  options: {
    cwd?: string;
    configPath?: string;
  } = {},
): Promise<LoadedProjectConfig> {
  const cwd = options.cwd ?? process.cwd();
  const resolvedPath = options.configPath
    ? path.resolve(cwd, options.configPath)
    : await findConfigFile(cwd);

  if (!resolvedPath) {
    return {
      path: null,
      config: UserConfigSchema.parse({}),
    };
  }

  const raw = await importConfigModule(resolvedPath);
  const parsed = UserConfigSchema.safeParse(normalizeConfigExport(raw));

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid config in ${resolvedPath}: ${details}`);
  }

  return {
    path: resolvedPath,
    config: parsed.data,
  };
}

export async function findConfigFile(cwd: string): Promise<string | null> {
  for (const name of CONFIG_FILENAMES) {
    const candidate = path.join(cwd, name);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  return null;
}

async function importConfigModule(filePath: string): Promise<unknown> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    const module = await import(pathToFileURL(filePath).href, {
      with: { type: 'json' },
    });
    return (module as { default?: unknown }).default ?? module;
  }

  // TS / ESM / CJS via jiti (supports a11y-ops.config.ts out of the box)
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
  });

  return jiti(filePath);
}

function normalizeConfigExport(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  const record = raw as Record<string, unknown>;
  if ('default' in record) {
    return record['default'];
  }

  return raw;
}
