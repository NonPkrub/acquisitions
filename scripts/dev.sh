#!/bin/bash

echo "Setting up Docker environment for Aquisitions API..."
echo "===================================================="

if [ ! -f ".env.development" ]; then
    echo "Error: .env.development file not found."
    echo "Please copy .env.example to .env.development and update with your Neon credentials."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker is not installed or not running."
    echo "Please install Docker and try again."
    exit 1
fi

mkdir -p .neon_local

if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "Added .neon_local/ to .gitignore."
fi

echo "Building and starting development containers..."
echo "- Neon Local proxy will create ephemeral database branches"
echo "- Application will run with hot reload enabled"
echo ""

echo "Applying latest schema with Drizzle..."
npm run db:migrate

echo "Waiting for Database to be ready..."
docker compose exec neon-local pgsql -U neon -d  nenodb -c 'SELECT 1'


docker compose -f docker-compose.dev.yml up --build

echo ""
echo "Development environment setup complete!"
echo "Application is running at http://localhost:5432"
echo "Database is ready at neon-local:5432"
echo ""
echo "To stop the development environment, press Ctrl+C or run: docker compose down"