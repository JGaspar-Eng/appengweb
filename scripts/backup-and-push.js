#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

const argv = process.argv.slice(2);
const opts = {
  createBundle: false,
  runPushScript: false,
  bundleDir: path.join(process.cwd(), 'backups'),
};

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  switch (a) {
    case '--create-bundle':
    case '-b':
      opts.createBundle = true;
      break;
    case '--run-push-script':
    case '--push':
    case '-p':
      opts.runPushScript = true;
      break;
    case '--bundle-dir':
      opts.bundleDir = argv[++i] || opts.bundleDir;
      break;
    default:
      break;
  }
}

// Ensure git is available
try {
  run('git', ['--version']);
} catch (e) {
  console.error('[x] git não encontrado no PATH.');
  process.exit(1);
}

const repoRoot = capture('git', ['rev-parse', '--show-toplevel']);
process.chdir(repoRoot);

if (opts.createBundle) {
  const dir = path.resolve(opts.bundleDir);
  fs.mkdirSync(dir, { recursive: true });
  const repoName = path.basename(repoRoot);
  const stamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
  const bundleFile = path.join(dir, `${repoName}-${stamp}.bundle`);
  run('git', ['bundle', 'create', bundleFile, '--all']);
  console.log(`[i] Bundle criado em: ${bundleFile}`);
}

if (opts.runPushScript) {
  const pushScript = path.join(__dirname, 'push-to-github.js');
  const res = spawnSync(process.execPath, [pushScript], { stdio: 'inherit' });
  if (res.error) {
    console.error(`[x] ${res.error.message}`);
    process.exit(1);
  }
  process.exit(res.status ?? 0);
}
