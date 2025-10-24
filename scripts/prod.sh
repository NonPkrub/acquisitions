#!/bin/bash

echo "Starting Aquisitions API in Production Mode..."
echo "===================================================="

if [ ! -f ".env.production" ]; then
    echo "Error: .env.development file not found."
    echo "Please create .env.production with your production environment variables."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker is not installed or not running."
    echo "Please install Docker and try again."
    exit 1
fi

echo "Building and starting production containers..."
echo "- Using Neon Cloud Database (no local proxy)"
echo "- Running in optimized production mode"
echo ""

docker compose -f docker-compose.prod.yml up --build -d

echo "Waiting for Database to be ready..."
sleep 5

echo "Application latest schema applied with Drizzle..."
npm run db:migrate

echo ""
echo "Production environment started!"
echo "Application is running at http://localhost:5432"
echo "Logs: docker logs acquisitions-app-prod"
echo ""
echo "Useful commands:"
echo " View logs: docker logs -f acquisitions-app-prod"
echo " Stop app: docker compose -f docker-compose.prod.yml down"