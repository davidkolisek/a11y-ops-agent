import type { Locale } from './locale.js';

/**
 * Input for AI analysis of a single accessibility violation.
 */
export interface ViolationAnalysisInput {
  rule: string;
  description: string;
  html: string;
  selector: string;
  screenshotPath: string | null;
  url: string;
}

/**
 * Structured AI remediation advice for developers.
 */
export interface ViolationAnalysis {
  title: string;
  summary: string;
  developerExplanation: string;
  suggestedFix: string;
  uxImpact: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: string;
}

export interface AnalyzedViolation {
  /** Correlates with screenshot ids when available (e.g. A11Y-001) */
  violationId?: string;
  input: ViolationAnalysisInput;
  analysis: ViolationAnalysis;
}

export interface AnalyzeViolationOptions {
  locale?: Locale;
}

export interface AiTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
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

export interface ViolationAnalysisJob {
  violationId: string;
  input: ViolationAnalysisInput;
}
