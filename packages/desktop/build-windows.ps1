# Build script for Windows - Enables Developer Mode to allow symlinks
# This is required due to electron-builder's winCodeSign dependency

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Industrial Gateway - Windows Build Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: This script requires Administrator privileges" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please right-click and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit 1
}

Write-Host "OK: Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Enable Developer Mode (allows symlinks without admin)
Write-Host "Enabling Windows Developer Mode..." -ForegroundColor Cyan
try {
    $registryPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock"

    if (-not (Test-Path $registryPath)) {
        New-Item -Path $registryPath -Force | Out-Null
    }

    Set-ItemProperty -Path $registryPath -Name "AllowDevelopmentWithoutDevLicense" -Value 1 -Type DWord
    Write-Host "OK: Developer Mode enabled" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to enable Developer Mode: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Building Electron application..." -ForegroundColor Cyan
Write-Host ""

# Build the application
try {
    # Compile TypeScript
    Write-Host "-> Compiling TypeScript..." -ForegroundColor White
    & npx tsc
    if ($LASTEXITCODE -ne 0) { throw "TypeScript compilation failed" }

    # Run electron-builder
    Write-Host "-> Running electron-builder..." -ForegroundColor White
    & npx electron-builder --win

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "===========================================" -ForegroundColor Green
        Write-Host "  Build completed successfully!" -ForegroundColor Green
        Write-Host "===========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Output files:" -ForegroundColor Cyan
        Write-Host "  - Installer: packages\desktop\release\Industrial Gateway Platform-1.0.0-Setup.exe" -ForegroundColor White
        Write-Host "  - Portable:  packages\desktop\release\Industrial Gateway Platform-1.0.0-Portable.exe" -ForegroundColor White
        Write-Host ""
    } else {
        throw "electron-builder failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Build failed: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
