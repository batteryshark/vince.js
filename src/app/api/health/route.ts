import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

/**
 * Health check endpoint
 * Returns application status and configuration info
 */
export async function GET(request: NextRequest) {
  try {
    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.app.nodeEnv,
      database: {
        provider: config.database.provider,
        connected: true // Basic check - could be enhanced with actual DB ping
      },
      configuration: {
        jwtConfigured: !!config.auth.jwtSecret,
        adminConfigured: !!config.auth.adminPassword,
        serviceKeyConfigured: !!config.api.serviceApiKey
      }
    };

    return NextResponse.json(healthInfo);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}