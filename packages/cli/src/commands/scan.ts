import { Command, Option, type Command as CommanderCommand } from 'commander';

import {
  isWcagLevel,
  scan,
  type ScanOptions,
  type ScanProgressEvent,
  type WcagLevel,
} from '@a11y-agent-ops/engine';

import { presentPostScanExperience } from '../post-scan.js';
import { blank, log, ok, skip } from '../logger.js';

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
      const cliOverrides: NonNullable<ScanOptions['cliOverrides']> = {};

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

      const scanOptions: ScanOptions = {
        url,
        cliOverrides,
        ...(options.config ? { configPath: options.config } : {}),
        ...(options.verbose ? { verbose: true } : {}),
        onProgress: handleProgress,
      };

      const report = await scan(scanOptions);
      await presentPostScanExperience(report.reportPath);
    });
}

function handleProgress(event: ScanProgressEvent): void {
  switch (event.type) {
    case 'message':
      log(event.message);
      break;
    case 'ok':
      ok(event.message);
      break;
    case 'skip':
      skip(event.message);
      break;
    case 'blank':
      blank();
      break;
  }
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
