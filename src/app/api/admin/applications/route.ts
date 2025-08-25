import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isValidApplicationName, sanitizeString } from '@/lib/validation';
import { generateKeyPrefix, generateClientSecret } from '@/lib/crypto';

/**
 * GET /api/admin/applications
 * List all applications
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = requireAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Fetch all applications with their API key counts
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        prefixLabel: true,
        defaultTemplate: true,
        clientSecret: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { apiKeys: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the response to include key count
    const applicationsWithKeyCount = applications.map(app => ({
      id: app.id,
      name: app.name,
      keyPrefix: app.keyPrefix,
      prefixLabel: app.prefixLabel,
      defaultTemplate: JSON.parse(app.defaultTemplate),
      clientSecret: app.clientSecret,
      keyCount: app._count.apiKeys,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));

    return NextResponse.json({
      applications: applicationsWithKeyCount
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/applications
 * Create new application
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = requireAuth(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, prefixLabel, defaultTemplate } = body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Application name is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (!prefixLabel || typeof prefixLabel !== 'string') {
      return NextResponse.json(
        { error: 'Prefix label is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Sanitize and validate application name
    const sanitizedName = sanitizeString(name);
    if (!isValidApplicationName(sanitizedName)) {
      return NextResponse.json(
        { 
          error: 'Invalid application name. Must be 1-100 characters and contain only letters, numbers, spaces, and hyphens', 
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      );
    }

    // Sanitize and validate prefix label
    const sanitizedPrefixLabel = sanitizeString(prefixLabel);
    if (!sanitizedPrefixLabel || sanitizedPrefixLabel.length < 1 || sanitizedPrefixLabel.length > 50) {
      return NextResponse.json(
        { 
          error: 'Invalid prefix label. Must be 1-50 characters and contain only letters, numbers, spaces, and hyphens', 
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      );
    }

    // Validate default template (should be valid JSON object)
    let parsedTemplate = {};
    if (defaultTemplate) {
      if (typeof defaultTemplate !== 'object' || Array.isArray(defaultTemplate)) {
        return NextResponse.json(
          { error: 'Default template must be a valid JSON object', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      parsedTemplate = defaultTemplate;
    }

    try {
      // Generate client secret for the application
      const clientSecret = generateClientSecret();

      // Create application first to get the ID
      const application = await prisma.application.create({
        data: {
          name: sanitizedName,
          prefixLabel: sanitizedPrefixLabel,
          keyPrefix: 'temp', // Temporary value, will be updated below
          defaultTemplate: JSON.stringify(parsedTemplate),
          clientSecret
        }
      });

      // Generate the actual key prefix using the application ID
      const keyPrefix = generateKeyPrefix(application.id, sanitizedPrefixLabel);
      
      // Update the application with the correct key prefix
      const updatedApplication = await prisma.application.update({
        where: { id: application.id },
        data: { keyPrefix },
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          prefixLabel: true,
          defaultTemplate: true,
          clientSecret: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return NextResponse.json({
        application: {
          id: updatedApplication.id,
          name: updatedApplication.name,
          keyPrefix: updatedApplication.keyPrefix,
          prefixLabel: updatedApplication.prefixLabel,
          defaultTemplate: JSON.parse(updatedApplication.defaultTemplate),
          clientSecret: updatedApplication.clientSecret,
          keyCount: 0,
          createdAt: updatedApplication.createdAt,
          updatedAt: updatedApplication.updatedAt
        }
      }, { status: 201 });

    } catch (dbError: any) {
      // Handle unique constraint violation
      if (dbError.code === 'P2002' && dbError.meta?.target?.includes('name')) {
        return NextResponse.json(
          { error: 'Application name already exists', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}