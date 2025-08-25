# Product Overview

## API Key Manager

A simple spike/POC API key management system for personal projects and quick work prototypes. Designed for speed and simplicity over production features. Single admin, basic key generation, and simple validation - perfect for internal tools and demos.

## Key Features

- **Application Management**: Create and organize API keys by project or service
- **Secure Key Generation**: Generate unique API keys with custom prefixes and random suffixes
- **User Metadata**: Store username/email information with each API key
- **Key Lifecycle**: Support for key rotation and revocation
- **Validation Service**: REST API for external services to validate API keys
- **Admin Interface**: Simple web UI for managing applications and keys
- **Multi-Environment**: SQLite for development, PostgreSQL for production

## Target Users

- **Primary**: Developers building personal projects and work POCs
- **Secondary**: Small internal tools needing basic API key auth
- **Scope**: Spikes, prototypes, and simple internal tools - not production systems