<#
.SYNOPSIS
  push-to-github.ps1
.DESCRIPTION
  Script seguro e idempotente para preparar, commitar e enviar um projeto local
  para o GitHub. Projetado para o repositório padrão do usuário Eng. Joanez:
  usuário: JGaspar-Eng, repo: appengweb.

  Funcionalidades:
    - inicializa git (se necessário) e cria branch main
    - adiciona remote origin (atualiza se diferente)
    - commita alterações pendentes
    - cria o repo remoto via gh (se não existir)
    - push para origin/main (opcionalmente --force com confirmação)
    - remove do índice arquivos CAD (.dxf/.dwg/.bak) mantendo locais
    - atualiza .gitignore para ignorar CAD
    - opção avançada para purgar histórico usando git-filter-repo (EXIGE cuidado)

.PARAMETER ForcePush
  Se fornecido, permite executar push --force (atenção: perigoso para colaboradores).

.PARAMETER AutoRemoveCad
  Se fornecido, remove automaticamente do índice arquivos .dxf/.dwg/.bak (mantém locais).

.PARAMETER PurgeHistory
  Se fornecido, tenta criar um mirror e executar git-filter-repo para eliminar
  definitivamente arquivos por extensão do histórico e force-push. REQUER confirmação.

.PARAMETER GhUser
  Usuário GitHub (default: JGaspar-Eng).

.PARAMETER RepoName
  Nome do repositório (default: appengweb).

.PARAMETER RepoVisibility
  "--private" ou "--public" usado ao criar repo com gh (default: --private).

.EXAMPLE
  ./push-to-github.ps1
  Executa push padrão (sem force, sem remoção automática de CAD).

  ./push-to-github.ps1 -AutoRemoveCad
  Remove .dxf/.dwg/.bak do índice e commita/pusha normalmente.

  ./push-to-github.ps1 -PurgeHistory
  Inicia procedimento de purge (git-filter-repo) — exige confirmação interativa.

.NOTES
  Testado em PowerShell 7+. Requer git instalado; gh (GitHub CLI) é recomendado
  se quiser que o script crie o repositório remoto automaticamente.
#>

[CmdletBinding()]
param(
  [switch]$ForcePush,
  [switch]$AutoRemoveCad,
  [switch]$PurgeHistory,
  [string]$GhUser = "JGaspar-Eng",
  [string]$RepoName = "appengweb",
  [ValidateSet("--private","--public")]
  [string]$RepoVisibility = "--private"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Info { param($m) Write-Host "[i] $m" -ForegroundColor Cyan }
function Write-Warn { param($m) Write-Host "[!] $m" -ForegroundColor Yellow }
function Write-Err  { param($m) Write-Host "[x] $m" -ForegroundColor Red }

# caminhos / derivadas
$RepoFull     = "$GhUser/$RepoName"
$ExpectedRemote = "https://github.com/$GhUser/$RepoName.git"
$Cwd = (Get-Location).Path

Write-Info "Executando em: $Cwd"
Write-Info "Destino GitHub: $RepoFull (visibilidade: $RepoVisibility)"
if ($ForcePush) { Write-Warn "Modo ForcePush ativado — este script poderá usar git push --force." }
if ($AutoRemoveCad) { Write-Info "AutoRemoveCad: arquivos CAD (.dxf/.dwg/.bak) serão removidos do índice." }
if ($PurgeHistory) { Write-Warn "PurgeHistory: operação destrutiva no histórico. Será solicitado CONFIRMAÇÃO." }

# 0) Verifica ferramentas essenciais
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
  Write-Err "git não encontrado no PATH. Instale git antes de continuar."
  exit 1
}
$ghCmd = Get-Command gh -ErrorAction SilentlyContinue

# 1) Confere se estamos na raiz de um repo git
if (-not (Test-Path ".git")) {
  Write-Info "Repositório git não encontrado — inicializando git localmente..."
  git init
  git checkout -b main 2>$null | Out-Null
  Write-Info "Git inicializado e branch 'main' criada."
} else {
  Write-Info "Repositório git já existe localmente."
  try { git rev-parse --abbrev-ref HEAD 2>$null | Out-Null } catch {
    # forçar existir branch main
    git checkout -b main 2>$null | Out-Null
  }
  git branch -M main 2>$null | Out-Null
}

# 2) Opção: remover arquivos CAD do índice (mantendo local)
if ($AutoRemoveCad) {
  Write-Info "Procurando arquivos .dxf / .dwg / .bak indexados..."
  $cadPatterns = @('*.dxf','*.dwg','*.bak')
  $found = @()
  foreach ($p in $cadPatterns) {
    $list = git ls-files $p 2>$null
    if ($list) { $found += $list }
  }
  if ($found.Count -gt 0) {
    Write-Warn "Arquivos CAD versionados encontrados:"
    $found | ForEach-Object { Write-Host "  $_" }
    Write-Info "Removendo do índice (git rm --cached) — arquivos serão mantidos localmente."
    $found | ForEach-Object { git rm --cached --force -- "$_" > $null }
    Write-Info "Atualizando .gitignore para ignorar CAD."
    $gi = ""
    if (Test-Path .gitignore) { $gi = Get-Content -Raw .gitignore -ErrorAction SilentlyContinue }
    if ($gi -notmatch '\*\.dxf') {
      Add-Content .gitignore "`n# Ignorar desenhos CAD (adicionado por push-to-github.ps1)"
      Add-Content .gitignore "*.dxf"
      Add-Content .gitignore "*.dwg"
      Add-Content .gitignore "*.bak"
      Write-Info ".gitignore atualizado com regras para *.dxf, *.dwg, *.bak"
    } else {
      Write-Info ".gitignore já contém regra para *.dxf (não alterado)."
    }
  } else {
    Write-Info "Nenhum arquivo CAD indexado encontrado."
  }
}

