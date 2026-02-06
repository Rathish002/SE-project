# Automated BFG Repo-Cleaner Script
# Removes exposed credentials from git history

param(
    [string]$RepoPath = "c:\projects\SE-project",
    [string]$BFGPath = "c:\bfg",
    [switch]$SkipDownload
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GIT HISTORY CLEANER - BFG Repo-Cleaner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Download BFG if needed
Write-Host "[1/7] Checking BFG Repo-Cleaner..." -ForegroundColor Yellow

if (-not (Test-Path "$BFGPath\bfg.jar") -and -not $SkipDownload) {
    Write-Host "  Downloading BFG Repo-Cleaner..." -ForegroundColor Yellow
    
    # Create BFG directory
    if (-not (Test-Path $BFGPath)) {
        New-Item -ItemType Directory -Path $BFGPath | Out-Null
    }
    
    # Download BFG
    $BFGUrl = "https://repo1.maven.org/maven2/com/madgag/bfg/1.13.0/bfg-1.13.0.jar"
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $BFGUrl -OutFile "$BFGPath\bfg.jar" -ErrorAction Stop
        Write-Host "  [OK] BFG downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Failed to download BFG" -ForegroundColor Red
        Write-Host "  Please download manually from: https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  [OK] BFG found at $BFGPath\bfg.jar" -ForegroundColor Green
}

# Step 2: Create secrets file
Write-Host ""
Write-Host "[2/7] Creating secrets file..." -ForegroundColor Yellow

$secretsFile = "$BFGPath\old-secrets.txt"
$secrets = @(
    "AIzaSyDCdnY6dl65ajLQjY9XiVy2V9z0jHDsZtA",
    "se-01-18cc8",
    "698206432143",
    "G-C23HP9D8GH",
    "762b399aaf23fa584bb9fa"
)

$secrets | Out-File -FilePath $secretsFile -Encoding UTF8 -Force
Write-Host "  [OK] Secrets file created" -ForegroundColor Green

# Step 3: Create mirror backup
Write-Host ""
Write-Host "[3/7] Creating backup mirror..." -ForegroundColor Yellow

$backupPath = "C:\projects\SE-project-backup.git"

if (Test-Path $backupPath) {
    Write-Host "  Removing old backup..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $backupPath -ErrorAction SilentlyContinue
}

try {
    Push-Location "C:\projects"
    & git clone --mirror SE-project SE-project-backup.git
    Write-Host "  [OK] Backup mirror created" -ForegroundColor Green
    Pop-Location
} catch {
    Write-Host "  [ERROR] Failed to create backup mirror" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Run BFG
Write-Host ""
Write-Host "[4/7] Running BFG to remove secrets..." -ForegroundColor Yellow

try {
    Push-Location $BFGPath
    & java -jar bfg.jar --replace-text $secretsFile $backupPath 2>&1 | ForEach-Object {
        Write-Host "  $_"
    }
    Write-Host "  [OK] BFG completed" -ForegroundColor Green
    Pop-Location
} catch {
    Write-Host "  [ERROR] BFG failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Expire reflog and garbage collect
Write-Host ""
Write-Host "[5/7] Cleaning up repository..." -ForegroundColor Yellow

try {
    Push-Location $backupPath
    
    & git reflog expire --expire=now --all
    Write-Host "  Expired reflog..." -ForegroundColor Gray
    
    & git gc --prune=now --aggressive
    Write-Host "  Ran garbage collection..." -ForegroundColor Gray
    
    Write-Host "  [OK] Repository cleaned" -ForegroundColor Green
    Pop-Location
} catch {
    Write-Host "  [ERROR] Cleanup failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# Step 6: Push cleaned history
Write-Host ""
Write-Host "[6/7] Pushing cleaned history to remote..." -ForegroundColor Yellow
Write-Host "  [WARNING] This will rewrite your remote repository history!" -ForegroundColor Yellow
Write-Host "  Make sure all team members know about this change" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Continue with force push? (yes/no)"

if ($response -ne "yes") {
    Write-Host "  [CANCELLED] Push aborted" -ForegroundColor Yellow
    exit 0
}

try {
    Push-Location $backupPath
    & git push --force
    Write-Host "  [OK] History pushed successfully" -ForegroundColor Green
    Pop-Location
} catch {
    Write-Host "  [ERROR] Push failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host "  Your backup is at: $backupPath" -ForegroundColor Yellow
    exit 1
}

# Step 7: Update local repository
Write-Host ""
Write-Host "[7/7] Updating local repository..." -ForegroundColor Yellow

try {
    Push-Location $RepoPath
    & git pull
    Write-Host "  [OK] Local repository updated" -ForegroundColor Green
    Pop-Location
} catch {
    Write-Host "  [WARNING] Pull may have conflicts" -ForegroundColor Yellow
    Write-Host "  Error: $_" -ForegroundColor Yellow
}

# Cleanup
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] GIT HISTORY CLEANED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backup location (safe to delete after verification):" -ForegroundColor Yellow
Write-Host "  $backupPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Verify the cleaned repo: git log --oneline" -ForegroundColor Yellow
Write-Host "  2. Search for old credentials: git grep 'AIzaSyDCdnY6dl65ajLQjY9XiVy2V9z0jHDsZtA'" -ForegroundColor Yellow
Write-Host "  3. Should return: fatal: your current working directory may be broken" -ForegroundColor Yellow
Write-Host "  4. Notify your team about the force push" -ForegroundColor Yellow
Write-Host ""
