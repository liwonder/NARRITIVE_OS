#!/usr/bin/env pwsh
# Narrative OS Installation Script for Windows

$ErrorActionPreference = "Stop"

Write-Host "📝 Narrative OS Installer" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check for package manager (npm or pnpm)
$packageManager = "npm"
try {
    $pnpmVersion = pnpm --version 2>$null
    if ($pnpmVersion) {
        $packageManager = "pnpm"
        Write-Host "✅ pnpm found: $pnpmVersion" -ForegroundColor Green
    } else {
        throw "pnpm not found"
    }
} catch {
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
        Write-Host "   (Using npm - pnpm is optional but faster)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Neither npm nor pnpm found. Please install Node.js first:" -ForegroundColor Red
        Write-Host "   Visit: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
}

# Setup pnpm if using it
if ($packageManager -eq "pnpm") {
    $pnpmHome = [Environment]::GetEnvironmentVariable('PNPM_HOME', 'User')
    if (-not $pnpmHome) {
        Write-Host ""
        Write-Host "🔧 Setting up pnpm..." -ForegroundColor Cyan
        pnpm setup
        Write-Host "⚠️  Please restart your terminal after installation completes!" -ForegroundColor Yellow
    }
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 20+ first." -ForegroundColor Red
    Write-Host "   Visit: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Get install directory
$installDir = "$env:USERPROFILE\narrative-os"

if (Test-Path $installDir) {
    Write-Host "⚠️  Narrative OS already exists at $installDir" -ForegroundColor Yellow
    $response = Read-Host "   Update existing installation? (y/n)"
    if ($response -ne 'y') {
        Write-Host "Installation cancelled." -ForegroundColor Red
        exit 0
    }
    Remove-Item -Recurse -Force $installDir
}

# Clone repository
Write-Host ""
Write-Host "📥 Downloading Narrative OS..." -ForegroundColor Cyan
git clone https://github.com/liwonder/NARRITIVE_OS.git $installDir 2>$null

if (-not $?) {
    Write-Host "⚠️  Git clone failed. Using fallback download..." -ForegroundColor Yellow
    # Fallback: create directory and download zip
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    $zipUrl = "https://github.com/liwonder/NARRITIVE_OS/archive/refs/heads/main.zip"
    $zipPath = "$env:TEMP\narrative-os.zip"
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath $env:TEMP -Force
    Copy-Item -Recurse "$env:TEMP\narrative_os-main\*" $installDir
    Remove-Item $zipPath
}

Set-Location $installDir

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies with $packageManager..." -ForegroundColor Cyan
if ($packageManager -eq "pnpm") {
    pnpm install
} else {
    npm install
}

# Build project
Write-Host ""
Write-Host "🔨 Building project..." -ForegroundColor Cyan
if ($packageManager -eq "pnpm") {
    pnpm build
} else {
    npm run build
}

# Install CLI globally
Write-Host ""
Write-Host "🚀 Installing CLI..." -ForegroundColor Cyan
if ($packageManager -eq "pnpm") {
    pnpm add -g ./apps/cli
} else {
    npm install -g ./apps/cli
}

# Success message
Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Quick Start:" -ForegroundColor Cyan
Write-Host "   nos config          # Configure LLM provider"
Write-Host "   nos init            # Create your first story"
Write-Host "   nos --help          # See all commands"
Write-Host ""
Write-Host "📚 Documentation: https://github.com/liwonder/NARRITIVE_OS"
Write-Host ""

# Configure if requested
$response = Read-Host "   Configure LLM provider now? (y/n)"
if ($response -eq 'y') {
    nos config
}
