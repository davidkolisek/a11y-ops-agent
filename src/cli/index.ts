#!/usr/bin/env node

import { createProgram } from './program.js';
import { fail } from './logger.js';

async function main(): Promise<void> {
  const program = createProgram();
  program.exitOverride();

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (isCommanderExit(error)) {
      process.exitCode = error.exitCode;
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    fail(message);
    process.exitCode = 1;
  }
}

function isCommanderExit(
  error: unknown,
): error is { exitCode: number; code?: string } {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'exitCode' in error &&
      typeof (error as { exitCode: unknown }).exitCode === 'number',
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(message);
  process.exitCode = 1;
});
