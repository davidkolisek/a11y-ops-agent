#!/usr/bin/env node
/**
 * Netlify/CI runs Linux; lockfiles created on macOS often skip platform optional
 * native bindings (npm/cli#4828). Force-install the Linux packages Vite + Tailwind need.
 */
import { spawnSync } from 'node:child_process'
import { arch, platform } from 'node:os'

if (platform() !== 'linux' || arch() !== 'x64') {
  process.exit(0)
}

const packages = [
  '@rolldown/binding-linux-x64-gnu@1.1.5',
  '@tailwindcss/oxide-linux-x64-gnu@4.3.3',
  'lightningcss-linux-x64-gnu@1.32.0',
]

const result = spawnSync(
  'npm',
  ['install', '--no-save', '--include=optional', ...packages],
  { stdio: 'inherit', shell: process.platform === 'win32' },
)

process.exit(result.status ?? 1)
