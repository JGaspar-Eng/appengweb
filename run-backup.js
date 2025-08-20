#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'scripts', 'backup-and-push.ps1');

function run(shell) {
  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-CreateBundle'];
  const child = spawn(shell, args, { stdio: 'inherit' });
  child.on('error', (err) => {
    if (shell === 'pwsh') {
      run(process.platform === 'win32' ? 'powershell' : 'powershell');
    } else {
      console.error('[x] Nenhum PowerShell encontrado (pwsh/powershell).');
      process.exit(1);
    }
  });
  child.on('exit', (code) => process.exit(code ?? 0));
}

run('pwsh');
