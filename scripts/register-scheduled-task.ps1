# register-scheduled-task.ps1
param(
  [string]$TaskName = "appengweb-backup-daily",
  [string]$Time = "02:00",                      # HH:mm (24h) — horário local
  [string]$User = "$env:USERNAME",              # conta que executará a tarefa
  [switch]$RunWithHighestPrivileges = $false
)

$scriptPath = (Resolve-Path "$PSScriptRoot\backup-and-push.ps1").Path
$pwsh = (Get-Command pwsh -ErrorAction SilentlyContinue)?.Source
if (-not $pwsh) { $pwsh = (Get-Command powershell -ErrorAction SilentlyContinue).Source }

if (-not $pwsh) { Write-Error "Nenhum PowerShell encontrado para executar a tarefa agendada."; exit 1 }

$action = New-ScheduledTaskAction -Execute $pwsh -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -CreateBundle"
$trigger = New-ScheduledTaskTrigger -Daily -At (Get-Date -Hour ([int]$Time.Split(':')[0]) -Minute ([int]$Time.Split(':')[1]))
$principal = New-ScheduledTaskPrincipal -UserId $User -LogonType Interactive

$task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Settings (New-ScheduledTaskSettingsSet -Compatibility Win8 -StartWhenAvailable)

Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force

Write-Host "[i] Tarefa agendada criada: $TaskName - rodando diariamente às $Time como $User"
Write-Host "[i] Para remover: Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false"
