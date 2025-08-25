# Requirements Document

## Introduction

This feature implements a lightweight API key management system for internal projects. The system allows a single administrator to create applications, generate API keys with custom prefixes, store flexible metadata, and provide validation services for other internal services. The system uses a dual-authentication approach with service API keys for endpoint protection and application client secrets for key validation. The solution prioritizes simplicity and effectiveness over production-grade features.

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to create and manage applications, so that I can organize API keys by project or service.

#### Acceptance Criteria

1. WHEN I access the admin panel THEN the system SHALL display a list of existing applications with key counts
2. WHEN I create a new application THEN the system SHALL require a name, prefix label, and optional default JSON template
3. WHEN I create an application THEN the system SHALL generate a unique prefix format (e.g., "sk-proj-{app-id}-{label}-")
4. WHEN I create an application THEN the system SHALL generate a unique client secret for validation
5. WHEN I view an application THEN the system SHALL show all associated API keys and their metadata
6. WHEN I delete an application THEN the system SHALL revoke all associated API keys
7. WHEN I regenerate an application's client secret THEN the system SHALL create a new unique client secret

### Requirement 2

**User Story:** As an administrator, I want to generate API keys for applications, so that I can provide secure access tokens to users.

#### Acceptance Criteria

1. WHEN I generate a new API key THEN the system SHALL use the application's prefix format
2. WHEN I generate a new API key THEN the system SHALL accept optional metadata (any string format)
3. WHEN I generate a new API key THEN the system SHALL create a unique random string suffix using URL-safe base64 encoding
4. WHEN I generate multiple keys for the same application THEN each key SHALL have a unique identifier
5. WHEN I view API keys THEN the system SHALL display the masked key, metadata, and creation date
6. WHEN I view API keys THEN the system SHALL provide option to reveal full key values

### Requirement 3

**User Story:** As an administrator, I want to rotate API keys, so that I can maintain security while preserving user access.

#### Acceptance Criteria

1. WHEN I rotate an API key THEN the system SHALL generate a new random string suffix
2. WHEN I rotate an API key THEN the system SHALL preserve all existing metadata
3. WHEN I rotate an API key THEN the system SHALL invalidate the old key immediately
4. WHEN I rotate an API key THEN the system SHALL return the new key value

### Requirement 4

**User Story:** As an administrator, I want to revoke API keys, so that I can remove access when needed.

#### Acceptance Criteria

1. WHEN I revoke an API key THEN the system SHALL mark it as invalid
2. WHEN I revoke an API key THEN the system SHALL remove all associated metadata
3. WHEN a revoked key is validated THEN the system SHALL return an error
4. WHEN I delete an API key THEN the system SHALL permanently remove it from storage

### Requirement 5

**User Story:** As a service developer, I want to validate API keys, so that I can authenticate requests in my applications.

#### Acceptance Criteria

1. WHEN I call the validation endpoint with a valid API key and client secret THEN the system SHALL return the metadata and application name
2. WHEN I call the validation endpoint with an invalid API key THEN the system SHALL return an error
3. WHEN I call the validation endpoint with an invalid client secret THEN the system SHALL return an error  
4. WHEN I call the validation endpoint THEN the system SHALL require a service API key for authorization
5. WHEN I call the validation endpoint with an invalid service API key THEN the system SHALL return an authentication error
6. WHEN I call the validation endpoint THEN the system SHALL respond within 200ms for valid requests

### Requirement 6

**User Story:** As a system administrator, I want to secure the validation service, so that only authorized services can validate API keys.

#### Acceptance Criteria

1. WHEN the system starts THEN it SHALL generate or load a single service API key
2. WHEN a validation request is made THEN the system SHALL verify the service API key in the Authorization header
3. WHEN an invalid service API key is provided THEN the system SHALL return a 401 Unauthorized response
4. WHEN no service API key is provided THEN the system SHALL return a 401 Unauthorized response
5. WHEN I access the admin panel THEN the system SHALL display the current service API key
6. WHEN I rotate the service API key THEN the system SHALL generate a new key and update the environment

### Requirement 7

**User Story:** As an administrator, I want to authenticate to the admin panel, so that only I can manage API keys.

#### Acceptance Criteria

1. WHEN I access the admin panel THEN the system SHALL require a password
2. WHEN I enter the correct admin password THEN the system SHALL create a session cookie
3. WHEN I have a valid session THEN the system SHALL allow access to admin functions
4. WHEN my session expires THEN the system SHALL redirect me to the login page
5. WHEN the system starts THEN it SHALL load the admin password from an environment variable

### Requirement 8

**User Story:** As an administrator, I want a simple admin interface, so that I can manage applications and API keys without using command-line tools.

#### Acceptance Criteria

1. WHEN I access the admin panel THEN the system SHALL display all applications in a responsive card grid
2. WHEN I click on an application THEN the system SHALL show all API keys for that application
3. WHEN I create, rotate, or revoke keys THEN the system SHALL update the interface immediately
4. WHEN I perform any action THEN the system SHALL show success or error messages
5. WHEN I view API keys THEN the system SHALL mask the key values by default with an option to reveal
6. WHEN I create or rotate keys THEN the system SHALL show the new key in a modal dialog
7. WHEN I manage client secrets THEN the system SHALL provide a dedicated interface for regeneration
8. WHEN I manage the service key THEN the system SHALL provide a dedicated interface section

### Requirement 9

**User Story:** As a developer, I want the system to use a simple database setup, so that I can deploy it easily in different environments.

#### Acceptance Criteria

1. WHEN running locally THEN the system SHALL use SQLite for data storage
2. WHEN deployed to production THEN the system SHALL use PostgreSQL
3. WHEN the system starts THEN it SHALL automatically create required database tables
4. WHEN storing API keys THEN the system SHALL hash them using SHA-256 for security
5. WHEN storing metadata THEN the system SHALL accept any string format without validation
6. WHEN storing application client secrets THEN the system SHALL generate unique secrets with "cs-" prefix
7. WHEN the system starts THEN it SHALL run database migrations automatically