#!/usr/bin/env pwsh
# Stock & Invoicing Management System - Complete Setup Script
# Run this script to automatically set up the entire project

param(
    [switch]$SkipFrontend = $false,
    [switch]$SkipBackend = $false,
    [switch]$SkipDatabase = $false,
    [switch]$SkipMigrations = $false
)

# Colors for output
$colors = @{
    Success = @{ ForegroundColor = 'Green'; BackgroundColor = 'Black' }
    Error   = @{ ForegroundColor = 'Red'; BackgroundColor = 'Black' }
    Info    = @{ ForegroundColor = 'Cyan'; BackgroundColor = 'Black' }
    Warning = @{ ForegroundColor = 'Yellow'; BackgroundColor = 'Black' }
}

function Write-Success($message) {
    Write-Host "✅ $message" @colors.Success
}

function Write-Error-Custom($message) {
    Write-Host "❌ $message" @colors.Error
}

function Write-Info($message) {
    Write-Host "ℹ️  $message" @colors.Info
}

function Write-Warning-Custom($message) {
    Write-Host "⚠️  $message" @colors.Warning
}

# Clear screen
Clear-Host

Write-Host "
╔═══════════════════════════════════════════════════════════════╗
║   Stock & Invoicing Management System - Setup Script         ║
║   Framework: .NET 8 | Database: MySQL | Frontend: React 19   ║
╚═══════════════════════════════════════════════════════════════╝
" -ForegroundColor Magenta

Write-Info "Starting automated setup..."
Write-Info "Script location: $(Get-Location)"

# Verify prerequisites
Write-Host "`n📋 Verifying Prerequisites..." -ForegroundColor Cyan
Write-Host "-" * 60

# Check .NET 8
Write-Info "Checking .NET 8 SDK..."
try {
    $dotnetVersion = dotnet --version
    Write-Success ".NET version: $dotnetVersion"
} catch {
    Write-Error-Custom ".NET SDK not found. Please install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0"
    exit 1
}

# Check MySQL
Write-Info "Checking MySQL..."
try {
    $mysqlVersion = mysql --version 2>$null
    if ($mysqlVersion) {
        Write-Success "MySQL found: $mysqlVersion"
    } else {
        Write-Warning-Custom "MySQL CLI not found, but proceeding (server should be running on localhost:3306)"
    }
} catch {
    Write-Warning-Custom "MySQL CLI not accessible, but proceeding (ensure server is running on localhost:3306)"
}

# Check Node.js
Write-Info "Checking Node.js..."
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Success "Node.js: $nodeVersion"
    Write-Success "npm: $npmVersion"
} catch {
    Write-Error-Custom "Node.js not found. Please install from https://nodejs.org"
    exit 1
}

# Proceed with setup
Write-Host "`n🚀 Starting Setup..." -ForegroundColor Magenta
Write-Host "=" * 60

# BACKEND SETUP
if (-not $SkipBackend) {
    Write-Host "`n📦 PHASE 1: Backend Setup (.NET 8)" -ForegroundColor Cyan
    Write-Host "-" * 60
    
    Push-Location Backend
    
    Write-Info "Current directory: $(Get-Location)"
    
    # Clean
    Write-Info "Cleaning previous build artifacts..."
    dotnet clean -nologo -q
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend cleaned"
    } else {
        Write-Error-Custom "Failed to clean backend"
        Pop-Location
        exit 1
    }
    
    # Restore
    Write-Info "Restoring .NET 8 packages (this may take 2-5 minutes)..."
    dotnet restore -nologo -q
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Packages restored"
    } else {
        Write-Error-Custom "Failed to restore packages"
        Pop-Location
        exit 1
    }
    
    # Build
    Write-Info "Building backend project..."
    dotnet build -nologo -q
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend built successfully"
    } else {
        Write-Error-Custom "Build failed"
        Pop-Location
        exit 1
    }
    
    Pop-Location
} else {
    Write-Warning-Custom "Backend setup skipped"
}

# DATABASE MIGRATIONS
if (-not $SkipMigrations) {
    Write-Host "`n🗄️  PHASE 2: Database Setup" -ForegroundColor Cyan
    Write-Host "-" * 60
    
    Push-Location Backend
    
    Write-Info "Current directory: $(Get-Location)"
    
    # Check if migrations exist
    Write-Info "Checking migrations..."
    $migrations = dotnet ef migrations list 2>&1
    
    if ($migrations -match "InitialCreate") {
        Write-Success "Migration 'InitialCreate' already exists"
    } else {
        Write-Info "Creating initial migration..."
        dotnet ef migrations add InitialCreate -o "Migrations" --no-build
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Migration created"
        } else {
            Write-Error-Custom "Failed to create migration"
            Pop-Location
            exit 1
        }
    }
    
    Write-Info "Applying migrations to database..."
    dotnet ef database update --no-build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database migrations applied successfully"
    } else {
        Write-Error-Custom "Failed to apply migrations"
        Pop-Location
        exit 1
    }
    
    Pop-Location
} else {
    Write-Warning-Custom "Database migrations skipped"
}

# FRONTEND SETUP
if (-not $SkipFrontend) {
    Write-Host "`n⚛️  PHASE 3: Frontend Setup (React 19)" -ForegroundColor Cyan
    Write-Host "-" * 60
    
    Push-Location Frontend
    
    Write-Info "Current directory: $(Get-Location)"
    
    # Check if node_modules exists
    if (Test-Path "node_modules") {
        Write-Success "Dependencies already installed"
    } else {
        Write-Info "Installing npm dependencies (this may take 3-5 minutes)..."
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "npm dependencies installed"
        } else {
            Write-Error-Custom "Failed to install dependencies"
            Pop-Location
            exit 1
        }
    }
    
    Pop-Location
} else {
    Write-Warning-Custom "Frontend setup skipped"
}

# Completion summary
Write-Host "`n" -ForegroundColor Magenta
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ SETUP COMPLETE - Ready to Start!                         ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host @"

1️⃣  START BACKEND SERVER (in Terminal 1):
    cd Backend
    dotnet run
    
    ✅ Backend will run on: https://localhost:7119
    📚 Swagger UI: https://localhost:7119/swagger

2️⃣  START FRONTEND SERVER (in Terminal 2):
    cd Frontend
    npm run dev
    
    ✅ Frontend will run on: http://localhost:5173

3️⃣  OPEN BROWSER:
    http://localhost:5173

4️⃣  LOGIN WITH DEFAULT CREDENTIALS:
    Email: admin@stockmanager.com
    Password: Admin@123

📚 DOCUMENTATION:
    - Complete Setup: SETUP_GUIDE.md
    - Quick Commands: QUICK_COMMANDS.md
    - Conversion Details: CONVERSION_SUMMARY.md
    - Detailed Execution: EXECUTION_GUIDE.md
    - Package Info: PACKAGE_COMPATIBILITY.md

🆘 TROUBLESHOOTING:
    - Ensure MySQL is running on localhost:3306
    - Use PowerShell (not Command Prompt)
    - Check Network tab in browser DevTools for API errors
    - See EXECUTION_GUIDE.md for detailed troubleshooting
"@ -ForegroundColor Green

Write-Host "🎉 Setup complete! Refer to the documentation files for detailed instructions." -ForegroundColor Green
Write-Host ""
