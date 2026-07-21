import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import { DEFAULT_LOCALE, getAiStrings, type Locale } from '../i18n/index.js';
import { loadOpenAiConfig, type OpenAiEnvConfig } from './config.js';
import {
  AiError,
  ViolationAnalysisInputSchema,
  ViolationAnalysisSchema,
  type AnalyzedViolation,
  type AnalyzeViolationOptions,
  type AnalyzeViolationResult,
  type AnalyzeViolationsOptions,
  type ViolationAnalysis,
  type ViolationAnalysisInput,
} from './types.js';
import { extractUsage } from './usage.js';

const SYSTEM_PROMPT_BASE = `You are a senior frontend accessibility engineer.

Your job is to analyze accessibility violations and produce practical guidance that frontend developers can apply immediately.

Rules:
- Be specific to the given HTML, selector, and page context.
- Explain the real user impact (screen readers, keyboard, cognitive load, etc.).
- Give concrete remediation steps (attributes, markup, or component changes).
- Prefer actionable language over vague compliance statements.
- Do NOT write low-value phrases like "This violates WCAG." or "Fix accessibility issues."
- Good example: "The button contains only an icon. Screen readers cannot understand its purpose. Add aria-label or visible text."
- Return ONLY valid JSON matching the requested schema. No markdown fences.`;

const RESPONSE_SCHEMA_HINT = `{
  "title": "short issue title",
  "summary": "1-2 sentence practical summary",
  "developerExplanation": "clear explanation for a frontend developer",
  "suggestedFix": "concrete fix with example markup or attributes when helpful",
  "uxImpact": "who is affected and how",
  "priority": "critical | high | medium | low",
  "estimatedEffort": "rough effort, e.g. 5 minutes, 30-60 minutes, half day"
}`;

/**
 * Analyze a single accessibility violation via an OpenAI-compatible chat API.
 * Response JSON is validated with Zod.
 */
export async function analyzeViolation(
  rawInput: ViolationAnalysisInput,
  config: OpenAiEnvConfig = loadOpenAiConfig(),
  options: AnalyzeViolationOptions = {},
): Promise<AnalyzeViolationResult> {
  const locale = options.locale ?? DEFAULT_LOCALE;
  const input = ViolationAnalysisInputSchema.parse(rawInput);
  const userContent = await buildUserContent(input, locale);
  const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\n${getAiStrings(locale).languageInstruction}`;

  const payload = {
    model: config.model,
    temperature: 0.2,
    response_format: { type: 'json_object' as const },
    messages: [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userContent },
    ],
  };

  const response = await fetch(`${trimTrailingSlash(config.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new AiError(
      `OpenAI-compatible API request failed (${String(response.status)}): ${body.slice(0, 500)}`,
      'API_REQUEST_FAILED',
    );
  }

  const json: unknown = await response.json();
  const content = extractAssistantContent(json);
  return {
    analysis: parseAnalysisJson(content),
    usage: extractUsage(json),
  };
}

/**
 * Analyze many violations sequentially (keeps provider rate limits predictable).
 */
export async function analyzeViolations(
  inputs: ViolationAnalysisInput[],
  options: AnalyzeViolationsOptions = {},
  config: OpenAiEnvConfig = loadOpenAiConfig(),
): Promise<AnalyzedViolation[]> {
  const results: AnalyzedViolation[] = [];
  const locale = options.locale ?? DEFAULT_LOCALE;

  for (let index = 0; index < inputs.length; index += 1) {
    const input = inputs[index];
    if (!input) {
      continue;
    }

    try {
      const { analysis } = await analyzeViolation(input, config, { locale });
      const item: AnalyzedViolation = { input, analysis };
      results.push(item);
      options.onAnalyzed?.(item, index + 1, inputs.length);
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      options.onError?.(input, normalized, index + 1);
    }
  }

  return results;
}

type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

async function buildUserContent(
  input: ViolationAnalysisInput,
  locale: Locale,
): Promise<string | ChatContentPart[]> {
  const aiStrings = getAiStrings(locale);
  const text = [
    aiStrings.analyzeInstruction,
    '',
    `Required JSON shape:\n${RESPONSE_SCHEMA_HINT}`,
    '',
    `URL: ${input.url}`,
    `Rule: ${input.rule}`,
    `Description: ${input.description}`,
    `Selector: ${input.selector}`,
    `Screenshot path: ${input.screenshotPath ?? '(none)'}`,
    '',
    'Affected HTML:',
    input.html || '(empty)',
  ].join('\n');

  const imageDataUrl = await maybeReadScreenshotDataUrl(input.screenshotPath);
  if (!imageDataUrl) {
    return text;
  }

  return [
    { type: 'text', text },
    { type: 'image_url', image_url: { url: imageDataUrl } },
  ];
}

async function maybeReadScreenshotDataUrl(
  screenshotPath: string | null,
): Promise<string | null> {
  if (!screenshotPath) {
    return null;
  }

  try {
    const absolute = path.resolve(screenshotPath);
    const bytes = await readFile(absolute);
    const ext = path.extname(absolute).toLowerCase();
    const mime =
      ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
          ? 'image/webp'
          : 'image/png';
    return `data:${mime};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

function extractAssistantContent(payload: unknown): string {
  const schema = z.object({
    choices: z
      .array(
        z.object({
          message: z.object({
            content: z.union([z.string(), z.null()]).optional(),
          }),
        }),
      )
      .min(1),
  });

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new AiError('Unexpected API response shape (missing choices/message).', 'INVALID_API_RESPONSE');
  }

  const content = parsed.data.choices[0]?.message.content;
  if (!content || content.trim().length === 0) {
    throw new AiError('API returned an empty analysis response.', 'EMPTY_API_RESPONSE');
  }

  return content;
}

function parseAnalysisJson(content: string): ViolationAnalysis {
  const cleaned = stripMarkdownFences(content.trim());

  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch (cause) {
    throw new AiError('AI response was not valid JSON.', 'INVALID_JSON', cause);
  }

  const parsed = ViolationAnalysisSchema.safeParse(normalizePriority(json));
  if (!parsed.success) {
    throw new AiError(
      `AI response failed Zod validation: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
      'INVALID_ANALYSIS_SHAPE',
    );
  }

  return parsed.data;
}

function normalizePriority(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  const record = { ...(value as Record<string, unknown>) };
  if (typeof record['priority'] === 'string') {
    record['priority'] = record['priority'].trim().toLowerCase();
  }

  return record;
}

function stripMarkdownFences(text: string): string {
  const match = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(text);
  return match?.[1] ?? text;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