# 3) git add / commit se houver mudanças
Write-Info "Preparando commit — adicionando alterações..."
git add -A
$st = git status --porcelain
if ($st) {
  $msg = "Atualização: commit automático antes do push ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
  git commit -m $msg
  Write-Info "Commit criado: $msg"
} else {
  Write-Info "Sem mudanças a commitar."
}

# 4) remote origin — criar/atualizar
$existingRemote = $null
try { $existingRemote = (& git remote get-url origin 2>$null) -join "" } catch {}
if ($existingRemote) {
  if ($existingRemote -ne $ExpectedRemote) {
    Write-Warn "Remote 'origin' aponta para: $existingRemote"
    Write-Info "Atualizando remote origin -> $ExpectedRemote"
    git remote set-url origin $ExpectedRemote
  } else {
    Write-Info "Remote 'origin' já aponta para $ExpectedRemote"
  }
} else {
  Write-Info "Adicionando remote origin -> $ExpectedRemote"
  git remote add origin $ExpectedRemote
}

# 5) Autenticação gh opcional: criar repo remoto se não existir
if ($ghCmd) {
  Write-Info "Verificando existência do repositório remoto via gh..."
  $repoExists = $false
  try {
    gh repo view $RepoFull 2>$null | Out-Null
    $repoExists = $true
  } catch {
    $repoExists = $false
  }

  if (-not $repoExists) {
    Write-Info "Repositório remoto não encontrado. Criando $RepoFull ($RepoVisibility) via gh..."
    try {
      gh repo create $RepoFull $RepoVisibility --source=. --remote=origin --push --confirm
      Write-Info "Repositório criado e código enviado."
      return
    } catch {
      Write-Warn "Falha ao criar repo via gh: $($_.Exception.Message)"
      Write-Warn "Continuando: irá tentar apenas 'git push' (repo pode já existir)."
    }
  } else {
    Write-Info "Repositório remoto existe: $RepoFull"
  }
} else {
  Write-Warn "GitHub CLI (gh) não encontrado — se o repo remoto não existir, crie manualmente no GitHub."
}

# 6) Push normal / force dependendo do switch
try {
  git branch -M main 2>$null | Out-Null
} catch { }

if ($ForcePush) {
  $ok = Read-Host "Você escolheu -ForcePush. Confirma executar 'git push --force origin main'? (y/N)"
  if ($ok -match '^[yY]') {
    Write-Warn "Executando git push --force origin main (risco: reescrita do histórico remoto)."
    git push --force --set-upstream origin main
    Write-Info "Force-push concluído."
  } else {
    Write-Info "Force-push cancelado pelo usuário. Fazendo push normal."
    git push -u origin main
  }
} else {
  Write-Info "Executando git push -u origin main"
  git push -u origin main
}

# 7) Purge history (opcional, destrutivo) — só se solicitado
if ($PurgeHistory) {
  Write-Warn "INICIANDO procedimento de PURGE DE HISTÓRICO (destrutivo)."
  $confirm = Read-Host "CONFIRMA que quer remover arquivos .dxf/.dwg/.bak do HISTÓRICO e forçar push? (type 'DELETE-HISTORY' to confirm)"
  if ($confirm -ne "DELETE-HISTORY") {
    Write-Info "PurgeHistory cancelado pelo usuário."
  } else {
    $filterCmd = Get-Command git-filter-repo -ErrorAction SilentlyContinue
    if (-not $filterCmd) {
      Write-Err "git-filter-repo não encontrado. Instale git-filter-repo e adicione ao PATH antes de tentar novamente."
      Write-Info "Você instalou git-filter-repo antes; talvez seja necessário adicionar: $env:APPDATA\Python\Python*/Scripts ao PATH."
    } else {
      # cria clone mirror temporário
      $tmp = Join-Path $env:TEMP ("$RepoName-mirror-" + [guid]::NewGuid().ToString("n"))
      Write-Info "Criando mirror temporário: $tmp"
      git clone --mirror $ExpectedRemote $tmp
      Push-Location $tmp
      try {
        Write-Info "Executando git-filter-repo para remover *.dxf, *.dwg, *.bak do histórico..."
        git-filter-repo --invert-paths --paths-glob '*.dxf' --paths-glob '*.dwg' --paths-glob '*.bak' --force
        Write-Info "Tentando push forçado do mirror para o remoto (FORCE PUSH)..."
        git push --force --all
        git push --force --tags
        Write-Info "Purge concluído. Atenção: colaboradores precisarão reclonar."
      } catch {
        Write-Err "Erro durante git-filter-repo / push: $($_.Exception.Message)"
      } finally {
        Pop-Location
        Write-Info "Removendo mirror temporário..."
        Remove-Item -Recurse -Force $tmp
      }
    }
  }
}

Write-Info "=== Operação finalizada ==="
Write-Info "Repositório remoto: https://github.com/$GhUser/$RepoName"
Write-Info "Se tiver dúvidas sobre grandes arquivos no histórico (LFS), me avise que eu guio os passos."

# fim do script
