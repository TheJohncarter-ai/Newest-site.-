@echo off
net session >nul 2>&1
if %errorLevel% neq 0 (
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo Removing JPC-WakeAt330 task...
schtasks /delete /TN "JPC-WakeAt330" /F >nul 2>&1
if %errorLevel% equ 0 (
    echo Done. Task removed.
) else (
    echo Task not found or already removed.
)

:: Clean up temp XML if it exists
del /f /q "%TEMP%\jpc-wake.xml" >nul 2>&1

pause
