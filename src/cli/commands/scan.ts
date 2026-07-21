import { Command, Option, type Command as CommanderCommand } from 'commander';

import { isWcagLevel, type WcagLevel } from '../../scanner/index.js';
import { runAccessibilityAudit, type AuditOptions } from '../run-audit.js';

interface ScanCommandOptions {
  maxPages?: string;
  wcagLevel?: string;
  aiMode?: 'auto' | 'on' | 'off';
  sk?: boolean;
  project?: string;
  config?: string;
  verbose?: boolean;
}

export function createScanCommand(): Command {
  return new Command('scan')
    .description('Run a full accessibility audit against a URL')
    .argument('<url>', 'Absolute http(s) URL to audit')
    .option('--max-pages <number>', 'Maximum number of pages to crawl (overrides config)')
    .option('--wcag-level <level>', 'WCAG conformance level: A, AA, or AAA (overrides config)')
    .addOption(
      new Option(
        '--ai-mode <mode>',
        'AI analysis mode: auto, on, or off (overrides config.ai.enabled)',
      ).choices(['auto', 'on', 'off']),
    )
    .option('--sk', 'Generate report, tasks, and AI analysis in Slovak (default: English)')
    .option(
      '--project <name>',
      'Project folder under .a11y-ops-report/<name>/ (default: target URL hostname)',
    )
    .option('--config <path>', 'Path to a11y-ops.config.* (default: auto-detect in cwd)')
    .option('-v, --verbose', 'Show detailed per-page / per-issue progress')
    .action(async (url: string, options: ScanCommandOptions, command: CommanderCommand) => {
      const cliOverrides: NonNullable<AuditOptions['cliOverrides']> = {};

      if (command.getOptionValueSource('maxPages') === 'cli' && options.maxPages !== undefined) {
        cliOverrides.maxPages = parseMaxPages(options.maxPages);
      }

      if (command.getOptionValueSource('wcagLevel') === 'cli' && options.wcagLevel !== undefined) {
        cliOverrides.wcagLevel = parseWcagLevel(options.wcagLevel);
      }

      if (command.getOptionValueSource('aiMode') === 'cli' && options.aiMode !== undefined) {
        cliOverrides.aiMode = options.aiMode;
      }

      if (command.getOptionValueSource('sk') === 'cli' && options.sk) {
        cliOverrides.locale = 'sk';
      }

      if (command.getOptionValueSource('project') === 'cli' && options.project !== undefined) {
        cliOverrides.projectName = options.project;
      }

      const auditOptions: AuditOptions = {
        url,
        cliOverrides,
        ...(options.config ? { configPath: options.config } : {}),
        ...(options.verbose ? { verbose: true } : {}),
      };

      await runAccessibilityAudit(auditOptions);
    });
}

function parseMaxPages(raw: string): number {
  const value = Number(raw);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid --max-pages value: "${raw}". Expected a positive integer.`);
  }

  return value;
}

function parseWcagLevel(raw: string): WcagLevel {
  const normalized = raw.trim().toUpperCase();

  if (!isWcagLevel(normalized)) {
    throw new Error(`Invalid --wcag-level value: "${raw}". Expected A, AA, or AAA.`);
  }

  return normalized;
}
