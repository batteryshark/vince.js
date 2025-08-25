# Design Document

## Overview

The API Key Manager is a lightweight Next.js application that provides secure API key management for internal projects. The system uses a simple admin authentication model with JWT-based sessions and provides both a web interface for management and REST API endpoints for key validation. The system implements a dual-authentication approach using service API keys for endpoint protection and application client secrets for key validation.

## Architecture

### Technology Stack
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS v4.1+
- **Database**: SQLite (local development) / PostgreSQL (production)
- **ORM**: Prisma for type-safe database operations
- **Authentication**: Simple password-based admin auth with JWT sessions
- **Deployment**: Docker Compose with multi-stage builds
- **Security**: bcryptjs for password hashing, SHA-256 for API key hashing

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   API Routes    │    │    Database     │
│   (Next.js UI)  │◄──►│  (Validation)   │◄──►│   (Prisma)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Session Mgmt  │    │  External APIs  │
│   (JWT Cookies) │    │  (Validation)   │
└─────────────────┘    └─────────────────┘
```

## Components and Interfaces

### Database Schema (Prisma)

```prisma
model Application {
  id              String   @id @default(cuid())
  name            String   @unique
  keyPrefix       String   // e.g., "sk-proj-{id}-{label}-"
  prefixLabel     String   // Custom label for the key prefix
  defaultTemplate String   // Default key-value template as JSON string
  clientSecret    String   @unique // Application client secret for validation
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  apiKeys         ApiKey[]
}

model ApiKey {
  id            String      @id @default(cuid())
  keyValue      String      @unique // Full API key (for display, will be masked)
  keyHash       String      @unique // SHA-256 hash for validation
  metadata      String?     // Optional metadata (any string format)
  applicationId String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
}

