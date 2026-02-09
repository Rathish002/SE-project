$ErrorActionPreference = 'Stop'

$frontendRoot = Join-Path $PSScriptRoot '..'
Set-Location $frontendRoot

$reportPath = Join-Path $frontendRoot 'test-report.txt'

npm test -- --coverage --watchAll=false | Tee-Object -FilePath $reportPath

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
