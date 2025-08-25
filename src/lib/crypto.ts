import crypto from 'crypto'

export function generateApiKey(prefix: string): string {
  // Generate 24 random bytes (192 bits) for good security
  // Base64 encoding will make this ~32 characters
  const randomBytes = crypto.randomBytes(24)
  
  // Convert to base64 and make it URL-safe
  let randomSuffix = randomBytes.toString('base64')
    .replace(/\+/g, '-')    // Replace + with -
    .replace(/\//g, '_')    // Replace / with _
    .replace(/=+$/, '')     // Remove trailing = padding
  
  return `${prefix}${randomSuffix}`
}

export function generateServiceKey(): string {
  // Generate 24 random bytes for consistency with API keys
  const randomBytes = crypto.randomBytes(24)
  
  // Convert to base64 and make it URL-safe
  let randomString = randomBytes.toString('base64')
    .replace(/\+/g, '-')    // Replace + with -
    .replace(/\//g, '_')    // Replace / with _
    .replace(/=+$/, '')     // Remove trailing = padding
  
  return `svc-${randomString}`
}

export function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export function generateKeyPrefix(appId: string, prefixLabel: string): string {
  // Sanitize the prefix label: lowercase, replace spaces with hyphens, only alphanumeric and hyphens
  const cleanLabel = prefixLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  // Take first 8 characters of app ID for brevity
  const shortAppId = appId.substring(0, 8)
  
  return `sk-proj-${shortAppId}-${cleanLabel}-`
}

export function generateKeyPrefixFromLegacyName(appName: string): string {
  // For backward compatibility - convert app name to prefix label format
  const cleanName = appName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return cleanName
}

/**
 * Generate a random string of specified length
 * Used for various random identifiers
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate a session token for admin authentication
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate a client secret for application authentication
 * Format: cs-{32 character hex string}
 */
export function generateClientSecret(): string {
  const randomBytes = crypto.randomBytes(16)
  return `cs-${randomBytes.toString('hex')}`
}

/**
 * Mask an API key for display purposes
 * Shows first 8 characters and last 4 characters
 * Example: sk-myapp-a1b2c3d4...xyz9
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 12) {
    return key
  }
  
  const start = key.substring(0, 8)
  const end = key.substring(key.length - 4)
  return `${start}...${end}`
}

/**
 * Mask a client secret for display purposes
 * Shows first 8 characters and last 4 characters
 * Example: cs-a1b2c3d4...xyz9
 */
export function maskClientSecret(secret: string): string {
  if (!secret || secret.length < 12) {
    return secret
  }
  
  const start = secret.substring(0, 8)
  const end = secret.substring(secret.length - 4)
  return `${start}...${end}`
}