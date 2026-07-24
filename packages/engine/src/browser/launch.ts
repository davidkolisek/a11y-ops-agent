import { chromium, type Browser, type LaunchOptions } from 'playwright';

export interface BrowserLaunchConfig {
  executablePath?: string;
  args?: string[];
  headless?: boolean;
}

let launchConfig: BrowserLaunchConfig = {};

/**
 * Override Chromium launch options for hosts that cannot use Playwright's
 * bundled browser (e.g. Netlify Functions + `@sparticuz/chromium`).
 */
export function configureBrowserLaunch(config: BrowserLaunchConfig): void {
  launchConfig = { ...config };
}

export function resetBrowserLaunchConfig(): void {
  launchConfig = {};
}

export function getBrowserLaunchConfig(): BrowserLaunchConfig {
  return { ...launchConfig };
}

/**
 * Launch Chromium with optional host-provided executablePath / args.
 */
export async function launchChromium(
  overrides: LaunchOptions = {},
): Promise<Browser> {
  const options: LaunchOptions = {
    headless: launchConfig.headless ?? true,
    ...overrides,
  };

  if (launchConfig.executablePath && !options.executablePath) {
    options.executablePath = launchConfig.executablePath;
  }
  if (launchConfig.args?.length && !options.args) {
    options.args = launchConfig.args;
  }

  return chromium.launch(options);
}
