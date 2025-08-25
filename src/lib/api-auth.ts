import { NextRequest } from 'next/server';
import { ErrorCodes } from '@/types/api';

/**
 * Service API key authentication result
 */
export interface ServiceAuthResult {
  success: boolean;
  error?: {
    message: string;
    code: string;
    status: number;
  };
}

/**
 * Validate service API key from Authorization header
 * Used to protect validation endpoints from unauthorized access
 */
import { api } from './config';

export function validateServiceApiKey(request: NextRequest): ServiceAuthResult {
  const serviceApiKey = api.serviceApiKey;

  // Check if service API key is configured
  if (!serviceApiKey) {
    console.error('SERVICE_API_KEY environment variable not configured');
    return {
      success: false,
      error: {
        message: 'Service configuration error',
        code: ErrorCodes.INTERNAL_ERROR,
        status: 500
      }
    };
  }

  // Check for Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return {
      success: false,
      error: {
        message: 'Authorization header required',
        code: ErrorCodes.UNAUTHORIZED,
        status: 401
      }
    };
  }

  // Extract and validate Bearer token
  const token = authHeader.replace('Bearer ', '');
  if (token !== serviceApiKey) {
    return {
      success: false,
      error: {
        message: 'Invalid service API key',
        code: ErrorCodes.INVALID_SERVICE_KEY,
        status: 401
      }
    };
  }

  return { success: true };
}

/**
 * Middleware wrapper for service API key authentication
 * Returns error response if authentication fails, otherwise continues
 */
export function requireServiceAuth(request: NextRequest) {
  const authResult = validateServiceApiKey(request);
  
  if (!authResult.success && authResult.error) {
    return {
      isAuthenticated: false,
      errorResponse: {
        valid: false,
        error: authResult.error.message,
        code: authResult.error.code
      },
      status: authResult.error.status
    };
  }

  return {
    isAuthenticated: true
  };
}