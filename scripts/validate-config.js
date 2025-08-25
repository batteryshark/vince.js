#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates all required environment variables and configuration
 */

require('dotenv').config();

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');
  
  const checks = [];
  
  // Check required environment variables
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET', 
    'ADMIN_PASSWORD',
    'SERVICE_API_KEY'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const isSet = !!value;
    const length = value ? value.length : 0;
    
    checks.push({
      name: varName,
      status: isSet ? '✅' : '❌',
      message: isSet ? `Set (${length} chars)` : 'Missing',
      critical: true
    });
  });
  
  // Check database URL format
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const isValidSqlite = databaseUrl.startsWith('file:');
    const isValidPostgres = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');
    
    checks.push({
      name: 'DATABASE_URL Format',
      status: (isValidSqlite || isValidPostgres) ? '✅' : '⚠️',
      message: isValidSqlite ? 'SQLite' : isValidPostgres ? 'PostgreSQL' : 'Unknown format',
      critical: false
    });
  }
  
  // Check JWT secret strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    const isStrong = jwtSecret.length >= 32;
    checks.push({
      name: 'JWT_SECRET Strength',
      status: isStrong ? '✅' : '⚠️',
      message: isStrong ? 'Strong (32+ chars)' : 'Weak (< 32 chars)',
      critical: false
    });
  }
  
  // Check environment mode
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  
  checks.push({
    name: 'NODE_ENV',
    status: '✅',
    message: `${nodeEnv}${isProduction ? ' (production mode)' : ''}`,
    critical: false
  });
  
  // Display results
  console.log('Configuration Check Results:');
  console.log('═'.repeat(50));
  
  let hasErrors = false;
  let hasWarnings = false;
  
  checks.forEach(check => {
    console.log(`${check.status} ${check.name.padEnd(20)} ${check.message}`);
    
    if (check.status === '❌' && check.critical) {
      hasErrors = true;
    } else if (check.status === '⚠️') {
      hasWarnings = true;
    }
  });
  
  console.log('═'.repeat(50));
  
  // Summary
  if (hasErrors) {
    console.log('❌ Configuration validation failed!');
    console.log('Please fix the missing environment variables before proceeding.');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Configuration validation passed with warnings.');
    console.log('Consider addressing the warnings for better security.');
  } else {
    console.log('✅ Configuration validation passed!');
    console.log('All environment variables are properly configured.');
  }
  
  // Additional production checks
  if (isProduction) {
    console.log('\n🔒 Production Security Checklist:');
    console.log('- Ensure JWT_SECRET is cryptographically secure');
    console.log('- Use a strong ADMIN_PASSWORD');
    console.log('- Generate SERVICE_API_KEY with sufficient entropy');
    console.log('- Enable HTTPS in production');
    console.log('- Configure proper database backups');
  }
}

if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment };