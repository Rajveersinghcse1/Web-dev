#!/bin/sh
set -e

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting Voice Cloner Server..."

# Use PostgreSQL schema for Docker
if [ -f "prisma/schema.docker.prisma" ]; then
    log "Using PostgreSQL schema for Docker deployment..."
    export PRISMA_SCHEMA_PATH="prisma/schema.docker.prisma"
fi

# Generate Prisma client first (this must happen before anything else)
log "Generating Prisma client..."
if [ -n "$PRISMA_SCHEMA_PATH" ]; then
    npx prisma generate --schema="$PRISMA_SCHEMA_PATH" || {
        log "Failed to generate Prisma client with custom schema, trying default..."
        npx prisma generate || log "Prisma client generation failed, but continuing..."
    }
else
    npx prisma generate || log "Prisma client generation failed, but continuing..."
fi

# Wait for database to be ready if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    log "Waiting for database to be ready..."
    
    # Extract host and port from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+).*/\1/')
    DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
    
    # Default port if not specified
    if [ -z "$DB_PORT" ] || [ "$DB_PORT" = "$DATABASE_URL" ]; then
        DB_PORT=5432
    fi
    
    # Wait for database
    until nc -z "$DB_HOST" "$DB_PORT"; do
        log "Waiting for database at $DB_HOST:$DB_PORT..."
        sleep 2
    done
    
    log "Database is ready!"
    
    # Run database migrations
    log "Running database migrations..."
    if [ -n "$PRISMA_SCHEMA_PATH" ]; then
        npx prisma migrate deploy --schema="$PRISMA_SCHEMA_PATH" || log "Migration failed, continuing..."
    else
        npx prisma migrate deploy || log "Migration failed, continuing..."
    fi
fi

# Create necessary directories
mkdir -p uploads logs

# Set proper permissions for uploads and logs
chmod 755 uploads logs

log "Starting the application..."

# Start the Node.js application
exec node dist/index.js