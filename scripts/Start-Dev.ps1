[CmdletBinding()]
param(
    [switch]$SkipBootstrap,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root

if (-not $SkipBootstrap) {
    & (Join-Path $PSScriptRoot 'Bootstrap-Dev.ps1')
}

function Start-ServiceWindow {
    param(
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string]$Command
    )

    $commandText = "Set-Location '$WorkingDirectory'; $Command"
    Start-Process powershell -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command', $commandText | Out-Null
}

if (-not $FrontendOnly) {
    Start-ServiceWindow -WorkingDirectory $root -Command "& '.\.venv\Scripts\python.exe' app.py"
}

if (-not $BackendOnly) {
    Start-ServiceWindow -WorkingDirectory (Join-Path $root 'front\web-admin') -Command 'npm run dev'
    Start-ServiceWindow -WorkingDirectory (Join-Path $root 'front\web-student') -Command 'npm run dev'
}

Write-Host 'Development services are starting in separate PowerShell windows.'
Write-Host 'Backend:        http://127.0.0.1:5000'
Write-Host 'Admin frontend: http://127.0.0.1:3200'
Write-Host 'Student front:  http://127.0.0.1:3201'
