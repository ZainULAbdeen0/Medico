<#
.SYNOPSIS
    Deploys mediko_frontend and mediko_backend on IIS.

.DESCRIPTION
    Pulls latest from the development branch, installs dependencies,
    builds the frontend, builds the backend, and recycles the IIS
    application pool so both sites pick up the new code.

.NOTES
    Run from an elevated PowerShell prompt (Administrator) - the
    application-pool recycle and site restart require admin rights.
    Execution policy: if blocked, run once with
        powershell -ExecutionPolicy Bypass -File .\deploy.ps1
#>

[CmdletBinding()]
param(
    [string]$Branch     = "development",
    [string]$AppPool    = "DefaultAppPool",
    [string]$FrontSite  = "mediko_frontend",
    [string]$BackSite   = "mediko_backend"
)

$ErrorActionPreference = "Stop"
$ProgressPreference    = "SilentlyContinue"

$RepoRoot     = $PSScriptRoot
$FrontendPath = Join-Path $RepoRoot "frontend"
$BackendPath  = Join-Path $RepoRoot "backend"
$LogPath      = Join-Path $RepoRoot "deploy.log"

function Write-Step {
    param([string]$Message)
    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line  = "[$stamp] $Message"
    Write-Host $line -ForegroundColor Cyan
    Add-Content -Path $LogPath -Value $line
}

function Invoke-Native {
    param(
        [Parameter(Mandatory = $true)] [string]$Exe,
        [Parameter(Mandatory = $true)] [string[]]$ArgList,
        [Parameter(Mandatory = $true)] [string]$WorkDir,
        [string]$Label = ""
    )
    Push-Location $WorkDir
    try {
        & $Exe @ArgList
        if ($LASTEXITCODE -ne 0) {
            throw "$Label failed (exit $LASTEXITCODE) in $WorkDir : $Exe $($ArgList -join ' ')"
        }
    }
    finally {
        Pop-Location
    }
}

try {
    Write-Step "Deploy started. Repo=$RepoRoot Branch=$Branch"

    # Force npm to install devDependencies (typescript, vite) regardless of any
    # system-wide NODE_ENV=production setting. Only affects this script's scope.
    $env:NODE_ENV = "development"
    $env:NPM_CONFIG_PRODUCTION = "false"

    # 1. Pull latest
    Write-Step "Fetching and resetting to origin/$Branch"
    Invoke-Native -Exe "git" -ArgList @("fetch","origin",$Branch)         -WorkDir $RepoRoot -Label "git fetch"
    Invoke-Native -Exe "git" -ArgList @("checkout",$Branch)               -WorkDir $RepoRoot -Label "git checkout"
    Invoke-Native -Exe "git" -ArgList @("reset","--hard","origin/$Branch") -WorkDir $RepoRoot -Label "git reset"

    # 2. Backend install + build
    Write-Step "Backend: npm ci (incl. dev deps)"
    Invoke-Native -Exe "npm" -ArgList @("ci","--include=dev") -WorkDir $BackendPath -Label "backend npm ci"

    Write-Step "Backend: npm run build"
    Invoke-Native -Exe "npm" -ArgList @("run","build") -WorkDir $BackendPath -Label "backend build"

    if (-not (Test-Path (Join-Path $BackendPath "dist\server.js"))) {
        throw "Backend build finished but dist\server.js is missing - tsc did not emit output."
    }

    # 3. Frontend install + build
    Write-Step "Frontend: npm ci (incl. dev deps)"
    Invoke-Native -Exe "npm" -ArgList @("ci","--include=dev") -WorkDir $FrontendPath -Label "frontend npm ci"

    Write-Step "Frontend: npm run build"
    Invoke-Native -Exe "npm" -ArgList @("run","build") -WorkDir $FrontendPath -Label "frontend build"

    if (-not (Test-Path (Join-Path $FrontendPath "dist\index.html"))) {
        throw "Frontend build finished but dist\index.html is missing - vite did not emit output."
    }

    # 4. Restart IIS apps
    Write-Step "Loading WebAdministration module"
    Import-Module WebAdministration -ErrorAction Stop

    Write-Step "Recycling app pool: $AppPool"
    Restart-WebAppPool -Name $AppPool

    foreach ($site in @($FrontSite, $BackSite)) {
        Write-Step "Restarting site: $site"
        try {
            Stop-Website  -Name $site -ErrorAction Stop
        } catch {
            Write-Step "  (stop) site $site was not running or could not stop cleanly: $($_.Exception.Message)"
        }
        Start-Website -Name $site
    }

    # 5. Touch web.config to force iisnode to pick up new dist
    Write-Step "Touching backend web.config to trigger iisnode reload"
    (Get-Item (Join-Path $BackendPath "web.config")).LastWriteTime = Get-Date

    Write-Step "Deploy finished successfully."
    Write-Host "`nDONE." -ForegroundColor Green
}
catch {
    $err = $_ | Out-String
    Write-Step "DEPLOY FAILED: $err"
    Write-Host "`nDEPLOY FAILED - see deploy.log" -ForegroundColor Red
    exit 1
}
