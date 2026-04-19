[CmdletBinding()]
param(
    [switch]$SkipFrontendBuild
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root

if (-not (Test-Path '.\.venv\Scripts\python.exe')) {
    throw 'Virtual environment was not found. Run .\scripts\Bootstrap-Dev.ps1 first.'
}

Write-Host 'Running Python test suite...'
& '.\.venv\Scripts\python.exe' -m unittest discover -s tests -p 'test_*.py'

if (-not $SkipFrontendBuild) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        throw 'npm was not found in PATH. Please install Node.js 20+ first.'
    }

    foreach ($project in @('front\web-admin', 'front\web-student')) {
        Push-Location $project
        try {
            Write-Host "Running frontend build in $project..."
            npm run build
        }
        finally {
            Pop-Location
        }
    }
}

Write-Host 'All checks completed successfully.'
