#!/usr/bin/env node

/**
 * Copy built workspace packages into packages/cli/vendor and point the CLI
 * package.json at file:./vendor/* so `npm pack` / `npm publish` ships a
 * self-contained a11y-agent-ops tarball.
 *
 * Local development uses workspace "*" dependencies; this script rewrites
 * them for packing only (restored by postpack).
 */

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliDir = path.join(root, 'packages/cli');
const cliPkgPath = path.join(cliDir, 'package.json');
const cliVendor = path.join(cliDir, 'vendor');
const backupPath = path.join(cliDir, '.package.json.prepack-backup');

async function bundlePackage(name, sourceDir, dependencyOverrides = {}) {
  const srcPkg = JSON.parse(
    await readFile(path.join(sourceDir, 'package.json'), 'utf8'),
  );
  const destDir = path.join(cliVendor, name);

  await mkdir(destDir, { recursive: true });
  await cp(path.join(sourceDir, 'dist'), path.join(destDir, 'dist'), {
    recursive: true,
  });

  const bundled = {
    name: srcPkg.name,
    version: srcPkg.version,
    type: 'module',
    main: srcPkg.main,
    types: srcPkg.types,
    exports: srcPkg.exports,
    license: srcPkg.license,
    engines: srcPkg.engines,
    dependencies: dependencyOverrides,
  };

  await writeFile(
    path.join(destDir, 'package.json'),
    `${JSON.stringify(bundled, null, 2)}\n`,
  );
}

const mode = process.argv[2] ?? 'bundle';

if (mode === 'restore') {
  const backup = await readFile(backupPath, 'utf8').catch(() => null);
  if (backup) {
    await writeFile(cliPkgPath, backup);
    await rm(backupPath, { force: true });
    console.log('Restored packages/cli/package.json after pack');
  }
  process.exit(0);
}

await rm(cliVendor, { recursive: true, force: true });
await mkdir(cliVendor, { recursive: true });

await bundlePackage('shared', path.join(root, 'packages/shared'), {});
await bundlePackage('engine', path.join(root, 'packages/engine'), {
  '@a11y-agent-ops/shared': 'file:../shared',
  '@axe-core/playwright': '^4.10.1',
  'axe-core': '^4.10.3',
  jiti: '^2.7.0',
  playwright: '^1.51.0',
  zod: '^3.24.2',
});

if (mode === 'prepack') {
  const cliPkg = JSON.parse(await readFile(cliPkgPath, 'utf8'));
  await writeFile(backupPath, `${JSON.stringify(cliPkg, null, 2)}\n`);
  cliPkg.dependencies = {
    ...cliPkg.dependencies,
    '@a11y-agent-ops/engine': 'file:./vendor/engine',
    '@a11y-agent-ops/shared': 'file:./vendor/shared',
  };
  await writeFile(cliPkgPath, `${JSON.stringify(cliPkg, null, 2)}\n`);
  console.log('Bundled vendor/ and rewrote CLI deps for pack');
} else {
  console.log('Bundled workspace packages into packages/cli/vendor/');
}
