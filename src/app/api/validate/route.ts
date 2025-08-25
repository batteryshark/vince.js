import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashKey } from '@/lib/crypto';
import { isValidApiKeyFormat } from '@/lib/validation';
import { requireServiceAuth } from '@/lib/api-auth';
import { ErrorCodes } from '@/types/api';

/**
 * POST /api/validate
 * Validate an API key and return associated metadata
 * Requires service API key authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check service API key authentication
    const authResult = requireServiceAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        authResult.errorResponse,
        { status: authResult.status }
      );
    }

    // Parse request body
    const body = await request.json();
    const { apiKey, clientSecret } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { 
          valid: false,
          error: 'API key is required',
          code: ErrorCodes.VALIDATION_ERROR
        },
        { status: 400 }
      );
    }

    if (!clientSecret || typeof clientSecret !== 'string') {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Client secret is required',
          code: ErrorCodes.VALIDATION_ERROR
        },
        { status: 400 }
      );
    }

    // Validate API key format
    if (!isValidApiKeyFormat(apiKey)) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Invalid API key format',
          code: ErrorCodes.INVALID_API_KEY
        },
        { status: 400 }
      );
    }

    // Hash the provided API key for lookup
    const keyHash = hashKey(apiKey);

    // Look up the API key in the database
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: {
        application: {
          select: {
            id: true,
            name: true,
            clientSecret: true
          }
        }
      }
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Invalid API key',
          code: ErrorCodes.INVALID_API_KEY
        },
        { status: 401 }
      );
    }

    // Verify that the client secret matches the application's client secret
    if (apiKeyRecord.application.clientSecret !== clientSecret) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Invalid client secret for this application',
          code: ErrorCodes.INVALID_API_KEY
        },
        { status: 401 }
      );
    }

    // Return successful validation with metadata
    return NextResponse.json({
      valid: true,
      data: {
        metadata: apiKeyRecord.metadata,
        applicationName: apiKeyRecord.application.name,
        keyId: apiKeyRecord.id
      }
    });

  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Internal server error',
        code: ErrorCodes.INTERNAL_ERROR
      },
      { status: 500 }
    );
  }
}