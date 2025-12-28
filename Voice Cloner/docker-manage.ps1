# Voice Cloner Docker Management Script for Windows
# PowerShell version

param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$Argument
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

function Write-Header {
    Write-Host "========================================" -ForegroundColor $Colors.Blue
    Write-Host " Voice Cloner Docker Management" -ForegroundColor $Colors.Blue
    Write-Host "========================================" -ForegroundColor $Colors.Blue
}

# Check if Docker is installed and running
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
    }
    catch {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }

    try {
        $null = docker info 2>$null
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop first."
        exit 1
    }

    try {
        $null = Get-Command docker-compose -ErrorAction Stop
    }
    catch {
        Write-Error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }
}

# Function to setup environment files
function Set-Environment {
    Write-Status "Setting up environment files..."
    
    if (-not (Test-Path ".env.production")) {
        Write-Warning ".env.production not found. Creating from example..."
        Copy-Item ".env.production.example" ".env.production"
        Write-Warning "Please edit .env.production with your production values before deployment!"
    }
    
    if (-not (Test-Path ".env.development")) {
        Write-Status "Creating .env.development from example..."
        Copy-Item ".env.development.example" ".env.development"
    }
}

# Function to build images
function Build-Images {
    Write-Status "Building Docker images..."
    docker-compose build --no-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Images built successfully!"
    } else {
        Write-Error "Failed to build images!"
        exit 1
    }
}

# Function to start development environment
function Start-Development {
    Write-Status "Starting development environment..."
    Set-Environment
    docker-compose -f docker-compose.dev.yml up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Development environment started!"
        Write-Status "Frontend: http://localhost:3001"
        Write-Status "Backend: http://localhost:5001"
        Write-Status "Database: localhost:5433"
        Write-Status "Redis: localhost:6380"
    } else {
        Write-Error "Failed to start development environment!"
    }
}

# Function to start production environment
function Start-Production {
    Write-Status "Starting production environment..."
    Set-Environment
    
    if (-not (Test-Path ".env.production")) {
        Write-Error ".env.production file is required for production deployment!"
        Write-Error "Copy .env.production.example to .env.production and configure it."
        exit 1
    }
    
    docker-compose --env-file .env.production up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Production environment started!"
        Write-Status "Application: http://localhost"
        Write-Status "API: http://localhost/api"
    } else {
        Write-Error "Failed to start production environment!"
    }
}

# Function to stop all containers
function Stop-Containers {
    Write-Status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    Write-Status "All containers stopped!"
}

# Function to show logs
function Show-Logs {
    param([string]$Environment)
    
    if ($Environment -eq "dev") {
        docker-compose -f docker-compose.dev.yml logs -f
    } else {
        docker-compose logs -f
    }
}

# Function to show status
function Show-Status {
    Write-Status "Container status:"
    Write-Host "Production containers:" -ForegroundColor $Colors.Blue
    docker-compose ps
    Write-Host ""
    Write-Host "Development containers:" -ForegroundColor $Colors.Blue
    docker-compose -f docker-compose.dev.yml ps
}

# Function to clean up
function Invoke-Cleanup {
    Write-Status "Cleaning up..."
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    Write-Status "Cleanup completed!"
}

# Function to backup data
function Invoke-Backup {
    Write-Status "Creating backup..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backups/backup_$timestamp"
    New-Item -ItemType Directory -Path $backupDir -Force
    
    # Backup database
    docker-compose exec postgres pg_dump -U voice_cloner_user voice_cloner | Out-File -FilePath "$backupDir/database.sql" -Encoding UTF8
    
    # Note: File copying from containers in Windows requires different approach
    Write-Status "Manual step required: Copy uploads folder from container"
    Write-Status "Run: docker cp voice-cloner-server:/app/uploads $backupDir/uploads"
    
    Write-Status "Backup created at: $backupDir"
}

# Function to update application
function Update-Application {
    Write-Status "Updating application..."
    
    # Pull latest code (if using git)
    if (Test-Path ".git") {
        git pull
    }
    
    # Rebuild images
    Build-Images
    
    # Restart services
    docker-compose down
    docker-compose up -d
    
    Write-Status "Update completed!"
}

# Function to show help
function Show-Help {
    Write-Header
    Write-Host "Usage: .\docker-manage.ps1 [COMMAND] [ARGUMENT]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  dev          Start development environment"
    Write-Host "  prod         Start production environment"
    Write-Host "  stop         Stop all containers"
    Write-Host "  restart      Restart all containers"
    Write-Host "  build        Build Docker images"
    Write-Host "  logs [dev]   Show logs (optionally for dev environment)"
    Write-Host "  status       Show container status"
    Write-Host "  cleanup      Clean up containers and images"
    Write-Host "  backup       Create backup of data"
    Write-Host "  update       Update application"
    Write-Host "  help         Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker-manage.ps1 dev       # Start development environment"
    Write-Host "  .\docker-manage.ps1 prod      # Start production environment"
    Write-Host "  .\docker-manage.ps1 logs dev  # Show development logs"
    Write-Host "  .\docker-manage.ps1 backup    # Create backup"
    Write-Host ""
}

# Main script logic
Write-Header

# Check dependencies
Test-Docker

# Handle commands
switch ($Command.ToLower()) {
    "dev" {
        Start-Development
    }
    "prod" {
        Start-Production
    }
    "stop" {
        Stop-Containers
    }
    "restart" {
        Stop-Containers
        Start-Sleep -Seconds 2
        Start-Production
    }
    "build" {
        Build-Images
    }
    "logs" {
        Show-Logs $Argument
    }
    "status" {
        Show-Status
    }
    "cleanup" {
        Invoke-Cleanup
    }
    "backup" {
        Invoke-Backup
    }
    "update" {
        Update-Application
    }
    { $_ -in @("help", "--help", "-h", "") } {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Show-Help
        exit 1
    }
}