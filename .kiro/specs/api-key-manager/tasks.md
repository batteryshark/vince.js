# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Initialize Next.js TypeScript project with required dependencies
  - Install Prisma, authentication libraries, and development tools
  - Configure TypeScript and Next.js settings
  - _Requirements: 8.1, 8.2_

- [x] 2. Configure database and Prisma setup
  - Create Prisma schema with Application, ApiKey, and AdminSession models
  - Set up database configuration for SQLite (dev) and PostgreSQL (prod)
  - Generate Prisma client and run initial migration
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3. Implement core utility functions
  - Create API key generation utilities with prefix and random suffix
  - Implement key hashing functions using SHA-256
  - Build email validation utility for username field
  - _Requirements: 2.2, 2.3, 8.5_

- [x] 4. Create authentication system
  - Implement admin login API route with password verification
  - Build JWT session management with HTTP-only cookies
  - Create session validation middleware for protected routes
  - Add logout functionality to clear sessions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 5. Build application management API routes
  - Create GET /api/admin/applications endpoint to list all applications
  - Implement POST /api/admin/applications to create new applications
  - Build DELETE /api/admin/applications/[id] to remove applications
  - Add validation for application name uniqueness and required fields
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Implement API key management endpoints
  - Create GET /api/admin/applications/[id]/keys to list keys for an application
  - Build POST /api/admin/applications/[id]/keys to generate new API keys
  - Implement PUT /api/admin/keys/[id]/rotate for key rotation
  - Create DELETE /api/admin/keys/[id] to revoke API keys
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

- [x] 7. Build API key validation service
  - Create POST /api/validate endpoint for external services
  - Implement service API key authentication middleware
  - Build key lookup and validation logic using hashed keys
  - Return metadata and application name for valid keys
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

- [x] 8. Create admin login page
  - Build login form component with password input
  - Implement client-side form validation and submission
  - Add error handling and success feedback
  - Handle session creation and redirect to admin panel
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 9. Build main admin dashboard
  - Create applications list view with create/delete actions
  - Implement application detail view showing API keys
  - Add key management interface (generate, rotate, revoke)
  - Include key masking with reveal option for security
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10. Basic error handling (MVP approach)
  - API routes include try/catch blocks with appropriate HTTP status codes
  - Client-side components handle basic error states
  - Simple console.log debugging (no complex error middleware needed)
  - _Requirements: 5.2, 6.3, 6.4_

- [x] 11. Set up environment configuration
  - Create environment variable configuration for all settings
  - Set up database URL switching between SQLite and PostgreSQL
  - Configure JWT secrets and admin password from environment
  - Add service API key environment variable setup
  - _Requirements: 6.1, 7.5, 8.1, 8.2_

- [x] 12. Write essential tests (MVP approach)
  - Create basic unit tests for core crypto and validation utilities
  - Build critical integration test for API key validation endpoint
  - Test basic authentication login functionality
  - Focus on critical paths only - this is a POC/spike, not production
  - _Requirements: Core functionality validation for MVP_

- [ ] 13. Add deployment configuration
  - Create Docker configuration for containerized deployment
  - Set up Heroku deployment configuration
  - Configure production database migrations
  - Add production environment variable documentation
  - _Requirements: 8.1, 8.2_