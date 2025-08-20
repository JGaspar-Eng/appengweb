#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  if (res.error) {
    console.error(`[x] ${res.error.message}`);
    process.exit(1);
  }
  if (res.status !== 0) {
    process.exit(res.status);
  }
  return res;
}

const argv = process.argv.slice(2);
const opts = {
  bundlePath: '',
  mode: 'scp',
  sshUser: 'usuario',
  sshHost: 'backup.exemplo.com',
  sshPort: 22,
  sshDestPath: '/home/usuario/backups/',
  scpPath: 'scp',
  ghTag: `backup-${new Date().toISOString().replace(/[:T]/g, '-').split('.')[0]}`,
  ghRepo: 'JGaspar-Eng/appengweb',
  ghReleaseName: '',
  ghDraft: false,
};

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  switch (a) {
    case '--bundle-path':
      opts.bundlePath = argv[++i] || opts.bundlePath;
      break;
    case '--mode':
      opts.mode = argv[++i] || opts.mode;
      break;
    case '--ssh-user':
      opts.sshUser = argv[++i] || opts.sshUser;
      break;
    case '--ssh-host':
      opts.sshHost = argv[++i] || opts.sshHost;
      break;
    case '--ssh-port':
      opts.sshPort = parseInt(argv[++i], 10);
      break;
    case '--ssh-dest-path':
      opts.sshDestPath = argv[++i] || opts.sshDestPath;
      break;
    case '--scp-path':
      opts.scpPath = argv[++i] || opts.scpPath;
      break;
    case '--gh-tag':
      opts.ghTag = argv[++i] || opts.ghTag;
      break;
    case '--gh-repo':
      opts.ghRepo = argv[++i] || opts.ghRepo;
      break;
    case '--gh-release-name':
      opts.ghReleaseName = argv[++i] || opts.ghReleaseName;
      break;
    case '--gh-draft':
      opts.ghDraft = true;
      break;
    default:
      break;
  }
}

if (!opts.bundlePath) {
  const dir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(dir)) {
    console.error(`[x] Nenhum bundle encontrado em ${dir}`);
    process.exit(1);
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.bundle'))
    .map((f) => {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      return { full, time: stat.mtimeMs };
    })
    .sort((a, b) => b.time - a.time);
  if (files.length === 0) {
    console.error(`[x] Nenhum bundle encontrado em ${dir}`);
    process.exit(1);
  }
  opts.bundlePath = files[0].full;
}

console.log(`[i] Arquivo selecionado: ${opts.bundlePath}`);

if (opts.mode === 'scp') {
  const args = ['-P', String(opts.sshPort), opts.bundlePath, `${opts.sshUser}@${opts.sshHost}:${opts.sshDestPath}`];
  run(opts.scpPath, args);
  console.log('[i] Upload SCP concluido.');
} else if (opts.mode === 'gh') {
  const releaseName = opts.ghReleaseName || `Backup ${opts.ghTag}`;
  const args = ['release', 'create', opts.ghTag, opts.bundlePath, '--repo', opts.ghRepo, '--title', releaseName, '--notes', `Backup bundle ${opts.ghTag}`];
  if (opts.ghDraft) args.push('--draft');
  run('gh', args);
  console.log('[i] Release criado e arquivo enviado.');
} else {
  console.error('[x] Mode desconhecido, use "scp" ou "gh"');
  process.exit(1);
}
