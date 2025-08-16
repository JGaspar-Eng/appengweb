# create-desktop-shortcut.ps1
param(
  [string]$TargetBat = "$PSScriptRoot\run-backup.bat",
  [string]$ShortcutName = "CriarBundle - appengweb.lnk"
)

$WshShell = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath("Desktop")
$link = $WshShell.CreateShortcut( Join-Path $desktop $ShortcutName )
$link.TargetPath = $TargetBat
$link.WorkingDirectory = Split-Path $TargetBat
$link.WindowStyle = 1
$link.IconLocation = "$TargetBat,0"
$link.Save()

Write-Host "[i] Atalho criado no Desktop:" (Join-Path $desktop $ShortcutName)
