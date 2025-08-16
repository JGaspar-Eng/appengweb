# cleanup-bundles.ps1
param(
  [string]$BundleDir = "$PSScriptRoot\backups",
  [int]$KeepLast = 7,
  [int]$OlderThanDays = 0,        # se 0 => não usa esta regra
  [switch]$WhatIf
)

if (-not (Test-Path $BundleDir)) {
  Write-Host "[i] Pasta de bundles nao existe: $BundleDir"
  exit 0
}

$files = Get-ChildItem -Path $BundleDir -Filter "*.bundle" -File | Sort-Object LastWriteTime -Descending

if ($OlderThanDays -gt 0) {
  $cutoff = (Get-Date).AddDays(-$OlderThanDays)
  $old = $files | Where-Object { $_.LastWriteTime -lt $cutoff }
  foreach ($f in $old) {
    if ($WhatIf) { Write-Host "[whatif] Remove $($f.FullName)" }
    else { Remove-Item -LiteralPath $f.FullName -Force; Write-Host "[i] Removido $($f.Name)" }
  }
} else {
  if ($KeepLast -lt 0) { Write-Error "KeepLast deve ser >= 0"; exit 1 }
  $toRemove = $files | Select-Object -Skip $KeepLast
  foreach ($f in $toRemove) {
    if ($WhatIf) { Write-Host "[whatif] Remove $($f.FullName)" }
    else { Remove-Item -LiteralPath $f.FullName -Force; Write-Host "[i] Removido $($f.Name)" }
  }
}

Write-Host "[i] Operacao concluida."
