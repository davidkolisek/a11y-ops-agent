import { z } from 'zod';

import { DEFAULT_LOCALE, LOCALES } from '../i18n/index.js';

export const DEFAULT_REPORT_ROOT = '.a11y-ops-report';

/**
 * Project configuration schema (a11y-ops.config.ts and runtime AppConfig).
 */
export const AiConfigSchema = z.object({
  /** When false, AI analysis is skipped. When true, runs if OPENAI_API_KEY is set. */
  enabled: z.boolean().default(true),
});

export const UserConfigSchema = z.object({
  maxPages: z.number().int().positive().default(50),
  ignorePaths: z.array(z.string().min(1)).default([]),
  includePaths: z.array(z.string().min(1)).default([]),
  ai: AiConfigSchema.default({ enabled: true }),
  wcagLevel: z.enum(['A', 'AA', 'AAA']).default('AA'),
  /** Report / task / AI output language. Default English; use `sk` for Slovak. */
  locale: z.enum(LOCALES).default(DEFAULT_LOCALE),
  /**
   * Optional project folder name under `.a11y-ops-report/<project>/`.
   * When omitted, derived from the target URL hostname.
   */
  projectName: z.string().min(1).optional(),
  timeoutMs: z.number().int().positive().default(30_000),
  reportsDir: z.string().min(1).default(DEFAULT_REPORT_ROOT),
  screenshotsDir: z.string().min(1).default(`${DEFAULT_REPORT_ROOT}/screenshots`),
  tasksDir: z.string().min(1).default(`${DEFAULT_REPORT_ROOT}/tasks`),
});

export type UserConfig = z.infer<typeof UserConfigSchema>;
export type AppConfig = UserConfig;
export type AiConfig = z.infer<typeof AiConfigSchema>;

export const DEFAULT_CONFIG: AppConfig = UserConfigSchema.parse({});

/** @deprecated use UserConfigSchema */
export const AppConfigSchema = UserConfigSchema;

/**
 * Merge defaults with explicit overrides (CLI / programmatic).
 */
export function loadConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return UserConfigSchema.parse({
    ...DEFAULT_CONFIG,
    ...overrides,
    ai: {
      ...DEFAULT_CONFIG.ai,
      ...(overrides.ai ?? {}),
    },
  });
}

/**
 * Resolve final config: defaults ← base (file/global) ← overrides (project/CLI).
 * Only keys present in `cliOverrides` replace previous values when used for CLI;
 * for full layer merges, pass complete partial objects.
 */
export function mergeConfig(
  fileConfig: Partial<UserConfig> | undefined,
  cliOverrides: Partial<AppConfig> = {},
): AppConfig {
  const fromFile = fileConfig ? UserConfigSchema.parse(fileConfig) : DEFAULT_CONFIG;

  return UserConfigSchema.parse({
    ...fromFile,
    ...cliOverrides,
    ai: {
      ...fromFile.ai,
      ...(cliOverrides.ai ?? {}),
    },
  });
}