model AdminSession {
  id        String   @id @default(cuid())
  sessionId String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

### API Endpoints

#### Admin Routes (Protected)
- `GET /api/admin/applications` - List all applications with key counts
- `POST /api/admin/applications` - Create new application with client secret
- `GET /api/admin/applications/[id]` - Get application details
- `DELETE /api/admin/applications/[id]` - Delete application and all keys
- `POST /api/admin/applications/[id]/regenerate-secret` - Regenerate application client secret
- `GET /api/admin/applications/[id]/keys` - List keys for application
- `POST /api/admin/applications/[id]/keys` - Generate new API key
- `GET /api/admin/keys/[id]` - Get API key details
- `PUT /api/admin/keys/[id]/rotate` - Rotate API key
- `DELETE /api/admin/keys/[id]` - Revoke API key
- `GET /api/admin/service-key` - Get current service API key
- `POST /api/admin/service-key/rotate` - Rotate service API key

#### Authentication Routes
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

#### Validation Routes (Service API Key Protected)
- `POST /api/validate` - Validate API key with client secret and return metadata

#### Health Check Routes
- `GET /api/health` - System health check endpoint

### Key Generation Algorithm

```typescript
interface KeyGenerator {
  generateApiKey(prefix: string): string
  generateServiceKey(): string
  generateClientSecret(): string
  generateKeyPrefix(appId: string, prefixLabel: string): string
  hashKey(key: string): string
  maskApiKey(key: string): string
}

// Implementation
function generateApiKey(prefix: string): string {
  // Generate 24 random bytes (192 bits) for good security
  const randomBytes = crypto.randomBytes(24)
  
  // Convert to base64 and make it URL-safe
  let randomSuffix = randomBytes.toString('base64')
    .replace(/\+/g, '-')    // Replace + with -
    .replace(/\//g, '_')    // Replace / with _
    .replace(/=+$/, '')     // Remove trailing = padding
  
  return `${prefix}${randomSuffix}`
}

function generateKeyPrefix(appId: string, prefixLabel: string): string {
  const cleanLabel = prefixLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const shortAppId = appId.substring(0, 8)
  
  return `sk-proj-${shortAppId}-${cleanLabel}-`
}

function generateClientSecret(): string {
  const randomBytes = crypto.randomBytes(16)
  return `cs-${randomBytes.toString('hex')}`
}

function generateServiceKey(): string {
  const randomBytes = crypto.randomBytes(24)
  let randomString = randomBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  
  return `svc-${randomString}`
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

function maskApiKey(key: string): string {
  if (!key || key.length < 12) return key
  
  const start = key.substring(0, 8)
  const end = key.substring(key.length - 4)
  return `${start}...${end}`
}
```

### Admin Authentication Flow

```typescript
interface AuthService {
  login(password: string): Promise<{ success: boolean; sessionToken?: string }>
  validateSession(sessionToken: string): Promise<boolean>
  logout(sessionToken: string): Promise<void>
}

// JWT-based session management
const sessionConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production'
}
```

## Data Models

### Application Model
```typescript
interface Application {
  id: string
  name: string
  keyPrefix: string // e.g., "sk-proj-{id}-{label}-"
  prefixLabel: string
  defaultTemplate: Record<string, any>
  clientSecret: string
  keyCount?: number
  createdAt: Date
  updatedAt: Date
  apiKeys?: ApiKey[]
}
```

### API Key Model
```typescript
interface ApiKey {
  id: string
  keyValue: string // Full key (for display, masked)
  keyHash?: string // SHA-256 hash for validation
  metadata: string | null // Optional metadata (any string format)
  applicationId: string
  createdAt: Date
  updatedAt: Date
  application?: Application
}
```

### Validation Response
```typescript
interface ValidationResponse {
  valid: boolean
  data?: {
    metadata: string | null
    applicationName: string
    keyId: string
  }
  error?: string
}
```

## User Interface Components

### Admin Interface Layout
The admin interface is built using React components with Tailwind CSS for styling. The main layout consists of:

```typescript
// Main admin page structure
interface AdminPageComponents {
  ApplicationList: React.Component // Grid-based application cards
  KeyManager: React.Component     // Detailed key management for selected app
  ServiceKeyManager: React.Component // Service API key management
}
```

### Modal Components
The interface uses several modal dialogs for user interactions:

```typescript
interface ModalComponents {
  CreateApplicationModal: React.Component  // Create new applications
  CreateKeyModal: React.Component         // Generate new API keys
  ClientSecretModal: React.Component      // Manage application client secrets
  ServiceKeyModal: React.Component        // Manage service API key
  KeyRevealModal: React.Component         // Show newly created/rotated keys
}
```

### UI Component Features
- **Key Masking**: API keys and secrets are masked by default (e.g., "sk-proj-abc...xyz9")
- **Responsive Design**: Grid layouts adapt to different screen sizes
- **Dark Theme**: Modals use a dark theme for better focus
- **Loading States**: Components show loading indicators during operations
- **Error Handling**: User-friendly error messages and validation feedback
- **Copy to Clipboard**: Easy copying of keys and secrets

### Application Card Display
Each application is displayed as a card showing:
- Application name and prefix label
- Key count and creation date
- Quick actions (view keys, manage client secret, delete)
- Visual indicators for key counts

### Key Management Interface
The key management view provides:
- Tabular display of all keys for an application
- Masked key values with reveal option
- Metadata display and editing
- Key rotation and deletion actions
- Breadcrumb navigation back to applications

## Error Handling

### API Error Responses
```typescript
interface ApiError {
  error: string
  code: string
  details?: any
}

// Standard error codes
const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_SERVICE_KEY: 'INVALID_SERVICE_KEY',
  APPLICATION_NOT_FOUND: 'APPLICATION_NOT_FOUND',
  KEY_NOT_FOUND: 'KEY_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const
```

### Error Handling Middleware
```typescript
// Next.js API route error wrapper
function withErrorHandling(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    try {
      await handler(req, res)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: error.message,
          code: 'VALIDATION_ERROR'
        })
      }
      
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED'
        })
      }
      
      return res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
```

## Testing Strategy

### Unit Tests
- **Database Operations**: Test Prisma models and queries
- **Key Generation**: Verify key format and uniqueness
- **Authentication**: Test login/logout and session validation
- **API Validation**: Test key validation logic

### Integration Tests
- **API Endpoints**: Test all admin and validation endpoints
- **Database Integration**: Test with both SQLite and PostgreSQL
- **Authentication Flow**: End-to-end admin login/logout

### Test Structure
```typescript
// Example test structure
describe('API Key Management', () => {
  describe('Key Generation', () => {
    it('should generate unique keys with correct prefix')
    it('should hash keys consistently')
  })
  
  describe('Key Validation', () => {
    it('should validate correct API keys')
    it('should reject invalid API keys')
    it('should require service API key for validation')
  })
  
  describe('Admin Operations', () => {
    it('should create applications with default templates')
    it('should generate keys for applications')
    it('should rotate keys while preserving metadata')
  })
})
```

### Environment Configuration
```typescript
// Environment variables
interface EnvironmentConfig {
  database: {
    url: string
    provider: 'sqlite' | 'postgresql'
  }
  auth: {
    jwtSecret: string
    adminPassword: string
    sessionMaxAge: number
  }
  api: {
    serviceApiKey: string
  }
  app: {
    nodeEnv: 'development' | 'production' | 'test'
    isProduction: boolean
    isDevelopment: boolean
  }
}

// Database configuration
const databaseConfig = {
  development: {
    provider: 'sqlite',
    url: 'file:./prisma/dev.db'
  },
  production: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL
  }
}
```

### Deployment Configuration
```typescript
// Docker deployment features
interface DeploymentFeatures {
  multiStageBuilds: boolean      // Optimized Docker images
  automaticMigrations: boolean   // Database migrations on startup
  healthChecks: boolean          // Container health monitoring
  volumePersistence: boolean     // Data persistence in production
  environmentValidation: boolean // Startup configuration validation
}

// Development tools
interface DevelopmentTools {
  hotReloading: boolean          // Next.js development mode
  databaseStudio: boolean        // Prisma Studio integration
  migrationScripts: boolean      // Automated migration helpers
  cleanupScripts: boolean        // Development cleanup utilities
}
```

### Security Considerations
- **Key Storage**: API keys are hashed using SHA-256 before database storage
- **Session Security**: Admin sessions use HTTP-only JWT cookies with secure flag in production
- **Service Authentication**: Service API key stored as environment variable for endpoint protection
- **Client Authentication**: Application client secrets provide additional validation layer
- **Password Security**: Admin passwords hashed using bcryptjs with salt
- **Input Validation**: All endpoints validate input data and sanitize user input
- **SQL Injection Protection**: Prisma ORM provides built-in protection against SQL injection
- **Key Masking**: Sensitive values masked in UI by default with reveal options
- **Environment Validation**: Startup validation ensures all required environment variables are present
- **Database Migrations**: Automatic schema management with version control