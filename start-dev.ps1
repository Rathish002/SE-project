# Start Development Server
# One-command setup and run for localhost testing

param(
    [switch]$Fresh,
    [switch]$Help
)

if ($Help) {
    Write-Host ""
    Write-Host "USAGE: .\start-dev.ps1 [OPTIONS]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host "  -Fresh    Reinstall all dependencies and clear cache" -ForegroundColor Gray
    Write-Host "  -Help     Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\start-dev.ps1              # Start normally" -ForegroundColor Gray
    Write-Host "  .\start-dev.ps1 -Fresh       # Clean install and start" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SE-PROJECT - Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check .env.local
Write-Host "[1/4] Checking Firebase credentials..." -ForegroundColor Yellow

if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "  [WARNING] .env.local not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Please run first-time setup:" -ForegroundColor Yellow
    Write-Host "    .\setup-team-member.ps1" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Verify credentials are filled in
$envContent = Get-Content "frontend\.env.local" -Raw
if ($envContent -match "your_api_key_here|your_project_id") {
    Write-Host "  [ERROR] .env.local has placeholder values!" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Please update with actual Firebase credentials:" -ForegroundColor Yellow
    Write-Host "    code frontend\.env.local" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "  [OK] Firebase credentials configured" -ForegroundColor Green

# Step 2: Install/Update dependencies
Write-Host ""
Write-Host "[2/4] Checking dependencies..." -ForegroundColor Yellow

Push-Location "frontend"

if ($Fresh -or -not (Test-Path "node_modules")) {
    if ($Fresh) {
        Write-Host "  [FRESH] Clearing node_modules..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
        Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
    }
    
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install 2>&1 | ForEach-Object {
        if ($_ -match "added|up to date") {
            Write-Host "    $_" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  [OK] Dependencies already installed" -ForegroundColor Green
}

Pop-Location

# Step 3: Clear browser cache (optional)
Write-Host ""
Write-Host "[3/4] Preparing browser environment..." -ForegroundColor Yellow
Write-Host "  [OK] Ready to start" -ForegroundColor Green

# Step 4: Start development server
Write-Host ""
Write-Host "[4/4] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dev server starting on:" -ForegroundColor Green
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the dev server
Push-Location "frontend"
npm start
Pop-Location
