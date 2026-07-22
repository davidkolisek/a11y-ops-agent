import path from 'node:path';

import {
  AiError,
  analyzeViolation,
  buildAnalysisJobs,
  emptyUsage,
  addUsage,
  formatAiUsageLine,
  isAiConfigured,
  loadOpenAiConfig,
  type AnalyzedViolation,
  type AiTokenUsage,
  type ViolationAnalysisJob,
} from '../ai/index.js';
import { CrawlError, crawlSite } from '../crawler/index.js';
import {
  DEFAULT_CONFIG,
  DEFAULT_REPORT_ROOT,
  loadProjectConfig,
  mergeConfig,
  type AppConfig,
} from '../config/index.js';
import {
  buildTaskIssues,
  generateHtmlReport,
  generateTasks,
  ReportError,
} from '../reports/index.js';
import { ScanError, scanPages, type WcagLevel } from '../scanner/index.js';
import {
  captureViolationScreenshots,
  ScreenshotError,
  type ViolationScreenshotResult,
} from '../screenshots/index.js';
import type { Locale } from '../i18n/index.js';
import {
  parseTargetUrl,
  projectSlugFromUrl,
  slugifyProjectName,
} from '../utils/index.js';
import { blank, log, ok, skip } from './logger.js';

export interface AuditOptions {
  url: string;
  /** Explicit CLI overrides — only set keys the user passed */
  cliOverrides?: {
    maxPages?: number;
    wcagLevel?: WcagLevel;
    aiMode?: 'auto' | 'on' | 'off';
    locale?: Locale;
    projectName?: string;
  };
  /** Optional explicit config file path */
  configPath?: string;
  verbose?: boolean;
}

export interface AuditResult {
  targetUrl: string;
  pagesFound: number;
  issuesFound: number;
  reportPath: string;
  tasksDir: string;
  projectSlug: string;
  aiRan: boolean;
  configPath: string | null;
}

/**
 * Full production audit pipeline:
 * validate → load config → crawl → axe scan → screenshots → AI → tasks → HTML report
 */
export async function runAccessibilityAudit(options: AuditOptions): Promise<AuditResult> {
  const targetUrl = parseTargetUrl(options.url);
  const loaded = await loadProjectConfig({
    ...(options.configPath ? { configPath: options.configPath } : {}),
  });

  const cli = options.cliOverrides ?? {};
  const aiFromCli =
    cli.aiMode === 'off'
      ? { enabled: false }
      : cli.aiMode === 'on' || cli.aiMode === 'auto'
        ? { enabled: true }
        : undefined;

  let config = mergeConfig(loaded.config, {
    ...(cli.maxPages !== undefined ? { maxPages: cli.maxPages } : {}),
    ...(cli.wcagLevel !== undefined ? { wcagLevel: cli.wcagLevel } : {}),
    ...(cli.locale !== undefined ? { locale: cli.locale } : {}),
    ...(cli.projectName !== undefined ? { projectName: cli.projectName } : {}),
    ...(aiFromCli ? { ai: aiFromCli } : {}),
  });

  const projectSlug = resolveProjectSlug(targetUrl, cli.projectName, config.projectName);
  config = applyPerProjectOutputDirs(config, projectSlug);

  const aiMode = resolveEffectiveAiMode(cli.aiMode, config);
  const verbose = options.verbose === true;

  log('Starting accessibility audit...');
  if (loaded.path) {
    log(`Config: ${toDisplayPath(loaded.path)}`);
  }
  log(`Project: ${projectSlug}`);
  if (config.locale === 'sk') {
    log('Language: Slovak (--sk)');
  }
  blank();

  try {
    const crawlResult = await stepCrawl(targetUrl, config, verbose);

    if (crawlResult.pages.length === 0) {
      throw new CrawlError('No pages were discovered to scan.', 'NO_PAGES');
    }

    const scanResult = await stepScan(crawlResult.pages, config, verbose);
    const issuesFound = scanResult.totalViolations;

    blank();
    log('Issues found:');
    log(String(issuesFound));
    blank();

    const screenshots = await stepScreenshots(scanResult.results, issuesFound, config, verbose);
    const analyzed = await stepAi(
      scanResult.results,
      screenshots,
      issuesFound,
      aiMode,
      config.locale,
      verbose,
    );

    const issues = buildTaskIssues(scanResult.results, screenshots, analyzed, config.locale);
    await stepTasks(issues, config, verbose);
    const reportPath = await stepHtmlReport(
      issues,
      analyzed,
      targetUrl,
      scanResult.results.length,
      config,
    );

    return {
      targetUrl,
      pagesFound: crawlResult.pages.length,
      issuesFound,
      reportPath: path.resolve(reportPath),
      tasksDir: path.resolve(config.tasksDir),
      projectSlug,
      aiRan: aiMode !== 'off' && isAiConfigured() && issuesFound > 0,
      configPath: loaded.path,
    };
  } catch (error) {
    rethrowAsCliError(error);
  }
}

