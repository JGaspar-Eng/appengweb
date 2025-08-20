#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const opts = {
  bundleDir: path.join(process.cwd(), 'backups'),
  keepLast: 7,
  olderThanDays: 0,
  whatIf: false,
};

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  switch (a) {
    case '--bundle-dir':
      opts.bundleDir = argv[++i] || opts.bundleDir;
      break;
    case '--keep-last':
      opts.keepLast = parseInt(argv[++i], 10);
      break;
    case '--older-than-days':
      opts.olderThanDays = parseInt(argv[++i], 10);
      break;
    case '--what-if':
      opts.whatIf = true;
      break;
    default:
      break;
  }
}

if (!fs.existsSync(opts.bundleDir)) {
  console.log(`[i] Pasta de bundles nao existe: ${opts.bundleDir}`);
  process.exit(0);
}

const files = fs
  .readdirSync(opts.bundleDir)
  .filter((f) => f.endsWith('.bundle'))
  .map((f) => {
    const full = path.join(opts.bundleDir, f);
    const stat = fs.statSync(full);
    return { name: f, full, time: stat.mtimeMs };
  })
  .sort((a, b) => b.time - a.time);

if (opts.olderThanDays > 0) {
  const cutoff = Date.now() - opts.olderThanDays * 24 * 60 * 60 * 1000;
  for (const f of files) {
    if (f.time < cutoff) {
      if (opts.whatIf) console.log(`[whatif] Remove ${f.full}`);
      else {
        fs.unlinkSync(f.full);
        console.log(`[i] Removido ${f.name}`);
      }
    }
  }
} else {
  if (opts.keepLast < 0) {
    console.error('KeepLast deve ser >= 0');
    process.exit(1);
  }
  const toRemove = files.slice(opts.keepLast);
  for (const f of toRemove) {
    if (opts.whatIf) console.log(`[whatif] Remove ${f.full}`);
    else {
      fs.unlinkSync(f.full);
      console.log(`[i] Removido ${f.name}`);
    }
  }
}

console.log('[i] Operacao concluida.');
