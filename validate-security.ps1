# Security Validation Script
# Run this before making the repository public

Write-Host ""
Write-Host "SECURITY VALIDATION CHECK" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$hasIssues = $false

# Check 1: Search for exposed API keys
Write-Host ""
Write-Host "[1/7] Checking for exposed API keys..." -ForegroundColor Yellow
$apiKeyPatterns = @(
    "AIza[A-Za-z0-9_-]{35}",
    "sk-[a-zA-Z0-9]{48}",
    "pk_live_[a-zA-Z0-9]{24}"
)

foreach ($pattern in $apiKeyPatterns) {
    $results = git grep -E $pattern 2>$null
    if ($results) {
        Write-Host "  [X] FOUND API KEY PATTERN: $pattern" -ForegroundColor Red
        Write-Host "     $results" -ForegroundColor Red
        $hasIssues = $true
    }
}

if (-not $hasIssues) {
    Write-Host "  [OK] No API key patterns found in tracked files" -ForegroundColor Green
}

# Check 2: Search for database credentials
Write-Host ""
Write-Host "[2/7] Checking for database credentials..." -ForegroundColor Yellow
$dbResults = git grep -E "(postgresql|mysql|mongodb)://[^u].*:[^@]+@" 2>$null
if ($dbResults) {
    # Filter out example/placeholder patterns
    $realCredentials = $dbResults | Where-Object { 
        $_ -notmatch "username:password" -and 
        $_ -notmatch "user:pass" -and
        $_ -notmatch "mypassword"
    }
    if ($realCredentials) {
        Write-Host "  [X] FOUND DATABASE CREDENTIALS" -ForegroundColor Red
        Write-Host "     $realCredentials" -ForegroundColor Red
        $hasIssues = $true
    } else {
        Write-Host "  [OK] Only placeholder database URLs found" -ForegroundColor Green
    }
} else {
    Write-Host "  [OK] No database credentials found" -ForegroundColor Green
}

# Check 3: Search for private keys
Write-Host ""
Write-Host "[3/7] Checking for private keys..." -ForegroundColor Yellow
$keyPatterns = @(
    "BEGIN.*PRIVATE KEY",
    "client_secret",
    "private_key_id"
)

foreach ($pattern in $keyPatterns) {
    $results = git grep -i $pattern 2>$null | Where-Object { $_ -notmatch "\.md:" }
    if ($results) {
        Write-Host "  [!] FOUND PRIVATE KEY REFERENCE: $pattern" -ForegroundColor Yellow
        Write-Host "     $results" -ForegroundColor Yellow
        Write-Host "     Please verify this is not a real key" -ForegroundColor Yellow
        $hasIssues = $true
    }
}

if (-not $hasIssues) {
    Write-Host "  [OK] No private keys found" -ForegroundColor Green
}

# Check 4: Verify .env files are not tracked
Write-Host ""
Write-Host "[4/7] Checking for tracked .env files..." -ForegroundColor Yellow
$envFiles = git ls-files | Where-Object { $_ -match "\.env$|\.env\.local$|\.env\..*\.local$" }
if ($envFiles) {
    Write-Host "  [X] TRACKED .ENV FILES FOUND:" -ForegroundColor Red
    foreach ($file in $envFiles) {
        Write-Host "     $file" -ForegroundColor Red
    }
    $hasIssues = $true
} else {
    Write-Host "  [OK] No .env files are tracked" -ForegroundColor Green
}

# Check 5: Verify .gitignore is properly configured
Write-Host ""
Write-Host "[5/7] Verifying .gitignore configuration..." -ForegroundColor Yellow
$gitignoreContent = Get-Content .gitignore -Raw
$requiredPatterns = @(".env", "node_modules", "build")
$missingPatterns = @()

foreach ($pattern in $requiredPatterns) {
    if ($gitignoreContent -notmatch [regex]::Escape($pattern)) {
        $missingPatterns += $pattern
    }
}

if ($missingPatterns.Count -gt 0) {
    Write-Host "  [!] MISSING GITIGNORE PATTERNS:" -ForegroundColor Yellow
    foreach ($pattern in $missingPatterns) {
        Write-Host "     $pattern" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [OK] .gitignore is properly configured" -ForegroundColor Green
}

# Check 6: Search for hardcoded passwords
Write-Host ""
Write-Host "[6/7] Checking for hardcoded passwords..." -ForegroundColor Yellow
$passwordResults = git grep -iE "password\s*=|passwd\s*=|pwd\s*=" 2>$null | 
    Where-Object { 
        $_ -notmatch "\.md:" -and 
        $_ -notmatch "example" -and
        $_ -notmatch "placeholder" -and
        $_ -notmatch "your_password" -and
        $_ -notmatch "mypassword" -and
        $_ -notmatch "changePassword" -and
        $_ -notmatch "updatePassword"
    }
if ($passwordResults) {
    Write-Host "  [!] POTENTIAL HARDCODED PASSWORDS:" -ForegroundColor Yellow
    Write-Host "     $passwordResults" -ForegroundColor Yellow
    Write-Host "     Please verify these are not real passwords" -ForegroundColor Yellow
} else {
    Write-Host "  [OK] No hardcoded passwords found" -ForegroundColor Green
}

# Check 7: Verify example files exist
Write-Host ""
Write-Host "[7/7] Checking for example environment files..." -ForegroundColor Yellow
$exampleFiles = @("frontend\.env.example", "server\.env.example")
$missingExamples = @()

foreach ($file in $exampleFiles) {
    if (-not (git ls-files $file)) {
        $missingExamples += $file
    }
}

if ($missingExamples.Count -gt 0) {
    Write-Host "  [!] MISSING EXAMPLE FILES:" -ForegroundColor Yellow
    foreach ($file in $missingExamples) {
        Write-Host "     $file" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [OK] All example environment files exist" -ForegroundColor Green
}

# Final Summary
Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
if ($hasIssues) {
    Write-Host "[FAIL] SECURITY ISSUES FOUND!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Your repository is NOT safe to make public." -ForegroundColor Red
    Write-Host "Please fix the issues above before proceeding." -ForegroundColor Red
    Write-Host ""
    Write-Host "See SECURITY_CHECKLIST.md for detailed remediation steps." -ForegroundColor Yellow
    Write-Host ""
    exit 1
} else {
    Write-Host "[PASS] NO CRITICAL SECURITY ISSUES FOUND" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT REMINDERS:" -ForegroundColor Yellow
    Write-Host "  1. This script only checks CURRENT files" -ForegroundColor Yellow
    Write-Host "  2. Credentials may still exist in GIT HISTORY" -ForegroundColor Yellow
    Write-Host "  3. You MUST clean git history before going public" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "See SECURITY_CHECKLIST.md for complete pre-publication steps." -ForegroundColor Cyan
    Write-Host ""
    exit 0
}
