import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/admin/applications/[id]
 * Delete application and all associated API keys
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

    // Validate application ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Application ID is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    try {
      // Check if application exists first
      const existingApplication = await prisma.application.findUnique({
        where: { id },
        include: {
          _count: {
            select: { apiKeys: true }
          }
        }
      });

      if (!existingApplication) {
        return NextResponse.json(
          { error: 'Application not found', code: 'APPLICATION_NOT_FOUND' },
          { status: 404 }
        );
      }

      // Delete application (cascade will delete all associated API keys)
      await prisma.application.delete({
        where: { id }
      });

      return NextResponse.json({
        success: true,
        message: `Application "${existingApplication.name}" and ${existingApplication._count.apiKeys} associated API keys deleted successfully`
      });

    } catch (dbError: any) {
      // Handle case where application doesn't exist
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { error: 'Application not found', code: 'APPLICATION_NOT_FOUND' },
          { status: 404 }
        );
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/applications/[id]
 * Get single application details
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

    // Fetch application with API key count
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        _count: {
          select: { apiKeys: true }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found', code: 'APPLICATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      application: {
        id: application.id,
        name: application.name,
        keyPrefix: application.keyPrefix,
        defaultTemplate: JSON.parse(application.defaultTemplate),
        keyCount: application._count.apiKeys,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}