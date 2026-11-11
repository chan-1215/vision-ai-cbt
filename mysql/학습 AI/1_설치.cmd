@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-plugin.ps1"
if errorlevel 1 goto failed
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-ai.ps1"
if errorlevel 1 goto failed
echo Ready. Restart MySQL Workbench and open Tools - SQL AI.
pause
exit /b 0
:failed
echo Setup failed. Please check the message above.
pause
exit /b 1
