import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, generateSessionToken, createSessionCookie } from '@/lib/auth';
import { createSession } from '@/lib/session';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Validate input
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Verify admin password
    const isValidPassword = await verifyAdminPassword(password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    
    // Extract session ID from token for database storage
    const decoded = jwt.decode(sessionToken) as any;
    const sessionId = decoded?.sessionId;

    // Store session in database (optional tracking)
    if (sessionId) {
      await createSession(sessionId);
    }

    // Create response with session cookie
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', createSessionCookie(sessionToken));

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}