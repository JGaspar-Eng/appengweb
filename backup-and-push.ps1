<#
.SYNOPSIS
  backup-and-push.ps1
.DESCRIPTION
  Script wrapper para:
    - gerar backup local (git bundle) com timestamp
    - opcionalmente executar ./push-to-github.ps1 (integração)
    - opcionalmente criar/empurrar um mirror para um remote de backup
    - tudo com checagens e confirmações para operações perigosas

  Requisitos:
    - PowerShell 7+ (pwsh) preferível
    - git no PATH
    - (opcional) gh (GitHub CLI) se desejar criar repositório remoto automaticamente via push-to-github.ps1

.PARAMETER RunPushScript
  Executa o script push-to-github.ps1 (presume estar no mesmo diretório).

.PARAMETER PushScriptArgs
  String contendo argumentos extras a passar para push-to-github.ps1 (ex: '-AutoRemoveCad -GhUser JGaspar-Eng').

.PARAMETER CreateBundle
  Cria um git bundle do repositório atual (snapshot portátil).

.PARAMETER BundleDir
  Diretório onde colocar os bundles (default: ./backups).

.PARAMETER MirrorRemote
  URL do remote de backup para fazer push do mirror (ex: 'ssh://git@backup.example.com:2222/user/repo.git').

.PARAMETER MirrorPush
  Se fornecido junto com MirrorRemote, cria um clone --mirror, adiciona remote e faz push de mirror.

.PARAMETER ForcePush
  Encaminhado para push-to-github.ps1 se RunPushScript for usado.

.PARAMETER AutoRemoveCad
  Encaminhado para push-to-github.ps1.

.PARAMETER PurgeHistory
  Encaminhado para push-to-github.ps1.

.PARAMETER DryRun
  Não executa comandos que alterem o repositório; imprime ações que seriam feitas.

.NOTES
  Testado em PowerShell 7+. Use com cautela em repositórios com histórico grande.
#>

[CmdletBinding()]
param(
  [switch]$RunPushScript,
  [string]$PushScriptArgs = "",
  [switch]$CreateBundle,
  [string]$BundleDir = ".\backups",
  [string]$MirrorRemote = "",
  [switch]$MirrorPush,
  [switch]$ForcePush,
  [switch]$AutoRemoveCad,
  [switch]$PurgeHistory,
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Info { param($m) Write-Host "[i] $m" -ForegroundColor Cyan }
function Write-Warn { param($m) Write-Host "[!] $m" -ForegroundColor Yellow }
function Write-Err  { param($m) Write-Host "[x] $m" -ForegroundColor Red }

# -----------------------------------------------------
# Pré-checks
# -----------------------------------------------------
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
  Write-Err "git não encontrado no PATH. Instale git antes de continuar."
  exit 1
}

# localização do script e do push script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PushScriptPath = Join-Path $ScriptDir "push-to-github.ps1"

if ($RunPushScript -and -not (Test-Path $PushScriptPath)) {
  Write-Err "push-to-github.ps1 não encontrado no mesmo diretório deste script ($ScriptDir)."
  exit 1
}

# determina raiz do repositório git (ou erro)
try {
  $RepoRoot = git rev-parse --show-toplevel 2>$null
} catch {
  Write-Err "Este diretório não parece ser um repositório git (não foi possível executar 'git rev-parse'). Execute este script na raiz do repositório."
  exit 1
}
$RepoRoot = $RepoRoot.Trim()
Set-Location $RepoRoot
Write-Info "Repositório: $RepoRoot"

# -----------------------------------------------------
# Função utilitária: executar (ou simular) comando
# usa Invoke-Expression (compatível no Windows/pwsh)
# -----------------------------------------------------
function Exec-Do {
  param(
    [Parameter(Mandatory=$true)] [string] $Cmd,
    [switch] $NoThrow
  )
  if ($DryRun) {
    Write-Host "[dry-run] $Cmd"
    return $null
  }
  Write-Info "Executando: $Cmd"
  try {
    $out = Invoke-Expression $Cmd 2>&1
    return $out
  } catch {
    if ($NoThrow) {
      Write-Warn "Comando falhou (NoThrow): $Cmd -> $($_.Exception.Message)"
      return $null
    } else {
      throw $_
    }
  }
}

