import { NextRequest, NextResponse } from 'next/server'
import { validateAdminSession } from '@/lib/auth'
import { config } from '@/lib/config'

/**
 * GET /api/admin/service-key
 * Returns the current service API key for admin users
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    const sessionResult = await validateAdminSession(request)
    if (!sessionResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return the current service key
    return NextResponse.json({
      serviceKey: config.api.serviceApiKey
    })
    
  } catch (error) {
    console.error('Error fetching service key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
