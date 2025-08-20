#!/usr/bin/env node
const { spawnSync } = require('child_process');

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', ...options });
  if (result.error) {
    console.error(`[x] ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status);
  }
  return result;
}

function capture(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { stdio: ['inherit', 'pipe', 'inherit'], ...options });
  if (result.error) {
    console.error(`[x] ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status);
  }
  return result.stdout.toString().trim();
}

try {
  run('git', ['--version']);
} catch (e) {
  console.error('[x] git não encontrado no PATH.');
  process.exit(1);
}

run('git', ['add', '-A']);
const status = capture('git', ['status', '--porcelain']);
if (status) {
  const msg = `Backup: ${new Date().toISOString().replace(/T/, ' ').split('.')[0]}`;
  run('git', ['commit', '-m', msg]);
}
run('git', ['push']);
