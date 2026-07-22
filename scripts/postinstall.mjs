#!/usr/bin/env node

/**
 * Runs after npm install. Keeps noise low for dependency installs;
 * prints a short onboarding tip for global / direct installs.
 */
const isGlobal = process.env['npm_config_global'] === 'true';
const isCi = Boolean(process.env['CI'] || process.env['CONTINUOUS_INTEGRATION']);

if (isCi) {
  process.exit(0);
}

const lines = [
  '',
  '✔ a11y-agent-ops installed',
  '',
  'Get started:',
  '  a11y-ops setup              # create ~/.a11y-ops and open it (.env + config)',
  '  a11y-ops scan <url>         # run an accessibility audit',
  '  a11y-ops --help',
  '',
  'Chromium (once):',
  '  npx playwright install chromium',
  '',
];

if (!isGlobal) {
  lines.splice(
    3,
    0,
    '  (local install — use npx a11y-agent-ops … or npm link for the a11y-ops bin)',
    '',
  );
}

console.log(lines.join('\n'));
