@echo off
rem run-backup.bat (simples) - apenas cria bundle chamando o PowerShell

cd /d "%~dp0"

rem detecta pwsh no PATH; se não existir usa powershell nativo
where pwsh >nul 2>&1
if %ERRORLEVEL%==0 (
  set "PSH=pwsh"
) else (
  set "PSH=%SystemRoot%\system32\WindowsPowerShell\v1.0\powershell.exe"
)

echo.
echo [i] Usando PowerShell: %PSH%
echo [i] Chamando backup-and-push.ps1 -CreateBundle
echo.

"%PSH%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0backup-and-push.ps1" -CreateBundle

echo.
echo [i] Operacao finalizada. Pressione qualquer tecla para fechar...
pause >nul
exit /b 0
