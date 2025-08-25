/**
 * Environment Configuration
 * Centralized configuration management for all environment variables
 */

export interface EnvironmentConfig {
  // Database Configuration
  database: {
    url: string;
    provider: 'sqlite' | 'postgresql';
  };
  
  // Authentication Configuration
  auth: {
    jwtSecret: string;
    adminPassword: string;
    sessionMaxAge: number; // in seconds
  };
  
  // API Configuration
  api: {
    serviceApiKey: string;
  };
  
  // Application Configuration
  app: {
    nodeEnv: 'development' | 'production' | 'test';
    isProduction: boolean;
    isDevelopment: boolean;
  };
}

/**
 * Validates that all required environment variables are present
 */
function validateEnvironmentVariables(): void {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ADMIN_PASSWORD',
    'SERVICE_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }
}

/**
 * Determines database provider based on DATABASE_URL
 */
function getDatabaseProvider(databaseUrl: string): 'sqlite' | 'postgresql' {
  if (databaseUrl.startsWith('file:')) {
    return 'sqlite';
  } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    return 'postgresql';
  } else {
    // Default to sqlite for development
    console.warn('Unknown database URL format, defaulting to sqlite');
    return 'sqlite';
  }
}

/**
 * Creates and validates the complete environment configuration
 */
function createEnvironmentConfig(): EnvironmentConfig {
  // Validate required environment variables first
  validateEnvironmentVariables();
  
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const databaseUrl = process.env.DATABASE_URL!;
  
  return {
    database: {
      url: databaseUrl,
      provider: getDatabaseProvider(databaseUrl)
    },
    
    auth: {
      jwtSecret: process.env.JWT_SECRET!,
      adminPassword: process.env.ADMIN_PASSWORD!,
      sessionMaxAge: 24 * 60 * 60 // 24 hours in seconds
    },
    
    api: {
      serviceApiKey: process.env.SERVICE_API_KEY!
    },
    
    app: {
      nodeEnv,
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development'
    }
  };
}

// Export the configuration singleton
export const config = createEnvironmentConfig();

// Export individual configuration sections for convenience
export const { database, auth, api, app } = config;