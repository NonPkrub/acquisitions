# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Local Development

- `npm run dev` - Start with hot reload using Node.js watch mode
- `npm run dev:docker` - Start full Docker development environment with Neon Local
- `npm run prod:docker` - Start production Docker environment

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Database Operations

- `npm run db:generate` - Generate database migrations with Drizzle
- `npm run db:migrate` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio for database management

### Docker Commands

- **Development**: `docker-compose --env-file .env.development.local -f docker-compose.dev.yml up -d`
- **Production**: `docker-compose --env-file .env.production.local -f docker-compose.prod.yml up -d`
- **View logs**: `docker-compose -f docker-compose.dev.yml logs -f`
- **Database access**: `docker-compose -f docker-compose.dev.yml exec neon-local psql -U neon -d main`

## Architecture Overview

### Tech Stack

- **Runtime**: Node.js 20+ with ES modules
- **Framework**: Express.js with modern middleware stack
- **Database**: PostgreSQL via Neon Database with Drizzle ORM
- **Security**: Arcjet for rate limiting, bot detection, and shield protection
- **Logging**: Winston with structured JSON logging
- **Validation**: Zod for schema validation
- **Authentication**: JWT with bcrypt password hashing

### Project Structure

```
src/
├── config/         # Configuration modules (database, logger, arcjet)
├── controllers/    # Request handlers (auth, user)
├── middleware/     # Custom middleware (security)
├── models/         # Drizzle ORM schema definitions
├── routes/         # Express route definitions
├── services/       # Business logic layer
├── utils/          # Utility functions (JWT, cookies, format)
├── validations/    # Zod validation schemas
├── app.js          # Express app configuration
├── server.js       # Server startup
└── index.js        # Application entry point
```

### Import Path Aliases

The project uses Node.js subpath imports for clean imports:

- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

### Database Architecture

- **ORM**: Drizzle with Neon serverless adapter
- **Development**: Uses Neon Local proxy with ephemeral branches
- **Production**: Direct connection to Neon Cloud
- **Migrations**: Managed via `drizzle-kit`
- **Schema**: Defined in `src/models/` with TypeScript-like definitions

### Security Layer

- **Arcjet Integration**: Comprehensive protection with shield, bot detection, and rate limiting
- **Role-based Rate Limiting**:
  - Guest: 5 requests/minute
  - User: 10 requests/minute
  - Admin: 20 requests/minute
- **Security Headers**: Helmet.js for standard security headers
- **CORS**: Configured for cross-origin requests

### Environment Configuration

- **Development**: Uses `.env.development.local` with Neon Local
- **Production**: Uses `.env.production.local` with Neon Cloud
- **Required Variables**: `DATABASE_URL`, `NEON_API_KEY`, `NEON_PROJECT_ID`, `PARENT_BRANCH_ID`, `ARCJET_KEY`

## Development Guidelines

### Database Development

- Always use Drizzle migrations for schema changes
- Test migrations in development environment first
- Use `npm run db:studio` for visual database management
- Development uses ephemeral branches for isolated testing

### Security Implementation

- All routes protected by Arcjet security middleware
- Rate limits are role-based and configurable
- JWT tokens used for authentication with secure cookie handling
- Password hashing with bcrypt

### Docker Workflow

- Development environment includes hot reload and debugging tools
- Production uses multi-stage builds for optimized images
- Neon Local provides branch-per-feature database isolation
- Health checks ensure service reliability

### Code Standards

- ES modules with strict linting rules
- 2-space indentation, single quotes, semicolons required
- Prettier for consistent formatting
- No unused variables (except underscore-prefixed)
- Arrow functions preferred over function expressions

### Logging and Monitoring

- Structured JSON logging via Winston
- Request logging via Morgan
- Error and combined logs written to `logs/` directory
- Console output in development, file-only in production
