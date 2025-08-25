# vince.js - The Keymaster

A lightweight API key management service for internal projects and prototypes. This POC allows you to create applications, generate API keys with custom prefixes, and validate keys through a simple REST API.

## Features

- **Application Management**: Create and organize API keys by project
- **Secure Key Generation**: Generate unique API keys with custom prefixes
- **Key Validation**: REST API for validating API keys
- **Admin Interface**: Simple web UI for managing applications and keys
- **Docker Support**: Run with Docker Compose for easy deployment

## Quick Start

### Development Mode

#### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables for local development
# The .env.local file is already configured for SQLite development
cat .env.local

# 3. Set up database schema and run migrations
npm run db:migrate:dev

# 4. Start development server
npm run dev
```

#### Subsequent Runs

After the first setup, you only need:

```bash
npm run dev
```

#### Troubleshooting Local Development

If you encounter database errors (like "table does not exist"):

```bash
# Reset and recreate the database (uses .env.local automatically)
npm run db:migrate:dev

# Or manually with the script
./scripts/dev-migrate.sh

# For a complete reset (removes all data)
npm run clean:db && npm run db:migrate:dev
```

Visit http://localhost:3000 to access the admin interface.

### Cleanup Build Artifacts

During development, you might want to clean up build artifacts:

```bash
# Clean only build artifacts (keeps database)
npm run clean
./cleanup_dev.sh

# Clean build artifacts AND database
npm run clean:all
./cleanup_dev.sh --with-db

# Clean only database (keeps build artifacts)
npm run clean:db
```

**Note:** After cleaning the database, you'll need to run `npm run db:migrate:dev` before starting the app again.

### Development Database Tools

The project includes special scripts for local development that properly handle `.env.local`:

```bash
# Database migrations (uses .env.local automatically)
npm run db:migrate:dev

# Database studio/viewer (uses .env.local automatically)
npm run db:studio:dev

# Complete database reset (uses .env.local automatically)
npm run db:reset:dev

# Manual script usage
./scripts/dev-prisma.sh <command>  # Any Prisma command with .env.local
```

These scripts automatically:
1. Backup your production `.env` file
2. Use `.env.local` for the Prisma command
3. Restore your original `.env` file afterwards

### Docker Deployment

```bash
# Generate secrets and start services
make setup && make start

# Or manually:
npm run docker:setup
docker-compose up -d
```

The admin interface will be available at http://localhost:3000.

## API Key Validation

To validate an API key, you need both the API key and the application's client secret:

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Authorization: Bearer YOUR_SERVICE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk-proj-abc123-def456-xyz789",
    "clientSecret": "cs-abcdef123456"
  }'
```

Example response for a valid key:
```json
{
  "valid": true,
  "data": {
    "metadata": "user@example.com",
    "applicationName": "My Application",
    "keyId": "cky5678901234567890123456"
  }
}
```

Example response for an invalid key:
```json
{
  "valid": false,
  "error": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

## Docker Setup

### Production Deployment

The application includes automatic database migration on startup. When you run with Docker:

```bash
# Generate secrets and start services
npm run docker:setup
docker-compose up -d

# Or manually:
docker-compose up -d
```

The Docker setup will:
1. Wait for PostgreSQL to be ready
2. Configure the database schema (PostgreSQL vs SQLite)
3. Run all pending migrations automatically
4. Start the application

### Development with Docker

For development with hot reloading:

```bash
# Use the development override
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Database Migrations

Database migrations are handled automatically in Docker environments. For manual control:

```bash
# In the container
docker-compose exec app npx prisma migrate deploy

# Or rebuild with fresh database
docker-compose down -v  # Removes volumes
docker-compose up -d
```