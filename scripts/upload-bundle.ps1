# upload-bundle.ps1
param(
  [string]$BundlePath = "",                # se vazio, pega o mais recente
  [ValidateSet("scp","gh")] [string]$Mode = "scp",
  # SCP settings (preencha ou passe por params)
  [string]$SshUser = "usuario",
  [string]$SshHost = "backup.exemplo.com",
  [int]$SshPort = 22,
  [string]$SshDestPath = "/home/usuario/backups/",
  [string]$PscpPath = "pscp.exe",          # opcional: caminho para pscp (PuTTY) ou `scp` se estiver em PATH

  # GH release settings (requer gh CLI e estar logado)
  [string]$GhTag = "backup-$(Get-Date -Format yyyyMMdd_HHmmss)",
  [string]$GhRepo = "JGaspar-Eng/appengweb",
  [string]$GhReleaseName = "",
  [switch]$GhDraft
)

# pick most recent if not given
if (-not $BundlePath -or $BundlePath -eq "") {
  $latest = Get-ChildItem -Path "$PSScriptRoot\backups" -Filter "*.bundle" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $latest) { Write-Error "Nenhum bundle encontrado em $PSScriptRoot\backups"; exit 1 }
  $BundlePath = $latest.FullName
}

Write-Host "[i] Arquivo selecionado: $BundlePath"

if ($Mode -eq "scp") {
  # use scp (OpenSSH) or pscp (PuTTY)
  if (Get-Command scp -ErrorAction SilentlyContinue) {
    $scp = "scp"
    $args = @("-P",$SshPort.ToString(), $BundlePath, "$SshUser@$SshHost:`"$SshDestPath`"")
    Write-Host "[i] Usando scp: $scp $($args -join ' ')"
    & scp @args
    if ($LASTEXITCODE -ne 0) { Write-Error "scp retornou $LASTEXITCODE" } else { Write-Host "[i] Upload SCP concluido." }
  } elseif (Test-Path $PscpPath) {
    Write-Host "[i] Usando pscp: $PscpPath"
    $cmd = "$PscpPath -P $SshPort `"$BundlePath`" $SshUser@$SshHost:`"$SshDestPath`""
    Write-Host "[i] $cmd"
    Invoke-Expression $cmd
  } else {
    Write-Error "Nenhum scp/pscp detectado. Instale OpenSSH client (Windows) ou puTTY/pscp."
  }
} elseif ($Mode -eq "gh") {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "gh CLI nao encontrado. Instale e autentique com 'gh auth login' antes."
    exit 1
  }
  if (-not $GhReleaseName) { $GhReleaseName = "Backup $GhTag" }
  $draftFlag = $GhDraft ? "--draft" : ""
  Write-Host "[i] Criando release: tag=$GhTag repo=$GhRepo"
  gh release create $GhTag $BundlePath --repo $GhRepo --title "$GhReleaseName" --notes "Backup bundle $GhTag" $draftFlag
  if ($LASTEXITCODE -ne 0) { Write-Error "gh release retornou $LASTEXITCODE" } else { Write-Host "[i] Release criado e arquivo enviado." }
}
