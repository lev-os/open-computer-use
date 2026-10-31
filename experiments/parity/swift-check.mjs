#!/usr/bin/env node
// Run repository Swift checks in the same GUI session as the direct probe.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const action = process.argv[2];
if (process.argv.length !== 3 || !['build', 'test'].includes(action)) {
  console.error('usage: node experiments/parity/swift-check.mjs <build|test>');
  process.exit(2);
}
const result = spawnSync('swift', [action], {
  cwd: fileURLToPath(new URL('../../', import.meta.url)), stdio: 'inherit', env: process.env,
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
