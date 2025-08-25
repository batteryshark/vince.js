import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, verifySessionToken, createLogoutCookie } from '@/lib/auth';
import { removeSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = getSessionFromRequest(request);
    
    if (sessionToken) {
      // Verify and extract session ID
      const sessionPayload = verifySessionToken(sessionToken);
      
      if (sessionPayload?.sessionId) {
        // Remove session from database
        await removeSession(sessionPayload.sessionId);
      }
    }

    // Create response that clears the session cookie
    const response = NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    );

    // Clear session cookie
    response.headers.set('Set-Cookie', createLogoutCookie());

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, we should clear the cookie
    const response = NextResponse.json(
      { success: true, message: 'Logout completed' },
      { status: 200 }
    );
    
    response.headers.set('Set-Cookie', createLogoutCookie());
    return response;
  }
}