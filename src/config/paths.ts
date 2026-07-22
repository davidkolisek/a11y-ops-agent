import { homedir } from 'node:os';
import path from 'node:path';

/** User-level config / secrets directory for the global CLI install. */
export const GLOBAL_CONFIG_DIRNAME = '.a11y-ops';

export function getGlobalConfigDir(home = homedir()): string {
  return path.join(home, GLOBAL_CONFIG_DIRNAME);
}
