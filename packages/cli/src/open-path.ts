import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Open a directory in the system file manager (Finder / Explorer / xdg-open).
 */
export async function openDirectory(dirPath: string): Promise<void> {
  if (process.platform === 'darwin') {
    await execFileAsync('open', [dirPath]);
    return;
  }

  if (process.platform === 'win32') {
    await execFileAsync('explorer', [dirPath]).catch(() => undefined);
    return;
  }

  await execFileAsync('xdg-open', [dirPath]);
}

/**
 * Reveal a file in the system file manager.
 */
export async function revealFile(filePath: string, fallbackDir: string): Promise<void> {
  if (process.platform === 'darwin') {
    await execFileAsync('open', ['-R', filePath]);
    return;
  }

  if (process.platform === 'win32') {
    await execFileAsync('explorer', [`/select,${filePath}`]).catch(() => undefined);
    return;
  }

  await execFileAsync('xdg-open', [fallbackDir]);
}
