#!/usr/bin/env node

/**
 * Secret Generation Script
 * Generates secure random secrets and creates .env file for Docker Compose
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateReadablePassword(length = 16) {
  // Generate a more readable password using base64 (no special chars that might cause issues)
  return crypto.randomBytes(Math.ceil(length * 3 / 4)).toString('base64').slice(0, length);
}

function generateAPIKey() {
  // Generate a service API key with a prefix for easy identification
  const prefix = 'svc_';
  const key = crypto.randomBytes(24).toString('hex');
  return `${prefix}${key}`;
}

function createEnvFile() {
  const secrets = {
    POSTGRES_PASSWORD: generateReadablePassword(24),
    JWT_SECRET: generateSecureSecret(64),
    ADMIN_PASSWORD: generateReadablePassword(20),
    SERVICE_API_KEY: generateAPIKey()
  };

  const envContent = `# Generated secrets for Docker Compose
# Generated on: ${new Date().toISOString()}

# Database Configuration
POSTGRES_DB=apikeys
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${secrets.POSTGRES_PASSWORD}
DATABASE_URL=postgresql://postgres:${secrets.POSTGRES_PASSWORD}@db:5432/apikeys

# Application Secrets
JWT_SECRET=${secrets.JWT_SECRET}
ADMIN_PASSWORD=${secrets.ADMIN_PASSWORD}
SERVICE_API_KEY=${secrets.SERVICE_API_KEY}

# Environment
NODE_ENV=production
`;

  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);

  return secrets;
}

function displaySecrets(secrets) {
  console.log('\n🔐 Admin Credentials');
  console.log('=' .repeat(40));
  console.log(`📧 Admin Password: ${secrets.ADMIN_PASSWORD}`);
  console.log('=' .repeat(40));
  console.log('\n📋 Important Notes:');
  console.log('• Save this password in a secure location');
  console.log('• Use this to log into the web admin interface');
  console.log('• Service API keys can be managed in the admin panel');
  console.log('• All secrets have been written to .env file');
  console.log('\n🚀 You can now run: docker-compose up -d');
  console.log('\n🌐 Admin interface will be available at: http://localhost:3000');
}

function main() {
  console.log('🔧 Generating secure secrets...');
  
  try {
    const secrets = createEnvFile();
    displaySecrets(secrets);
    
    console.log('\n✅ Setup complete!');
  } catch (error) {
    console.error('❌ Error generating secrets:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateSecureSecret, generateReadablePassword, generateAPIKey, createEnvFile };
