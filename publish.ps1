#!/usr/bin/env pwsh
# Narrative OS Publish Script for Windows
# Publishes both engine and CLI packages to npm

$ErrorActionPreference = "Stop"

Write-Host "🚀 Narrative OS Publisher" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to npm
try {
    $npmUser = npm whoami 2>$null
    Write-Host "✅ Logged in as: $npmUser" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to npm" -ForegroundColor Red
    Write-Host "Run: npm login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Get version bump type
if ($args.Count -eq 0) {
    Write-Host "Usage: .\publish.ps1 [patch|minor|major]"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\publish.ps1 patch   # 0.1.0 → 0.1.1"
    Write-Host "  .\publish.ps1 minor   # 0.1.0 → 0.2.0"
    Write-Host "  .\publish.ps1 major   # 0.1.0 → 1.0.0"
    exit 1
}

$VERSION_TYPE = $args[0]

# Confirm
Write-Host "⚠️  This will:" -ForegroundColor Yellow
Write-Host "  1. Build the project"
Write-Host "  2. Bump version ($VERSION_TYPE)"
Write-Host "  3. Publish @narrative-os/engine"
Write-Host "  4. Publish @narrative-os/cli"
Write-Host ""

$response = Read-Host "Continue? (y/n)"
if ($response -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📦 Building project..." -ForegroundColor Cyan
pnpm build

Write-Host ""
Write-Host "📦 Publishing Engine..." -ForegroundColor Cyan
Set-Location packages/engine

# Bump version
npm version $VERSION_TYPE --no-git-tag-version

# Publish
npm publish --access public

$ENGINE_VERSION = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "✅ Engine published: v$ENGINE_VERSION" -ForegroundColor Green

Set-Location ..\..

Write-Host ""
Write-Host "📦 Publishing CLI..." -ForegroundColor Cyan
Set-Location apps/cli

# Update engine dependency version
$packageJson = Get-Content package.json | ConvertFrom-Json
$packageJson.dependencies.'@narrative-os/engine' = $ENGINE_VERSION
$packageJson | ConvertTo-Json -Depth 10 | Set-Content package.json

# Bump version
npm version $VERSION_TYPE --no-git-tag-version

# Publish
npm publish --access public

$CLI_VERSION = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "✅ CLI published: v$CLI_VERSION" -ForegroundColor Green

Set-Location ..\..

Write-Host ""
Write-Host "🎉 All packages published successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Users can now install with:" -ForegroundColor Cyan
Write-Host "  npm install -g @narrative-os/cli"
Write-Host ""
