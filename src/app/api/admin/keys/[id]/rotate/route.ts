import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateApiKey, hashKey } from '@/lib/crypto';

/**
 * PUT /api/admin/keys/[id]/rotate
 * Rotate an existing API key (generate new key value while preserving metadata)
 */
export async function PUT(
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

    // Validate key ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'API key ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Find the existing API key with its application
    const existingKey = await prisma.apiKey.findUnique({
      where: { id },
      include: {
        application: true
      }
    });

    if (!existingKey) {
      return NextResponse.json(
        { error: 'API key not found', code: 'KEY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Generate new API key using the same application prefix
    const newApiKey = generateApiKey(existingKey.application.keyPrefix);
    const newKeyHash = hashKey(newApiKey);

    try {
      // Update the API key with new values while preserving metadata
      const updatedKey = await prisma.apiKey.update({
        where: { id },
        data: {
          keyValue: newApiKey,
          keyHash: newKeyHash,
          updatedAt: new Date()
        },
        include: {
          application: true
        }
      });

      return NextResponse.json({
        key: {
          id: updatedKey.id,
          keyValue: newApiKey, // Return full new key value
          metadata: updatedKey.metadata,
          applicationId: updatedKey.applicationId,
          createdAt: updatedKey.createdAt,
          updatedAt: updatedKey.updatedAt
        },
        application: {
          id: updatedKey.application.id,
          name: updatedKey.application.name,
          keyPrefix: updatedKey.application.keyPrefix
        },
        message: 'API key rotated successfully'
      });

    } catch (dbError: any) {
      // Handle unique constraint violation (very unlikely but possible)
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Key rotation failed, please try again', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Error rotating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}