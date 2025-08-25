# Technology Stack

## Framework & Runtime
- **Next.js 14+** with TypeScript - Full-stack React framework with App Router
- **Node.js** - JavaScript runtime environment
- **TypeScript** - Type-safe JavaScript development

## Database & ORM
- **Prisma ORM** - Type-safe database access and schema management
- **SQLite** - Development database (file-based)
- **PostgreSQL** - Production database (via Heroku)
- **Database Migrations** - Managed via Prisma Migrate

## Authentication & Security
- **JWT (JSON Web Tokens)** - Session management with HTTP-only cookies
- **SHA-256 Hashing** - API key storage security
- **Environment Variables** - Configuration management
- **Password-based Admin Auth** - Simple admin authentication

## API Architecture
- **Next.js API Routes** - RESTful API endpoints
- **TypeScript Types** - `NextApiRequest` and `NextApiResponse` for type safety
- **Error Handling Middleware** - Standardized error responses
- **Service API Key Protection** - Validation endpoint security

## Development Tools
- **Prisma Studio** - Database GUI for development
- **TypeScript Compiler** - Type checking and compilation
- **Environment Configuration** - `.env` files for local development

## Common Commands

### Development Setup
```bash
# Initialize TypeScript configuration
npx tsc --init

# Install dependencies
npm install

# Set up Prisma
npx prisma init
npx prisma generate
npx prisma db push  # For development
npx prisma migrate dev  # For migrations
```

### Database Operations
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Apply schema changes to database
npx prisma db push

# Create and apply migrations
npx prisma migrate dev --name <migration-name>

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

### Development Server
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing (Optional for Spike)
```bash
# Basic testing if needed
npm test
```

## Key Patterns (Keep It Simple)

### API Route Structure
- Basic TypeScript types for safety
- Simple auth checks (no complex middleware)
- RESTful-ish endpoints (don't overthink it)
- Basic error responses (just return what went wrong)

### Database Schema Conventions
- Use Prisma schema (it's easy)
- Stick with simple field names
- Basic relations between models
- Don't worry about complex mappings for a spike

### Error Handling (Minimal)
- Basic try/catch blocks
- Simple HTTP status codes: 401, 500
- Console.log for debugging (no fancy logging)
- Focus on functionality over robust error handling