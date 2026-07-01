@echo off
:: Run this manually when you turn your PC on before 3:30 AM
:: to prevent Windows from going back to sleep.
echo Keeping PC awake - close this window when you're done.
echo.
powershell -ExecutionPolicy Bypass -Command ^
  "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class PM { [DllImport(\"kernel32.dll\")] public static extern uint SetThreadExecutionState(uint f); public const uint ES_CONTINUOUS=0x80000000; public const uint ES_SYSTEM_REQUIRED=0x00000001; public const uint ES_DISPLAY_REQUIRED=0x00000002; }'; ^
   [PM]::SetThreadExecutionState([PM]::ES_CONTINUOUS -bor [PM]::ES_SYSTEM_REQUIRED -bor [PM]::ES_DISPLAY_REQUIRED) | Out-Null; ^
   Write-Host 'Sleep blocked. Press Ctrl+C to release.'; ^
   while($true) { Start-Sleep 60; Write-Host \"$(Get-Date -Format 'HH:mm') - still awake...\" }"
