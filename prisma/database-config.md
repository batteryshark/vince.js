# Database Configuration

## Models
The database contains two main models:
- **Application**: Stores application information with name, key prefix, and default template
- **ApiKey**: Stores API keys with hashed values, usernames, and relationships to applications

## Development (SQLite)
The project uses SQLite for local development for simplicity.

```bash
# Set up development database
npm run db:setup
```

## Production (PostgreSQL)
For production deployment (e.g., Heroku), update your environment variables:

```bash
# Example PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/api_key_manager"
```

## Switching Between Databases

### For PostgreSQL (Production)
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update your environment variables
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### For SQLite (Development)
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Set `DATABASE_URL="file:./dev.db"`
3. Run setup:
   ```bash
   npm run db:setup
   ```

## Authentication
- Admin authentication uses JWT tokens stored in HTTP-only cookies
- No database session storage required (stateless authentication)
- Service API key stored as environment variable

## Notes
- The schema is designed to work with both SQLite and PostgreSQL
- JSON fields use String type for SQLite compatibility
- All migrations are database-agnostic where possible