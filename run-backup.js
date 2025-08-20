#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'scripts', 'backup-and-push.js');
// Pass through additional CLI args, default to creating a bundle
const extraArgs = process.argv.slice(2);
const args = [script, '--create-bundle', ...extraArgs];

const child = spawn(process.execPath, args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