function resolveProjectSlug(
  targetUrl: string,
  cliProjectName: string | undefined,
  configProjectName: string | undefined,
): string {
  const raw = cliProjectName ?? configProjectName;
  if (raw) {
    return slugifyProjectName(raw);
  }
  return projectSlugFromUrl(targetUrl);
}

/**
 * Nest default output dirs under `.a11y-ops-report/<project>/`.
 * Explicit custom reportsDir / screenshotsDir / tasksDir in config are left unchanged.
 */
function applyPerProjectOutputDirs(config: AppConfig, projectSlug: string): AppConfig {
  const usingDefaultLayout =
    config.reportsDir === DEFAULT_CONFIG.reportsDir &&
    config.screenshotsDir === DEFAULT_CONFIG.screenshotsDir &&
    config.tasksDir === DEFAULT_CONFIG.tasksDir;

  if (!usingDefaultLayout) {
    return config;
  }

  const reportsDir = path.join(DEFAULT_REPORT_ROOT, projectSlug);
  return {
    ...config,
    reportsDir,
    screenshotsDir: path.join(reportsDir, 'screenshots'),
    tasksDir: path.join(reportsDir, 'tasks'),
  };
}

function resolveEffectiveAiMode(
  cliMode: 'auto' | 'on' | 'off' | undefined,
  config: AppConfig,
): 'auto' | 'on' | 'off' {
  if (cliMode) {
    return cliMode;
  }
  return config.ai.enabled ? 'auto' : 'off';
}

interface AiDecision {
  enabled: boolean;
  requireKey: boolean;
  skippedReason?: string;
}

function resolveAiMode(mode: 'auto' | 'on' | 'off'): AiDecision {
  if (mode === 'off') {
    return { enabled: false, requireKey: false, skippedReason: 'AI analysis skipped' };
  }
  if (mode === 'on') {
    return { enabled: true, requireKey: true };
  }
  if (!isAiConfigured()) {
    return {
      enabled: false,
      requireKey: false,
      skippedReason: 'AI analysis skipped (OPENAI_API_KEY not set)',
    };
  }
  return { enabled: true, requireKey: false };
}

async function stepCrawl(targetUrl: string, config: AppConfig, verbose: boolean) {
  ok('Crawling pages');

  const crawlResult = await crawlSite({
    startUrl: targetUrl,
    maxPages: config.maxPages,
    timeoutMs: config.timeoutMs,
    includePaths: config.includePaths,
    ignorePaths: config.ignorePaths,
    ...(verbose
      ? {
          onPageCrawled: (page: { url: string; title: string }, index: number) => {
            log(`  [${String(index)}] ${page.url} — ${page.title || '(no title)'}`);
          },
          onPageError: (failedUrl: string, error: Error) => {
            skip(`${failedUrl}: ${error.message}`);
          },
        }
      : {}),
  });

  ok(`Found ${String(crawlResult.pages.length)} pages`);
  blank();

  return crawlResult;
}

async function stepScan(
  pages: Array<{ url: string }>,
  config: AppConfig,
  verbose: boolean,
) {
  ok('Running accessibility checks');

  return scanPages({
    pages,
    wcagLevel: config.wcagLevel,
    timeoutMs: config.timeoutMs,
    ...(verbose
      ? {
          onPageScanned: (
            result: { url: string; violations: unknown[] },
            index: number,
            total: number,
          ) => {
            log(
              `  [${String(index)}/${String(total)}] ${result.url} — ${String(result.violations.length)} violation(s)`,
            );
          },
          onPageError: (failedUrl: string, error: Error) => {
            skip(`${failedUrl}: ${error.message}`);
          },
        }
      : {}),
  });
}

