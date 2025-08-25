# Project Structure

## Root Directory Layout
```
api-key-manager/
├── .env                    # Environment variables (local development)
├── .env.example           # Environment template
├── .gitignore             # Git ignore patterns
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── next.config.js         # Next.js configuration
├── README.md              # Project documentation
├── prisma/                # Database schema and migrations
├── src/                   # Application source code
└── tests/                 # Test files
```

## Prisma Directory
```
prisma/
├── schema.prisma          # Database schema definition
├── migrations/            # Database migration files
│   └── [timestamp]_[name]/
│       └── migration.sql
└── dev.db                 # SQLite database (development)
```

## Source Code Structure
```
src/
├── app/                   # Next.js App Router directory
│   ├── api/              # API routes
│   │   ├── admin/        # Protected admin endpoints
│   │   │   ├── applications/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── keys/
│   │   │   │           └── route.ts
│   │   │   └── keys/
│   │   │       └── [id]/
│   │   │           ├── rotate/
│   │   │           │   └── route.ts
│   │   │           └── route.ts
│   │   ├── auth/         # Authentication endpoints
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   └── logout/
│   │   │       └── route.ts
│   │   └── validate/     # Key validation endpoint
│   │       └── route.ts
│   ├── admin/            # Admin panel pages
│   │   ├── page.tsx      # Dashboard
│   │   ├── layout.tsx    # Admin layout
│   │   └── applications/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── login/            # Login page
│   │   └── page.tsx
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── crypto.ts         # Key generation and hashing
│   ├── db.ts             # Database connection
│   ├── session.ts        # Session management
│   └── validation.ts     # Input validation
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── admin/           # Admin-specific components
│   │   ├── ApplicationList.tsx
│   │   ├── KeyManager.tsx
│   │   └── CreateApplication.tsx
│   └── auth/            # Authentication components
│       └── LoginForm.tsx
├── types/               # TypeScript type definitions
│   ├── api.ts          # API response types
│   ├── auth.ts         # Authentication types
│   └── database.ts     # Database model types
└── middleware.ts       # Next.js middleware for auth
```

## API Route Organization

### Admin Routes (Protected)
- `GET /api/admin/applications` - List applications
- `POST /api/admin/applications` - Create application
- `DELETE /api/admin/applications/[id]` - Delete application
- `GET /api/admin/applications/[id]/keys` - List keys for application
- `POST /api/admin/applications/[id]/keys` - Generate new key
- `PUT /api/admin/keys/[id]/rotate` - Rotate existing key
- `DELETE /api/admin/keys/[id]` - Revoke key

### Public Routes
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `POST /api/validate` - Validate API key (service protected)

## File Naming Conventions

### Components
- Use PascalCase for component files: `ApplicationList.tsx`
- Use descriptive names that indicate purpose
- Group related components in subdirectories

### API Routes
- Use lowercase with hyphens for route segments
- Follow RESTful naming: `/applications`, `/keys`
- Use `route.ts` for App Router API handlers

### Utilities
- Use camelCase for utility files: `keyGenerator.ts`
- Group by functionality in `/lib` directory
- Export functions with descriptive names

### Types
- Use PascalCase for type names: `ApiResponse`, `UserSession`
- Group related types in single files
- Export interfaces and types explicitly

## Environment Configuration

### Development (.env.local)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret-key"
ADMIN_PASSWORD="your-admin-password"
SERVICE_API_KEY="your-service-api-key"
NODE_ENV="development"
```

### Production (Environment Variables)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="secure-production-secret"
ADMIN_PASSWORD="secure-admin-password"
SERVICE_API_KEY="secure-service-key"
NODE_ENV="production"
```

## Key Patterns (Spike-Friendly)

### Keep It Simple
- Put logic where it makes sense (don't over-architect)
- Use Prisma for database stuff
- Basic TypeScript for safety
- Simple file organization

### Minimal Complexity
- Basic auth checks (no complex middleware)
- Simple error handling (try/catch + console.log)
- Environment variables for config
- Focus on getting it working quickly

### Pragmatic Structure
- Organize files logically but don't overthink it
- Use TypeScript where it helps
- Skip complex patterns for a spike
- Prioritize speed over perfect architecture