import { createRequire } from 'node:module';

import { Command } from 'commander';

import { createScanCommand } from './commands/scan.js';
import { createSetupCommand } from './commands/setup.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

export function createProgram(): Command {
  const program = new Command();

  program
    .name('a11y-ops')
    .description(
      'Framework-independent accessibility auditing CLI — crawl, axe-core scan, screenshots, AI analysis, tasks & HTML report',
    )
    .version(version)
    .showHelpAfterError('(add --help for usage details)')
    .showSuggestionAfterError(true);

  program.addCommand(createSetupCommand());
  program.addCommand(createScanCommand());

  return program;
}
