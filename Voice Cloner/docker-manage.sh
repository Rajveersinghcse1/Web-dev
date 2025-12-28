#!/bin/bash

# Voice Cloner Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} Voice Cloner Docker Management${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Function to setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    if [ ! -f .env.production ]; then
        print_warning ".env.production not found. Creating from example..."
        cp .env.production.example .env.production
        print_warning "Please edit .env.production with your production values before deployment!"
    fi
    
    if [ ! -f .env.development ]; then
        print_status "Creating .env.development from example..."
        cp .env.development.example .env.development
    fi
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    docker-compose build --no-cache
    print_status "Images built successfully!"
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    setup_env
    docker-compose -f docker-compose.dev.yml up -d
    print_status "Development environment started!"
    print_status "Frontend: http://localhost:3001"
    print_status "Backend: http://localhost:5001"
    print_status "Database: localhost:5433"
    print_status "Redis: localhost:6380"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    setup_env
    
    if [ ! -f .env.production ]; then
        print_error ".env.production file is required for production deployment!"
        print_error "Copy .env.production.example to .env.production and configure it."
        exit 1
    fi
    
    # Load environment variables
    export $(cat .env.production | grep -v '^#' | xargs)
    
    docker-compose --env-file .env.production up -d
    print_status "Production environment started!"
    print_status "Application: http://localhost"
    print_status "API: http://localhost/api"
}

# Function to stop all containers
stop() {
    print_status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    print_status "All containers stopped!"
}

# Function to show logs
logs() {
    if [ "$1" == "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Function to show status
status() {
    print_status "Container status:"
    docker-compose ps
    echo ""
    docker-compose -f docker-compose.dev.yml ps
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    docker system prune -f
    print_status "Cleanup completed!"
}

# Function to backup data
backup() {
    print_status "Creating backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="backups/backup_${timestamp}"
    mkdir -p $backup_dir
    
    # Backup database
    docker-compose exec postgres pg_dump -U voice_cloner_user voice_cloner > "${backup_dir}/database.sql"
    
    # Backup uploads
    docker cp voice-cloner-server:/app/uploads "${backup_dir}/uploads"
    
    print_status "Backup created at: ${backup_dir}"
}

# Function to restore data
restore() {
    if [ -z "$1" ]; then
        print_error "Please specify backup directory: ./docker-manage.sh restore backups/backup_YYYYMMDD_HHMMSS"
        exit 1
    fi
    
    backup_dir="$1"
    if [ ! -d "$backup_dir" ]; then
        print_error "Backup directory not found: $backup_dir"
        exit 1
    fi
    
    print_status "Restoring from backup: $backup_dir"
    
    # Restore database
    if [ -f "${backup_dir}/database.sql" ]; then
        docker-compose exec -T postgres psql -U voice_cloner_user voice_cloner < "${backup_dir}/database.sql"
    fi
    
    # Restore uploads
    if [ -d "${backup_dir}/uploads" ]; then
        docker cp "${backup_dir}/uploads" voice-cloner-server:/app/
    fi
    
    print_status "Restore completed!"
}

# Function to update application
update() {
    print_status "Updating application..."
    
    # Pull latest code (if using git)
    if [ -d ".git" ]; then
        git pull
    fi
    
    # Rebuild images
    build_images
    
    # Restart services
    docker-compose down
    docker-compose up -d
    
    print_status "Update completed!"
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev          Start development environment"
    echo "  prod         Start production environment"
    echo "  stop         Stop all containers"
    echo "  restart      Restart all containers"
    echo "  build        Build Docker images"
    echo "  logs [dev]   Show logs (optionally for dev environment)"
    echo "  status       Show container status"
    echo "  cleanup      Clean up containers and images"
    echo "  backup       Create backup of data"
    echo "  restore DIR  Restore from backup directory"
    echo "  update       Update application"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev       # Start development environment"
    echo "  $0 prod      # Start production environment"
    echo "  $0 logs dev  # Show development logs"
    echo "  $0 backup    # Create backup"
    echo ""
}

# Main script logic
print_header

# Check dependencies
check_docker

# Handle commands
case "$1" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "stop")
        stop
        ;;
    "restart")
        stop
        sleep 2
        start_prod
        ;;
    "build")
        build_images
        ;;
    "logs")
        logs $2
        ;;
    "status")
        status
        ;;
    "cleanup")
        cleanup
        ;;
    "backup")
        backup
        ;;
    "restore")
        restore $2
        ;;
    "update")
        update
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac