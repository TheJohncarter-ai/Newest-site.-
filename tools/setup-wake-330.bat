@echo off
:: Self-elevate to Administrator if not already elevated
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo.
echo === JPC Wake-At-3:30 AM Setup ===
echo.

:: Delete old task if it exists
schtasks /delete /TN "JPC-WakeAt330" /F >nul 2>&1

:: Create task (DAILY, runs every day at 3:30 AM)
echo [1/3] Creating daily 3:30 AM scheduled task...
schtasks /create /TN "JPC-WakeAt330" ^
  /TR "powershell -ExecutionPolicy Bypass -File \"%~dp0stay-awake.ps1\"" ^
  /SC DAILY /ST 03:30 /RL HIGHEST /IT /F
if %errorLevel% neq 0 (
    echo ERROR: Failed to create task. Make sure you run as Administrator.
    pause
    exit /b 1
)

:: Patch XML to add WakeToRun=true (requires admin, which we now have)
echo [2/3] Enabling wake-from-hibernate on the task...
powershell -ExecutionPolicy Bypass -Command ^
  "$xml = schtasks /query /TN 'JPC-WakeAt330' /XML ONE 2>$null; ^
   if ($xml) { ^
     $xml = $xml -replace '<WakeToRun>false</WakeToRun>','<WakeToRun>true</WakeToRun>'; ^
     if ($xml -notmatch 'WakeToRun') { $xml = $xml -replace '</Settings>','<WakeToRun>true</WakeToRun></Settings>' }; ^
     $tmp = \"$env:TEMP\jpc-wake.xml\"; ^
     $xml | Out-File $tmp -Encoding utf8; ^
     schtasks /create /TN 'JPC-WakeAt330' /XML $tmp /F; ^
     Write-Host 'WakeToRun = true applied successfully.' ^
   } else { Write-Host 'WARNING: Could not read task XML.' }"

echo [3/3] Verifying task...
schtasks /query /TN "JPC-WakeAt330" /FO LIST | findstr /i "task\|next\|status\|wake"

echo.
echo Done. Your PC will wake from hibernate daily at 3:30 AM and stay awake.
echo.
pause