async function stepScreenshots(
  results: Parameters<typeof captureViolationScreenshots>[0],
  issuesFound: number,
  config: AppConfig,
  verbose: boolean,
): Promise<ViolationScreenshotResult[]> {
  if (issuesFound === 0) {
    ok('Generating screenshots');
    return [];
  }

  const screenshots = await captureViolationScreenshots(results, {
    outputDir: config.screenshotsDir,
    timeoutMs: config.timeoutMs,
    ...(verbose
      ? {
          onScreenshot: (
            result: ViolationScreenshotResult,
            index: number,
            total: number,
          ) => {
            if (result.path) {
              log(`  [${String(index)}/${String(total)}] ${result.violationId}`);
            } else {
              skip(
                `${result.violationId}: ${result.skippedReason ?? 'selector unavailable'}`,
              );
            }
          },
        }
      : {}),
  });

  ok('Generating screenshots');
  return screenshots;
}

async function stepAi(
  scanResults: Parameters<typeof buildAnalysisJobs>[0],
  screenshots: ViolationScreenshotResult[],
  issuesFound: number,
  mode: 'auto' | 'on' | 'off',
  locale: Locale,
  verbose: boolean,
): Promise<AnalyzedViolation[]> {
  const decision = resolveAiMode(mode);

  if (!decision.enabled) {
    skip(decision.skippedReason ?? 'AI analysis skipped');
    return [];
  }

  if (issuesFound === 0) {
    ok('AI analysis completed');
    return [];
  }

  if (!isAiConfigured()) {
    if (decision.requireKey) {
      throw new AiError(
        'OPENAI_API_KEY is not set. Export OPENAI_API_KEY (and optionally OPENAI_MODEL).',
        'MISSING_API_KEY',
      );
    }
    skip('AI analysis skipped (OPENAI_API_KEY not set)');
    return [];
  }

  const openAiConfig = loadOpenAiConfig();
  const jobs = buildAnalysisJobs(scanResults, screenshots);
  const analyzed: AnalyzedViolation[] = [];
  let usageTotal: AiTokenUsage = emptyUsage();
  let usageReported = false;

  for (let index = 0; index < jobs.length; index += 1) {
    const job = jobs[index] as ViolationAnalysisJob;

    try {
      const { analysis, usage } = await analyzeViolation(job.input, openAiConfig, { locale });
      analyzed.push({
        violationId: job.violationId,
        input: job.input,
        analysis,
      });

      if (usage) {
        usageTotal = addUsage(usageTotal, usage);
        usageReported = true;
      }

      if (verbose) {
        log(
          `  [${String(index + 1)}/${String(jobs.length)}] ${job.violationId} [${analysis.priority}] ${analysis.title}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (verbose) {
        skip(`${job.violationId}: ${message}`);
      }
    }
  }

  ok('AI analysis completed');
  if (usageReported && usageTotal.totalTokens > 0) {
    log(`  ${formatAiUsageLine(usageTotal, openAiConfig.model)}`);
  }
  return analyzed;
}

async function stepTasks(
  issues: ReturnType<typeof buildTaskIssues>,
  config: AppConfig,
  verbose: boolean,
): Promise<void> {
  if (issues.length === 0) {
    ok('Tasks generated');
    return;
  }

  await generateTasks(issues, {
    outputDir: config.tasksDir,
    locale: config.locale,
    ...(verbose
      ? {
          onTaskWritten: (
            filePath: string,
            issue: { violationId: string },
            index: number,
            total: number,
          ) => {
            log(`  [${String(index)}/${String(total)}] ${issue.violationId} → ${filePath}`);
          },
        }
      : {}),
  });

  ok('Tasks generated');
}

async function stepHtmlReport(
  issues: ReturnType<typeof buildTaskIssues>,
  analyzed: AnalyzedViolation[],
  targetUrl: string,
  pagesScanned: number,
  config: AppConfig,
): Promise<string> {
  const reportPath = await generateHtmlReport(
    issues,
    {
      outputDir: config.reportsDir,
      targetUrl,
      wcagLevel: config.wcagLevel,
      pagesScanned,
      locale: config.locale,
    },
    analyzed,
  );

  ok('Report created');
  return reportPath;
}

function toDisplayPath(absoluteOrRelative: string): string {
  const absolute = path.resolve(absoluteOrRelative);
  const relative = path.relative(process.cwd(), absolute);
  if (!relative || relative.startsWith('..')) {
    return absolute;
  }
  return relative.split(path.sep).join('/');
}

function rethrowAsCliError(error: unknown): never {
  if (
    error instanceof CrawlError ||
    error instanceof ScanError ||
    error instanceof ScreenshotError ||
    error instanceof AiError ||
    error instanceof ReportError
  ) {
    throw new Error(`[${error.code}] ${error.message}`);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(String(error));
}
