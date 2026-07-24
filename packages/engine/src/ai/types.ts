import { z } from 'zod';

import type { Locale } from '../i18n/index.js';
import type { AiTokenUsage } from './usage.js';

/**
 * Input for AI analysis of a single accessibility violation.
 */
export const ViolationAnalysisInputSchema = z.object({
  rule: z.string().min(1),
  description: z.string().min(1),
  html: z.string(),
  selector: z.string(),
  screenshotPath: z.string().nullable(),
  url: z.string().url(),
});

export type ViolationAnalysisInput = z.infer<typeof ViolationAnalysisInputSchema>;

/**
 * Structured AI remediation advice for developers.
 */
export const ViolationAnalysisSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  developerExplanation: z.string().min(1),
  suggestedFix: z.string().min(1),
  uxImpact: z.string().min(1),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  estimatedEffort: z.string().min(1),
});

export type ViolationAnalysis = z.infer<typeof ViolationAnalysisSchema>;

export interface AnalyzedViolation {
  /** Correlates with screenshot ids when available (e.g. A11Y-001) */
  violationId?: string;
  input: ViolationAnalysisInput;
  analysis: ViolationAnalysis;
}

export interface AnalyzeViolationOptions {
  locale?: Locale;
}

export interface AnalyzeViolationResult {
  analysis: ViolationAnalysis;
  usage: AiTokenUsage | null;
}

export interface AnalyzeViolationsOptions {
  locale?: Locale;
  onAnalyzed?: (item: AnalyzedViolation, index: number, total: number) => void;
  onError?: (input: ViolationAnalysisInput, error: Error, index: number) => void;
}

export class AiError extends Error {
  readonly code: string;

  constructor(message: string, code: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'AiError';
    this.code = code;
  }
}
