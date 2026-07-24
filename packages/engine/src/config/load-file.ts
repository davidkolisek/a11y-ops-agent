import { access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createJiti } from 'jiti';

import { loadEnvFiles } from './load-env.js';
import { getGlobalConfigDir } from './paths.js';
import {
  AiConfigSchema,
  UserConfigSchema,
  type UserConfig,
} from './schema.js';

export const CONFIG_FILENAMES = [
  'a11y-ops.config.ts',
  'a11y-ops.config.mts',
  'a11y-ops.config.js',
  'a11y-ops.config.mjs',
  'a11y-ops.config.cjs',
  'a11y-ops.config.json',
] as const;

/** Partial schema so file layers only override keys the user actually set. */
const UserConfigPartialSchema = UserConfigSchema.partial().extend({
  ai: AiConfigSchema.partial().optional(),
});

export interface LoadedProjectConfig {
  /** Absolute path preferred for display (project config, else global). */
  path: string | null;
  /** Global config file under `~/.a11y-ops/`, if any. */
  globalPath: string | null;
  /** Project config file in cwd (or explicit --config), if any. */
  projectPath: string | null;
  /** Merged config: defaults ← global ← project */
  config: UserConfig;
}

/**
 * Load env files + config layers.
 *
 * Config precedence: defaults ← `~/.a11y-ops/a11y-ops.config.*` ← cwd config ← CLI
 * Env: shell wins; then cwd `.env` overlays `~/.a11y-ops/.env` for unset keys.
 */
export async function loadProjectConfig(
  options: {
    cwd?: string;
    configPath?: string;
  } = {},
): Promise<LoadedProjectConfig> {
  const cwd = options.cwd ?? process.cwd();

  await loadEnvFiles({ cwd });

  const globalPath = await findConfigFile(getGlobalConfigDir());
  const projectPath = options.configPath
    ? path.resolve(cwd, options.configPath)
    : await findConfigFile(cwd);

  const globalPartial = globalPath ? await loadPartialConfig(globalPath) : {};
  const projectPartial = projectPath ? await loadPartialConfig(projectPath) : {};

  const config = UserConfigSchema.parse({
    ...globalPartial,
    ...projectPartial,
    ai: {
      ...(globalPartial.ai ?? {}),
      ...(projectPartial.ai ?? {}),
    },
  });

  return {
    path: projectPath ?? globalPath,
    globalPath,
    projectPath,
    config,
  };
}

export async function findConfigFile(dir: string): Promise<string | null> {
  for (const name of CONFIG_FILENAMES) {
    const candidate = path.join(dir, name);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  return null;
}

async function loadPartialConfig(resolvedPath: string): Promise<Partial<UserConfig>> {
  const raw = await importConfigModule(resolvedPath);
  const parsed = UserConfigPartialSchema.safeParse(normalizeConfigExport(raw));

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid config in ${resolvedPath}: ${details}`);
  }

  return parsed.data as Partial<UserConfig>;
}

async function importConfigModule(filePath: string): Promise<unknown> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    const module = await import(pathToFileURL(filePath).href, {
      with: { type: 'json' },
    });
    return (module as { default?: unknown }).default ?? module;
  }

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
