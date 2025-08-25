import { NextRequest, NextResponse } from 'next/server'
import { validateAdminSession } from '@/lib/auth'
import { generateServiceKey } from '@/lib/crypto'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

/**
 * POST /api/admin/service-key/rotate
 * Rotates the service API key by generating a new one and updating the .env file
 */
export async function POST(request: NextRequest) {
  try {
    // Validate admin session
    const sessionResult = await validateAdminSession(request)
    if (!sessionResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate new service key
    const newServiceKey = generateServiceKey()
    
    // Update the .env file
    const envPath = join(process.cwd(), '.env')
    
    try {
      // Read current .env file
      let envContent = readFileSync(envPath, 'utf8')
      
      // Replace the SERVICE_API_KEY line
      const serviceKeyRegex = /^SERVICE_API_KEY=.*$/m
      if (serviceKeyRegex.test(envContent)) {
        envContent = envContent.replace(serviceKeyRegex, `SERVICE_API_KEY=${newServiceKey}`)
      } else {
        // If the line doesn't exist, append it
        envContent += `\nSERVICE_API_KEY=${newServiceKey}\n`
      }
      
      // Write back to .env file
      writeFileSync(envPath, envContent)
      
      // Note: In a production environment, you might want to:
      // 1. Update a database record instead of the .env file
      // 2. Trigger a application restart/reload mechanism
      // 3. Use a secrets management service
      
      console.log('Service API key rotated successfully')
      
      return NextResponse.json({
        success: true,
        newKey: newServiceKey,
        message: 'Service API key rotated successfully. Note: You may need to restart the application for the change to take effect in all processes.'
      })
      
    } catch (fileError) {
      console.error('Error updating .env file:', fileError)
      return NextResponse.json(
        { error: 'Failed to update environment file' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error rotating service key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
