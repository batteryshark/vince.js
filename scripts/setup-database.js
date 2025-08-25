#!/usr/bin/env node

/**
 * Database Setup Script
 * Dynamically configures Prisma schema based on DATABASE_URL
 */

const fs = require('fs');
const path = require('path');

function getDatabaseProvider(databaseUrl) {
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  if (databaseUrl.startsWith('file:')) {
    return 'sqlite';
  } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    return 'postgresql';
  } else {
    console.warn('Unknown database URL format, defaulting to sqlite');
    return 'sqlite';
  }
}

function updatePrismaSchema(provider) {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('Prisma schema file not found at:', schemaPath);
    process.exit(1);
  }
  
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Update the provider in the datasource block
  schemaContent = schemaContent.replace(
    /provider\s*=\s*"(sqlite|postgresql)"/,
    `provider = "${provider}"`
  );
  
  fs.writeFileSync(schemaPath, schemaContent);
  console.log(`✅ Updated Prisma schema to use ${provider} provider`);
}

function main() {
  // Load environment variables
  require('dotenv').config();
  
  const databaseUrl = process.env.DATABASE_URL;
  const provider = getDatabaseProvider(databaseUrl);
  
  console.log(`🔧 Setting up database configuration...`);
  console.log(`📊 Database URL: ${databaseUrl}`);
  console.log(`🗄️  Provider: ${provider}`);
  
  updatePrismaSchema(provider);
  
  console.log(`✨ Database setup complete!`);
}

if (require.main === module) {
  main();
}

module.exports = { getDatabaseProvider, updatePrismaSchema };