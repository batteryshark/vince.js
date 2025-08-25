import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/admin/keys/[id]
 * Revoke (delete) an API key
 */
export async function DELETE(
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

    try {
      // Check if API key exists first and get its details
      const existingKey = await prisma.apiKey.findUnique({
        where: { id },
        include: {
          application: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!existingKey) {
        return NextResponse.json(
          { error: 'API key not found', code: 'KEY_NOT_FOUND' },
          { status: 404 }
        );
      }

      // Delete the API key
      await prisma.apiKey.delete({
        where: { id }
      });

      return NextResponse.json({
        success: true,
        message: `API key in application "${existingKey.application.name}" has been revoked`,
        deletedKey: {
          id: existingKey.id,
          metadata: existingKey.metadata,
          applicationName: existingKey.application.name,
          applicationId: existingKey.application.id
        }
      });

    } catch (dbError: any) {
      // Handle case where key doesn't exist
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { error: 'API key not found', code: 'KEY_NOT_FOUND' },
          { status: 404 }
        );
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/keys/[id]
 * Get details of a specific API key
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

    // Validate key ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'API key ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Find the API key with its application
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            id: true,
            name: true,
            keyPrefix: true
          }
        }
      }
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found', code: 'KEY_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      key: {
        id: apiKey.id,
        keyValue: apiKey.keyValue, // This will be masked in the UI
        metadata: apiKey.metadata,
        applicationId: apiKey.applicationId,
        createdAt: apiKey.createdAt,
        updatedAt: apiKey.updatedAt
      },
      application: {
        id: apiKey.application.id,
        name: apiKey.application.name,
        keyPrefix: apiKey.application.keyPrefix
      }
    });

  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}