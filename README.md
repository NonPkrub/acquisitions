# Acquisitions API - Docker Setup with Neon Database

This project provides a complete Docker setup for the Acquisitions API with different configurations for development and production environments using Neon Database.

## 🏗️ Architecture Overview

- **Development**: Uses Neon Local proxy with ephemeral branches
- **Production**: Connects directly to Neon Cloud Database
- **Multi-stage Docker builds** for optimal image sizes
- **Environment-specific configurations** for seamless switching

## 📋 Prerequisites

- Docker and Docker Compose installed
- Neon account with API access
- Node.js 20+ (for local development)

## 🔧 Environment Setup

### 1. Neon Configuration

First, gather your Neon credentials:

1. **API Key**: Go to [Neon Console](https://console.neon.tech) → Account Settings → API Keys
2. **Project ID**: Found in Project Settings → General
3. **Parent Branch ID**: Usually your main/production branch ID

### 2. Environment Files

Copy the template files and update with your actual values:

```bash
# Copy development environment template
cp .env.development .env.development.local

# Copy production environment template  
cp .env.production .env.production.local
```

Update `.env.development.local`:
```env
NEON_API_KEY=your_actual_neon_api_key
NEON_PROJECT_ID=your_actual_project_id
PARENT_BRANCH_ID=your_actual_parent_branch_id
```

Update `.env.production.local`:
```env
DATABASE_URL=postgres://your-username:your-password@ep-xxxxx-xxxxx.your-region.aws.neon.tech/your-database?sslmode=require
```

## 🚀 Development Environment

### Quick Start

```bash
# Start development environment with Neon Local
docker-compose --env-file .env.development.local -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### What happens in development:

1. **Neon Local proxy** starts and creates an ephemeral branch
2. **Application** connects to `neon-local:5432` 
3. **Hot reload** enabled for code changes
4. **Fresh database** on each restart (ephemeral branches)

### Development Commands

```bash
# Build development image only
docker-compose -f docker-compose.dev.yml build app

# Run database migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Access application container
docker-compose -f docker-compose.dev.yml exec app sh

# View Neon Local logs
docker-compose -f docker-compose.dev.yml logs neon-local
```

## 🌐 Production Environment

### Deployment

```bash
# Start production environment
docker-compose --env-file .env.production.local -f docker-compose.prod.yml up -d

# View application logs
docker-compose -f docker-compose.prod.yml logs -f app

# Scale application (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

### Production Features

- **Optimized Docker images** with multi-stage builds
- **Health checks** for application reliability
- **Resource limits** for stable performance
- **Nginx reverse proxy** with security headers
- **Direct connection** to Neon Cloud Database

### Production Commands

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Run migrations in production
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate

# Check application health
curl http://localhost/health
```

## 🔄 Environment Switching

The key difference between environments is the `DATABASE_URL`:

| Environment | Database Connection |
|-------------|-------------------|
| Development | `postgres://neon:npg@neon-local:5432/main?sslmode=require` |
| Production | `postgres://user:pass@ep-xxxxx.neon.tech/db?sslmode=require` |

## 📂 File Structure

```
acquisitions/
├── docker-compose.dev.yml      # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── Dockerfile                  # Multi-stage Docker build
├── .env.development           # Development environment template
├── .env.production            # Production environment template
├── nginx/
│   └── nginx.conf             # Production reverse proxy config
└── src/                       # Application source code
```

## 🛠️ Database Operations

### Development (Neon Local)

```bash
# Connect to development database
docker-compose -f docker-compose.dev.yml exec neon-local psql -U neon -d main

# Run migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate
```

### Production (Neon Cloud)

```bash
# Run migrations in production
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate

# Access production database (use carefully)
# Connect using your actual Neon Cloud connection string
```

## 🔍 Troubleshooting

### Common Issues

1. **Neon Local connection fails**
   ```bash
   # Check if Neon Local is healthy
   docker-compose -f docker-compose.dev.yml exec neon-local pg_isready -U neon
   
   # Verify environment variables
   docker-compose -f docker-compose.dev.yml exec neon-local env | grep NEON
   ```

2. **Application can't connect to database**
   ```bash
   # Check network connectivity
   docker-compose -f docker-compose.dev.yml exec app ping neon-local
   
   # Verify DATABASE_URL
   docker-compose -f docker-compose.dev.yml exec app env | grep DATABASE_URL
   ```

3. **Production database connection issues**
   ```bash
   # Test connection to Neon Cloud
   docker-compose -f docker-compose.prod.yml exec app node -e "
   const { Pool } = require('pg');
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   pool.query('SELECT NOW()', (err, res) => {
     console.log(err ? err : res.rows[0]);
     pool.end();
   });"
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose -f docker-compose.dev.yml logs

# Follow specific service logs
docker-compose -f docker-compose.dev.yml logs -f app
docker-compose -f docker-compose.dev.yml logs -f neon-local

# Debug container
docker-compose -f docker-compose.dev.yml exec app sh
```

## 📈 Performance Optimization

### Development
- Use volume mounts for hot reload
- Ephemeral branches reduce database overhead
- Development dependencies included

### Production
- Optimized multi-stage builds
- Resource limits configured
- Health checks enabled
- Nginx caching and compression

## 🔒 Security Considerations

1. **Environment Variables**: Never commit actual credentials
2. **SSL/TLS**: Always use `sslmode=require` for Neon connections
3. **Network Isolation**: Services communicate through Docker networks
4. **Resource Limits**: Prevent resource exhaustion in production

## 📚 Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Database Documentation](https://neon.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contributing

1. Make changes in development environment
2. Test with both Neon Local and production configurations
3. Update documentation as needed
4. Ensure all services pass health checks

---

**Happy Coding! 🚀**