import { Command } from 'commander';

import { createScanCommand } from './commands/scan.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('a11y-ops-agent')
    .description(
      'Framework-independent accessibility auditing CLI — crawl, axe-core scan, screenshots, AI analysis, tasks & HTML report',
    )
    .version('0.1.0')
    .showHelpAfterError('(add --help for usage details)')
    .showSuggestionAfterError(true);

  program.addCommand(createScanCommand());

  return program;
}
