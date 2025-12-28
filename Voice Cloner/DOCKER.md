# Voice Cloner Docker Setup

This document provides comprehensive instructions for deploying the Voice Cloner application using Docker.

## 🐳 Architecture Overview

The application consists of the following services:

- **Frontend (React)**: User interface served by Nginx
- **Backend (Node.js)**: API server with TypeScript
- **Database (PostgreSQL)**: Data persistence
- **Cache (Redis)**: Session storage and caching
- **Reverse Proxy (Nginx)**: Load balancing and SSL termination

## 📋 Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- At least 4GB RAM available for containers
- 10GB disk space for images and volumes

### Installation

#### Windows:
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
2. Run installer and restart your computer
3. Enable WSL 2 backend if prompted

#### Linux:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🚀 Quick Start

### Development Environment

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd voice-cloner
   ```

2. **Start development environment:**
   ```bash
   # Windows
   .\docker-manage.ps1 dev
   
   # Linux/Mac
   ./docker-manage.sh dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5001
   - Database: localhost:5433
   - Redis: localhost:6380

### Production Environment

1. **Setup environment variables:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your production values
   ```

2. **Start production environment:**
   ```bash
   # Windows
   .\docker-manage.ps1 prod
   
   # Linux/Mac
   ./docker-manage.sh prod
   ```

3. **Access the application:**
   - Application: http://localhost
   - API: http://localhost/api

## 🛠️ Configuration

### Environment Variables

#### Production (.env.production)
```env
# Database
POSTGRES_PASSWORD=your_super_secure_postgres_password
POSTGRES_DB=voice_cloner
POSTGRES_USER=voice_cloner_user

# Redis
REDIS_PASSWORD=your_super_secure_redis_password

# JWT Secrets (generate strong random strings)
JWT_SECRET=your_super_secure_jwt_secret_64_chars_min
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_64_chars_min

# Security
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File uploads
UPLOAD_MAX_SIZE=52428800

# Logging
LOG_LEVEL=info
```

#### Development (.env.development)
```env
# Database
POSTGRES_PASSWORD=dev_password
POSTGRES_DB=voice_cloner_dev
POSTGRES_USER=dev_user

# JWT Secrets (simple for development)
JWT_SECRET=dev_jwt_secret_not_for_production
JWT_REFRESH_SECRET=dev_refresh_secret_not_for_production

# Security (relaxed for development)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=debug
```

### SSL/HTTPS Setup (Production)

1. **Create SSL certificates directory:**
   ```bash
   mkdir -p nginx/ssl
   ```

2. **Add your SSL certificates:**
   ```bash
   # Copy your certificates
   cp your-cert.pem nginx/ssl/cert.pem
   cp your-key.pem nginx/ssl/key.pem
   ```

3. **Update nginx configuration:**
   - Uncomment SSL sections in `nginx/nginx.conf`
   - Update server names with your domain

## 📋 Management Commands

### Using Docker Management Scripts

#### Windows (PowerShell):
```powershell
.\docker-manage.ps1 [command] [argument]
```

#### Linux/Mac (Bash):
```bash
./docker-manage.sh [command] [argument]
```

### Available Commands:

| Command | Description |
|---------|-------------|
| `dev` | Start development environment |
| `prod` | Start production environment |
| `stop` | Stop all containers |
| `restart` | Restart all containers |
| `build` | Build Docker images |
| `logs [dev]` | Show logs (optionally for dev) |
| `status` | Show container status |
| `cleanup` | Clean up containers and images |
| `backup` | Create backup of data |
| `restore DIR` | Restore from backup directory |
| `update` | Update application |
| `help` | Show help message |

### Manual Docker Commands

#### Development:
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

#### Production:
```bash
# Start production environment
docker-compose --env-file .env.production up -d

# View logs
docker-compose logs -f

# Stop production environment
docker-compose down
```

## 🔄 Data Persistence

### Volumes

The application uses Docker volumes for data persistence:

- `postgres_data`: Database files
- `redis_data`: Redis cache data
- `server_uploads`: User uploaded files
- `server_logs`: Application logs
- `nginx_logs`: Nginx access/error logs

### Backup and Restore

#### Create Backup:
```bash
# Using management script
./docker-manage.sh backup

# Manual backup
docker-compose exec postgres pg_dump -U voice_cloner_user voice_cloner > backup.sql
docker cp voice-cloner-server:/app/uploads ./uploads-backup
```

#### Restore Backup:
```bash
# Using management script
./docker-manage.sh restore backups/backup_20231201_120000

# Manual restore
docker-compose exec -T postgres psql -U voice_cloner_user voice_cloner < backup.sql
docker cp ./uploads-backup voice-cloner-server:/app/uploads
```

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts:
```bash
# Check if ports are in use
netstat -tlnp | grep :5000
netstat -tlnp | grep :3000

# Stop conflicting services or change ports in docker-compose.yml
```

#### Permission Issues (Linux):
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x docker-manage.sh
```

#### Memory Issues:
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or free up system memory:
docker system prune -a
```

#### Database Connection Issues:
```bash
# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Health Checks

All services include health checks. Monitor with:
```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect voice-cloner-server | grep -A 10 '"Health"'
```

### Log Analysis

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f postgres

# View last 100 lines
docker-compose logs --tail=100 server
```

## 🚀 Production Deployment

### Cloud Deployment

#### AWS ECS/Fargate:
1. Build and push images to ECR
2. Create task definitions
3. Setup load balancer
4. Configure RDS and ElastiCache

#### Google Cloud Run:
1. Build and push to Container Registry
2. Deploy each service separately
3. Setup Cloud SQL and Memorystore

#### DigitalOcean Droplets:
1. Create Ubuntu droplet
2. Install Docker and Docker Compose
3. Clone repository and run production setup

### Security Considerations

1. **Use strong passwords** in `.env.production`
2. **Enable SSL/TLS** with valid certificates
3. **Setup firewall rules** to restrict access
4. **Regular security updates** for base images
5. **Monitor logs** for suspicious activity
6. **Backup data** regularly
7. **Use secrets management** for sensitive data

### Performance Optimization

1. **Resource limits** in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 4G
       reservations:
         cpus: '1'
         memory: 2G
   ```

2. **Enable horizontal scaling**:
   ```yaml
   deploy:
     replicas: 3
   ```

3. **Use external managed services**:
   - AWS RDS for PostgreSQL
   - AWS ElastiCache for Redis
   - AWS S3 for file storage

## 📊 Monitoring

### Application Metrics

- Health check endpoints: `/health`
- Container resource usage: `docker stats`
- Application logs: `docker-compose logs`

### External Monitoring

Consider integrating:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **ELK Stack** for log analysis
- **Sentry** for error tracking

## 🆘 Support

For issues and questions:

1. Check logs: `docker-compose logs -f`
2. Verify configuration: `.env` files
3. Review this documentation
4. Check container health: `docker-compose ps`
5. Test network connectivity: `docker network ls`

## 📝 License

This Docker configuration is part of the Voice Cloner project and follows the same license terms.