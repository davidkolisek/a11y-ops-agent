/**
 * Shared domain types for a11y-ops-agent.
 * Scanning payloads will be expanded as crawler/scanner land.
 */

export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AuditTarget {
  /** Absolute URL to audit */
  url: string;
}

export interface AuditRequest {
  target: AuditTarget;
}

export interface AuditResult {
  target: AuditTarget;
  status: AuditStatus;
  startedAt: string;
  finishedAt?: string;
  message?: string;
}
