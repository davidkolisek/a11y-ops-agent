/**
 * Minimal CLI logger for production scan output.
 */

export function log(message = ''): void {
  console.log(message);
}

export function ok(message: string): void {
  console.log(`✓ ${message}`);
}

export function skip(message: string): void {
  console.log(`○ ${message}`);
}

export function fail(message: string): void {
  console.error(`✗ ${message}`);
}

export function blank(): void {
  console.log('');
}
