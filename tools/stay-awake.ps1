# Runs at 3:30 AM via Task Scheduler.
# Prevents Windows from sleeping for 2 hours so the PC stays active.

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class PowerMgmt {
    [DllImport("kernel32.dll", SetLastError=true)]
    public static extern uint SetThreadExecutionState(uint esFlags);
    public const uint ES_CONTINUOUS       = 0x80000000;
    public const uint ES_SYSTEM_REQUIRED  = 0x00000001;
    public const uint ES_DISPLAY_REQUIRED = 0x00000002;
}
"@

# Tell Windows: system must stay on, keep display on
[PowerMgmt]::SetThreadExecutionState(
    [PowerMgmt]::ES_CONTINUOUS -bor
    [PowerMgmt]::ES_SYSTEM_REQUIRED -bor
    [PowerMgmt]::ES_DISPLAY_REQUIRED
) | Out-Null

Write-Host "$(Get-Date -Format 'HH:mm:ss') - PC awake, sleep blocked for 2 hours."

# Hold for 2 hours (7200 seconds), then release
Start-Sleep -Seconds 7200

# Release the sleep block
[PowerMgmt]::SetThreadExecutionState([PowerMgmt]::ES_CONTINUOUS) | Out-Null
Write-Host "$(Get-Date -Format 'HH:mm:ss') - Sleep block released."
