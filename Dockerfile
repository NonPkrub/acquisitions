# Multi-stage Dockerfile for Node.js application

# Base stage with Node.js
FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode !== 200 ? 1 : 0)).on('error', () =>{ process.exit(1)})"

# Development stage
FROM base AS development
USER root
RUN npm ci && npm cache clean --force
USER nodejs
CMD ["npm", "run", "dev"]

# Start the application
FROM base AS production
CMD ["npm", "start"]