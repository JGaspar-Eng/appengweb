#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'scripts', 'backup-and-push.js');
// Pass through additional CLI args, default to creating a bundle
const extraArgs = process.argv.slice(2);
const args = [script, '--create-bundle', ...extraArgs];

let child;
try {
  child = spawn(process.execPath, args, { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to start backup process:', err);
  process.exit(1);
}

child.on('error', (err) => {
  console.error('Backup process error:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  if (typeof code === 'number' && code !== 0) {
    console.error(`Backup process exited with code ${code}`);
  }
  process.exit(code ?? 0);
});
