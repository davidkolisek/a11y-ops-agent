import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

import clipboard from 'clipboardy';
import open from 'open';

import { blank, log } from './logger.js';

const execFileAsync = promisify(execFile);

/**
 * Post-scan developer UX: announce finished report, open it, then run an
 * interactive single-key menu until the user quits.
 */
export async function presentPostScanExperience(reportPathInput: string): Promise<void> {
  const reportPath = path.resolve(reportPathInput);
  const reportDir = path.dirname(reportPath);

  printFinishedHeader(reportPath);
  await openReport(reportPath);

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    blank();
    log('Interactive menu skipped (non-interactive terminal).');
    return;
  }

  await runInteractiveMenu(reportPath, reportDir);
}

function printFinishedHeader(reportPath: string): void {
  blank();
  log('✔ Scan finished');
  blank();
  log('Report:');
  log(reportPath);
  blank();
}

function printMenu(reportPath: string): void {
  blank();
  log('--------------------------------------------------');
  blank();
  log('✔ Scan finished');
  blank();
  log('Report:');
  log(reportPath);
  blank();
  log('Commands:');
  blank();
  log('[O] Open report again');
  log('[F] Open report folder');
  log('[C] Copy report path');
  log('[Q] Quit');
  blank();
  log('--------------------------------------------------');
  blank();
}

async function runInteractiveMenu(reportPath: string, reportDir: string): Promise<void> {
  const keyReader = createKeyReader();

  try {
    while (true) {
      printMenu(reportPath);

      const key = await keyReader.read();
      const normalized = key.toLowerCase();

      if (normalized === 'q' || key === '\u0003') {
        blank();
        log('✔ Quit');
        break;
      }

      if (normalized === 'o') {
        await openReport(reportPath);
        continue;
      }

      if (normalized === 'f') {
        await openReportFolder(reportPath, reportDir);
        continue;
      }

      if (normalized === 'c') {
        await copyReportPath(reportPath);
        continue;
      }

      // Invalid key — loop redisplays the menu.
    }
  } finally {
    keyReader.dispose();
  }
}

async function openReport(reportPath: string): Promise<void> {
  try {
    await open(reportPath, { wait: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`✗ Could not open report: ${message}`);
  }
}

/**
 * Open the report location in the system file manager.
 * macOS: reveal the HTML file in Finder (`open -R`).
 * Windows: select the file in Explorer.
 * Linux: open the containing folder.
 */
async function openReportFolder(reportPath: string, reportDir: string): Promise<void> {
  try {
    if (process.platform === 'darwin') {
      await execFileAsync('open', ['-R', reportPath]);
      return;
    }

    if (process.platform === 'win32') {
      // `/select,` highlights the file; Explorer often exits non-zero even on success.
      await execFileAsync('explorer', [`/select,${reportPath}`]).catch(() => undefined);
      return;
    }

    await execFileAsync('xdg-open', [reportDir]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`✗ Could not open report folder: ${message}`);
  }
}

async function copyReportPath(reportPath: string): Promise<void> {
  try {
    await clipboard.write(reportPath);
    log('✔ Report path copied to clipboard.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`✗ Could not copy to clipboard: ${message}`);
  }
}

interface KeyReader {
  read: () => Promise<string>;
  dispose: () => void;
}

/**
 * Single-key input without requiring Enter (TTY raw mode).
 * Ctrl+C resolves as `\u0003` so the menu can quit gracefully.
 */
function createKeyReader(): KeyReader {
  let disposed = false;
  let pendingResolve: ((key: string) => void) | null = null;
  let pendingReject: ((error: Error) => void) | null = null;

  const onSigInt = (): void => {
    // Deliver Ctrl+C as a synthetic key so the menu exits cleanly.
    if (pendingResolve) {
      const resolve = pendingResolve;
      pendingResolve = null;
      pendingReject = null;
      restoreStdin();
      resolve('\u0003');
    }
  };

  process.on('SIGINT', onSigInt);

  return {
    read(): Promise<string> {
      if (disposed) {
        return Promise.reject(new Error('Key reader disposed'));
      }

      if (!process.stdin.isTTY) {
        return Promise.reject(new Error('stdin is not a TTY'));
      }

      return new Promise((resolve, reject) => {
        pendingResolve = resolve;
        pendingReject = reject;

        const onData = (buffer: Buffer): void => {
          pendingResolve = null;
          pendingReject = null;
          process.stdin.off('data', onData);
          restoreStdin();
          resolve(buffer.toString('utf8'));
        };

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.once('data', onData);
      });
    },

    dispose(): void {
      disposed = true;
      process.off('SIGINT', onSigInt);
      if (pendingReject) {
        pendingReject(new Error('Key reader disposed'));
        pendingResolve = null;
        pendingReject = null;
      }
      restoreStdin();
    },
  };
}

function restoreStdin(): void {
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(false);
    } catch {
      // Ignore — stdin may already be closed or not in raw mode.
    }
  }
  try {
    process.stdin.pause();
  } catch {
    // Ignore.
  }
}
