@echo off
cd /d "%~dp0"
where pwsh >nul 2>&1
if %ERRORLEVEL%==0 (
  set "PSH=pwsh"
) else (
  set "PSH=%SystemRoot%\system32\WindowsPowerShell\v1.0\powershell.exe"
)
echo.
echo [i] Usando PowerShell: %PSH%
echo [i] Chamando scripts\backup-and-push.ps1 -CreateBundle
echo.
"%PSH%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\backup-and-push.ps1" -CreateBundle
echo.
if exist "%~dp0backups" (
  explorer "%~dp0backups"
) else (
  echo [i] Pasta backups nao encontrada.
)
echo.
echo [i] Operacao finalizada. Pressione qualquer tecla para fechar...
pause >nul
exit /b 0