# -----------------------------------------------------
# 1) Criar bundle (backup portátil)
# -----------------------------------------------------
if ($CreateBundle) {
  try {
    if (-not (Test-Path $BundleDir)) {
      Write-Info "Criando diretório de backups: $BundleDir"
      if (-not $DryRun) { New-Item -ItemType Directory -Path $BundleDir -Force | Out-Null }
    }

    # nome do bundle com timestamp e branch atual
    $branch = git rev-parse --abbrev-ref HEAD
    $timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
    $repoName = Split-Path -Leaf $RepoRoot
    $bundleFile = Join-Path $BundleDir ("{0}-{1}-{2}.bundle" -f $repoName, $branch, $timestamp)

    $cmd = "git bundle create `"$bundleFile`" --all"
    if ($DryRun) {
      Write-Host "[dry-run] $cmd"
    } else {
      Write-Info "Gerando bundle: $bundleFile"
      & git bundle create $bundleFile --all
      if ($LASTEXITCODE -ne 0) { throw "git bundle retornou código $LASTEXITCODE" }
      Write-Info "Bundle criado em: $bundleFile"
    }
  } catch {
    Write-Err "Erro gerando bundle: $($_.Exception.Message)"
    if (-not $RunPushScript) { exit 1 } else { Write-Warn "Continuando porque RunPushScript está ativo." }
  }
}

# -----------------------------------------------------
# 2) Executar push-to-github.ps1 (integração)
# -----------------------------------------------------
if ($RunPushScript) {
  Write-Info "Invocando push-to-github.ps1 (integração)."
  # Monta argumentos
  $argList = @()
  if ($ForcePush) { $argList += "-ForcePush" }
  if ($AutoRemoveCad) { $argList += "-AutoRemoveCad" }
  if ($PurgeHistory) { $argList += "-PurgeHistory" }
  if ($PushScriptArgs) {
    # parse simples dos argumentos passados como string
    $extraArgs = [System.Management.Automation.PSParser]::Tokenize($PushScriptArgs, [ref]$null) | ForEach-Object { $_.Content }
    $argList += $extraArgs
  }

  $cmdArgs = $argList -join " "

  if ($DryRun) {
    Write-Host "[dry-run] & `"$PushScriptPath`" $cmdArgs"
  } else {
    # Executa o script em uma nova instância de PowerShell (pwsh preferível)
    Write-Info "Chamando: $PushScriptPath $cmdArgs"

    # localizar qual executável PowerShell usar
    $pwExe = (Get-Command pwsh -ErrorAction SilentlyContinue)?.Source
    if (-not $pwExe) { $pwExe = (Get-Command powershell -ErrorAction SilentlyContinue)?.Source }

    if (-not $pwExe) {
      Write-Err "Nenhum executável PowerShell encontrado para executar $PushScriptPath."
    } else {
      # garantir que os argumentos são strings e 'achatar' listas
      $argList = $argList | ForEach-Object { [string]$_ }

      # montar argumentos finais: -NoProfile -ExecutionPolicy Bypass -File <script> <args...>
      $invokeArgs = @("-NoProfile","-ExecutionPolicy","Bypass","-File",$PushScriptPath) + $argList

      Write-Info "Executando PowerShell ($pwExe) com args: $($invokeArgs -join ' ')"
      & $pwExe $invokeArgs
      if ($LASTEXITCODE -ne 0) {
        Write-Err "push-to-github.ps1 retornou código $LASTEXITCODE. Verifique a saída do script chamado."
      } else {
        Write-Info "push-to-github.ps1 executado com sucesso (ExitCode 0)."
      }
    }
  }
}

# -----------------------------------------------------
# 3) Criar mirror e push para remote de backup (opcional)
# -----------------------------------------------------
if ($MirrorPush -and [string]::IsNullOrWhiteSpace($MirrorRemote)) {
  Write-Err "MirrorPush requisitado mas MirrorRemote vazio. Abortando etapa de mirror."
}

if ($MirrorPush -and -not [string]::IsNullOrWhiteSpace($MirrorRemote)) {
  Write-Info "Preparando mirror e push para remote de backup: $MirrorRemote"
  # cria diretório temporário
  $tmp = Join-Path $env:TEMP ("git-mirror-" + [guid]::NewGuid().ToString("N"))
  if (-not $DryRun) {
    New-Item -ItemType Directory -Path $tmp | Out-Null
  } else {
    Write-Host "[dry-run] mkdir $tmp"
  }

  try {
    # clone --mirror
    $cloneCmd = "git clone --mirror `"$RepoRoot`" `"$tmp`""
    Exec-Do -Cmd $cloneCmd

    # muda para o mirror e adicionar/atualizar remote backup
    Push-Location $tmp
    try {
      # remove origin (opcional) e adiciona remote de backup com nome 'backup'
      $existingBackup = & git remote get-url backup 2>$null
      if ($LASTEXITCODE -eq 0) {
        Write-Info "Remote 'backup' já existe; atualizando URL para $MirrorRemote"
        Exec-Do -Cmd ("git remote set-url backup `"$MirrorRemote`"")
      } else {
        Exec-Do -Cmd ("git remote add backup `"$MirrorRemote`"")
      }

      # push --mirror para backup
      $pushCmd = "git push backup --mirror"
      Exec-Do -Cmd $pushCmd
      Write-Info "Push mirror para backup concluído."
    } finally {
      Pop-Location
    }
  } catch {
    Write-Err "Erro durante mirror/push: $($_.Exception.Message)"
  } finally {
    if (-not $DryRun) {
      try { Remove-Item -Recurse -Force $tmp } catch { Write-Warn "Falha ao remover $tmp — remova manualmente se necessário." }
    } else {
      Write-Host "[dry-run] remover $tmp"
    }
  }
}

# -----------------------------------------------------
# 4) Sumário final
# -----------------------------------------------------
Write-Info "Operação finalizada."
if ($CreateBundle) { Write-Info "Bundle salvo em: $BundleDir (verifique o arquivo .bundle gerado)." }
if ($RunPushScript) { Write-Info "push-to-github.ps1 foi executado (verificar saída acima)." }
if ($MirrorPush) { Write-Info "Mirror push para remote: $MirrorRemote (verifique logs acima)." }

if ($DryRun) {
  Write-Warn "Dry-run: nenhum comando destrutivo foi realmente executado."
}

# fim
