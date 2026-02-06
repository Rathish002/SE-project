# Team Member Setup Script
# Run this after cloning the repository

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SE-PROJECT SETUP - Team Member" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Quick setup: Just enter your API key and you're done!" -ForegroundColor Yellow
Write-Host ""

# Step 1: Create .env.local from template
Write-Host "[1/3] Creating .env.local..." -ForegroundColor Yellow
Copy-Item "frontend\.env.example" "frontend\.env.local" -Force
Write-Host "  [OK] Environment file created" -ForegroundColor Green

# Step 2: Ask for API Key
Write-Host ""
Write-Host "[2/3] Firebase API Key" -ForegroundColor Yellow
Write-Host ""
Write-Host "Get your API key from your team lead via secure message" -ForegroundColor Cyan
Write-Host ""

$apiKey = Read-Host "Enter your Firebase API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host ""
    Write-Host "  [ERROR] API Key cannot be empty!" -ForegroundColor Red
    exit 1
}

if ($apiKey -eq "YOUR_API_KEY_HERE") {
    Write-Host ""
    Write-Host "  [ERROR] Please enter the actual API Key, not the placeholder" -ForegroundColor Red
    exit 1
}

# Update .env.local with the API key
(Get-Content "frontend\.env.local") -replace 'YOUR_API_KEY_HERE', $apiKey | Set-Content "frontend\.env.local"
Write-Host "  [OK] API Key saved" -ForegroundColor Green

# Step 3: Install dependencies
Write-Host ""
Write-Host "[3/3] Installing dependencies..." -ForegroundColor Yellow

Push-Location "frontend"
npm install 2>&1 | Where-Object { $_ -match "added|up to date|packages" } | ForEach-Object {
    Write-Host "  $_" -ForegroundColor Green
}
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step - start the development server:" -ForegroundColor Yellow
Write-Host "  .\start-dev.ps1" -ForegroundColor Cyan
Write-Host ""
