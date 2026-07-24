import { z } from 'zod';

/**
 * OpenAI-compatible provider settings from environment variables.
 *
 * Required:
 * - OPENAI_API_KEY
 *
 * Optional:
 * - OPENAI_MODEL (default: gpt-4o-mini)
 * - OPENAI_BASE_URL (default: https://api.openai.com/v1)
 */
export const OpenAiEnvConfigSchema = z.object({
  apiKey: z.string().min(1, 'OPENAI_API_KEY is required'),
  model: z.string().min(1).default('gpt-4o-mini'),
  baseUrl: z.string().url().default('https://api.openai.com/v1'),
});

export type OpenAiEnvConfig = z.infer<typeof OpenAiEnvConfigSchema>;

export function loadOpenAiConfig(
  env: NodeJS.ProcessEnv = process.env,
): OpenAiEnvConfig {
  const apiKey = env['OPENAI_API_KEY']?.trim();
  const model = env['OPENAI_MODEL']?.trim();
  const baseUrl = env['OPENAI_BASE_URL']?.trim();

  const parsed = OpenAiEnvConfigSchema.safeParse({
    apiKey: apiKey || undefined,
    ...(model ? { model } : {}),
    ...(baseUrl ? { baseUrl } : {}),
  });

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(
      `Invalid OpenAI configuration: ${details}. Set OPENAI_API_KEY (and optionally OPENAI_MODEL, OPENAI_BASE_URL).`,
    );
  }

  return parsed.data;
}

export function isAiConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env['OPENAI_API_KEY']?.trim());
}
