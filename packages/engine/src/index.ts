/**
 * @a11y-agent-ops/engine — accessibility scanning business logic.
 *
 * Public API:
 *   scan(options): Promise<AccessibilityReport>
 */

export { scan, runAccessibilityAudit } from './scan.js';

export type {
  ScanOptions,
  AccessibilityReport,
  ScanProgressEvent,
  AiMode,
  WcagLevel,
  Locale,
  TaskIssue,
  AnalyzedViolation,
  UserConfig,
  AppConfig,
} from '@a11y-agent-ops/shared';

export { isWcagLevel, scanPages } from './scanner/index.js';
export { crawlSite } from './crawler/index.js';
export {
  DEFAULT_CONFIG,
  DEFAULT_REPORT_ROOT,
  loadProjectConfig,
  mergeConfig,
  loadConfig,
  getGlobalConfigDir,
  GLOBAL_CONFIG_DIRNAME,
} from './config/index.js';
export { parseTargetUrl, projectSlugFromUrl, slugifyProjectName } from './utils/index.js';
