#!/usr/bin/env node
/**
 * Fails the build if src/chrome/ has drifted from the @aidxn/chrome package.
 *
 * src/chrome/ is vendored (see the alias comment in vite.config.ts). The
 * authoring repo sits beside this one at ../aidxn-chrome and owns those files;
 * a hand-edit here is a fork, and this is what catches it.
 *
 * It SKIPS rather than fails when ../aidxn-chrome is absent, because that is
 * the normal state on Netlify — CI clones this repo alone. The gate is real
 * locally, which is where the hand-edit would happen, and the skip is printed
 * so a silent pass never reads as a verified one.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.resolve(root, '../aidxn-chrome/scripts/sync-chrome.mjs');

if (!fs.existsSync(script)) {
  console.log('chrome-check: ../aidxn-chrome not checked out — skipping drift check.');
  process.exit(0);
}

const result = spawnSync(process.execPath, [script, '--check', '--target', root], {
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
