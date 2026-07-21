/**
 * Token usage accounting and rough USD cost estimates for OpenAI-compatible chat models.
 *
 * Prices are approximate list prices (USD per 1M tokens). Unknown models report tokens only.
 */

export interface AiTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiCostEstimate {
  /** Estimated USD cost, or null when the model has no known pricing */
  usd: number | null;
  model: string;
  knownPricing: boolean;
}

/** USD per 1 million tokens — approximate public OpenAI list prices */
const MODEL_PRICING_PER_MILLION: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o-mini-2024-07-18': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-2024-08-06': { input: 2.5, output: 10 },
  'gpt-4o-2024-11-20': { input: 2.5, output: 10 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
  'gpt-4.1': { input: 2, output: 8 },
  'gpt-4.1-nano': { input: 0.1, output: 0.4 },
  'o4-mini': { input: 1.1, output: 4.4 },
  'o3-mini': { input: 1.1, output: 4.4 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
};

export function emptyUsage(): AiTokenUsage {
  return { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
}

export function addUsage(a: AiTokenUsage, b: AiTokenUsage): AiTokenUsage {
  return {
    promptTokens: a.promptTokens + b.promptTokens,
    completionTokens: a.completionTokens + b.completionTokens,
    totalTokens: a.totalTokens + b.totalTokens,
  };
}

/**
 * Pull token counts from an OpenAI-compatible chat completion payload.
 */
export function extractUsage(payload: unknown): AiTokenUsage | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const usage = (payload as { usage?: unknown }).usage;
  if (!usage || typeof usage !== 'object' || Array.isArray(usage)) {
    return null;
  }

  const record = usage as Record<string, unknown>;
  const promptTokens = toNonNegativeInt(record['prompt_tokens'] ?? record['input_tokens']);
  const completionTokens = toNonNegativeInt(
    record['completion_tokens'] ?? record['output_tokens'],
  );

  if (promptTokens === null && completionTokens === null) {
    return null;
  }

  const prompt = promptTokens ?? 0;
  const completion = completionTokens ?? 0;
  const totalReported = toNonNegativeInt(record['total_tokens']);
  const total = totalReported ?? prompt + completion;

  return {
    promptTokens: prompt,
    completionTokens: completion,
    totalTokens: total,
  };
}

export function estimateCost(usage: AiTokenUsage, model: string): AiCostEstimate {
  const pricing = lookupPricing(model);
  if (!pricing) {
    return { usd: null, model, knownPricing: false };
  }

  const usd =
    (usage.promptTokens / 1_000_000) * pricing.input +
    (usage.completionTokens / 1_000_000) * pricing.output;

  return { usd, model, knownPricing: true };
}

export function formatAiUsageLine(usage: AiTokenUsage, model: string): string {
  const cost = estimateCost(usage, model);
  const tokens = `Tokens: ${formatInt(usage.totalTokens)} (prompt ${formatInt(usage.promptTokens)} + completion ${formatInt(usage.completionTokens)})`;

  if (cost.usd === null) {
    return `${tokens} · Est. cost: n/a (no pricing for ${model})`;
  }

  return `${tokens} · Est. cost: ${formatUsd(cost.usd)} (${model})`;
}

function lookupPricing(model: string): { input: number; output: number } | null {
  const normalized = model.trim().toLowerCase();
  if (MODEL_PRICING_PER_MILLION[normalized]) {
    return MODEL_PRICING_PER_MILLION[normalized] ?? null;
  }

  // Match versioned / fine-tuned style names: gpt-4o-mini-2024-07-18 → gpt-4o-mini
  const keys = Object.keys(MODEL_PRICING_PER_MILLION).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (normalized === key || normalized.startsWith(`${key}-`)) {
      return MODEL_PRICING_PER_MILLION[key] ?? null;
    }
  }

  return null;
}

function toNonNegativeInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.round(value);
}

function formatInt(value: number): string {
  return value.toLocaleString('en-US');
}

function formatUsd(value: number): string {
  if (value === 0) {
    return '$0.00';
  }
  if (value < 0.0001) {
    return `$${value.toFixed(6)}`;
  }
  if (value < 0.01) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toFixed(2)}`;
}
