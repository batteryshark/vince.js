import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateClientSecret } from '@/lib/crypto';
import { ErrorCodes } from '@/types/api';

/**
 * POST /api/admin/applications/[id]/regenerate-secret
 * Regenerate the client secret for an application
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
        { error: 'Unauthorized', code: ErrorCodes.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const applicationId = params.id;

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, name: true }
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Application not found', code: ErrorCodes.APPLICATION_NOT_FOUND },
        { status: 404 }
      );
    }

    // Generate new client secret
    const newClientSecret = generateClientSecret();

    // Update the application with the new client secret
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { 
        clientSecret: newClientSecret,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        clientSecret: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      clientSecret: updatedApplication.clientSecret,
      message: `Client secret regenerated for application "${updatedApplication.name}"`
    });

  } catch (error) {
    console.error('Error regenerating client secret:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: ErrorCodes.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
