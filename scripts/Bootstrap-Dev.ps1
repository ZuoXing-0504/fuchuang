[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$SkipBackend,
    [switch]$SkipFrontend
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root

function Copy-ExampleFile {
    param(
        [Parameter(Mandatory = $true)][string]$ExamplePath,
        [Parameter(Mandatory = $true)][string]$TargetPath
    )

    if ($Force -or -not (Test-Path $TargetPath)) {
        Copy-Item -LiteralPath $ExamplePath -Destination $TargetPath -Force
        Write-Host "Created $TargetPath from $ExamplePath"
    }
}

function Invoke-HostPython {
    param([string[]]$Arguments)

    if (Get-Command py -ErrorAction SilentlyContinue) {
        & py -3 @Arguments
        return
    }
    if (Get-Command python -ErrorAction SilentlyContinue) {
        & python @Arguments
        return
    }

    throw 'Python 3.11+ is required but was not found in PATH.'
}

Copy-ExampleFile '.env.example' '.env'
Copy-ExampleFile 'front\web-admin\.env.example' 'front\web-admin\.env.local'
Copy-ExampleFile 'front\web-student\.env.example' 'front\web-student\.env.local'

if (-not $SkipBackend) {
    if (-not (Test-Path '.\.venv\Scripts\python.exe')) {
        Write-Host 'Creating Python virtual environment...'
        Invoke-HostPython -Arguments @('-m', 'venv', '.venv')
    }

    Write-Host 'Installing backend dependencies...'
    & '.\.venv\Scripts\python.exe' -m pip install --upgrade pip
    & '.\.venv\Scripts\python.exe' -m pip install -r requirements.txt
}

if (-not $SkipFrontend) {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        throw 'npm was not found in PATH. Please install Node.js 20+ first.'
    }

    foreach ($project in @('front\web-admin', 'front\web-student')) {
        Push-Location $project
        try {
            if ($Force -or -not (Test-Path 'node_modules')) {
                Write-Host "Installing frontend dependencies in $project..."
                npm install
            }
            else {
                Write-Host "Skipping npm install in $project because node_modules already exists."
            }
        }
        finally {
            Pop-Location
        }
    }
}

Write-Host ''
Write-Host 'Bootstrap complete.'
Write-Host 'Next step: .\scripts\Start-Dev.ps1'
