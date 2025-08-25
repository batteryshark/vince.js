import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { auth, app } from './config';

const JWT_SECRET = auth.jwtSecret;
const ADMIN_PASSWORD = auth.adminPassword;

export interface SessionPayload {
  sessionId: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

/**
 * Verify admin password
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    // For simplicity, we're doing direct comparison
    // In production, you'd hash the admin password
    return password === ADMIN_PASSWORD;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate JWT session token
 */
export function generateSessionToken(): string {
  const sessionId = crypto.randomUUID();
  const payload = {
    sessionId,
    isAdmin: true,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h',
  });
}

/**
 * Verify JWT session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Extract session token from request cookies
 */
export function getSessionFromRequest(request: NextRequest): string | null {
  return request.cookies.get('session')?.value || null;
}

/**
 * Create session cookie response
 */
export function createSessionCookie(token: string): string {
  const isProduction = app.isProduction;
  
  return `session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${
    isProduction ? '; Secure' : ''
  }`;
}

/**
 * Create logout cookie response (clears session)
 */
export function createLogoutCookie(): string {
  return 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict';
}

/**
 * Middleware to check if user is authenticated
 */
export function requireAuth(request: NextRequest): SessionPayload | null {
  const sessionToken = getSessionFromRequest(request);
  
  if (!sessionToken) {
    return null;
  }

  return verifySessionToken(sessionToken);
}

/**
 * Validate admin session for API endpoints
 */
export async function validateAdminSession(request: NextRequest): Promise<{ isValid: boolean; sessionPayload?: SessionPayload }> {
  try {
    const sessionToken = getSessionFromRequest(request);
    
    if (!sessionToken) {
      return { isValid: false };
    }

    const sessionPayload = verifySessionToken(sessionToken);
    
    if (!sessionPayload || !sessionPayload.isAdmin) {
      return { isValid: false };
    }

    return { isValid: true, sessionPayload };
  } catch (error) {
    console.error('Admin session validation error:', error);
    return { isValid: false };
  }
}