import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { maskApiKey } from '@/lib/crypto';
import { generateApiKey, hashKey } from '@/lib/crypto';
import { isValidMetadata } from '@/lib/validation';

/**
 * GET /api/admin/applications/[id]/keys
 * List all API keys for a specific application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = requireAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate application ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Application ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found', code: 'APPLICATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Fetch all API keys for the application
    const apiKeys = await prisma.apiKey.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'desc' }
    });

    // Transform response to mask keys and include relevant data
    const keysWithMaskedValues = apiKeys.map(key => ({
      id: key.id,
      keyValue: maskApiKey(key.keyValue),
      metadata: key.metadata,
      applicationId: key.applicationId,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt
    }));

    return NextResponse.json({
      keys: keysWithMaskedValues,
      application: {
        id: application.id,
        name: application.name,
        keyPrefix: application.keyPrefix
      }
    });

  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/applications/[id]/keys
 * Generate a new API key for a specific application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = requireAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate application ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Application ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { metadata } = body;

    // Validate metadata if provided
    if (metadata !== undefined && !isValidMetadata(metadata)) {
      return NextResponse.json(
        { 
          error: 'Invalid metadata. Must be a string with maximum 2000 characters', 
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      );
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found', code: 'APPLICATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Generate new API key
    const newApiKey = generateApiKey(application.keyPrefix);
    const keyHash = hashKey(newApiKey);

    try {
      // Create API key in database
      const apiKey = await prisma.apiKey.create({
        data: {
          keyValue: newApiKey,
          keyHash,
          metadata: metadata || null,
          applicationId: id
        }
      });

      return NextResponse.json({
        key: {
          id: apiKey.id,
          keyValue: newApiKey, // Return full key only on creation
          metadata: apiKey.metadata,
          applicationId: apiKey.applicationId,
          createdAt: apiKey.createdAt,
          updatedAt: apiKey.updatedAt
        },
        application: {
          id: application.id,
          name: application.name,
          keyPrefix: application.keyPrefix
        }
      }, { status: 201 });

    } catch (dbError: any) {
      // Handle unique constraint violation (unlikely but possible)
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Key generation failed, please try again', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}