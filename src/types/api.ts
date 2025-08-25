// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface ValidationResponse {
  valid: boolean
  data?: {
    metadata: string | null
    applicationName: string
    keyId: string
  }
  error?: string
}

// Error Types
export interface ApiError {
  error: string
  code: string
  details?: any
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_SERVICE_KEY: 'INVALID_SERVICE_KEY',
  APPLICATION_NOT_FOUND: 'APPLICATION_NOT_FOUND',
  KEY_NOT_FOUND: 'KEY_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const

// Application types
export interface CreateApplicationRequest {
  name: string
  prefixLabel: string
  defaultTemplate?: Record<string, any>
}

export interface Application {
  id: string
  name: string
  keyPrefix: string
  prefixLabel: string
  defaultTemplate: Record<string, any>
  clientSecret: string
  keyCount?: number
  createdAt: Date
  updatedAt: Date
  apiKeys?: ApiKey[]
}

export interface ApplicationListResponse {
  applications: Application[]
}

export interface ApplicationResponse {
  application: Application
}

// API Key types
export interface CreateApiKeyRequest {
  metadata?: string // Optional metadata (can be JSON, username, or any string)
}

export interface ApiKey {
  id: string
  keyValue: string // Full key (masked in responses)
  keyHash?: string
  metadata: string | null
  applicationId: string
  createdAt: Date
  updatedAt: Date
  application?: Application
}

export interface ApiKeyListResponse {
  keys: ApiKey[]
  application: {
    id: string
    name: string
    keyPrefix: string
  }
}

export interface ApiKeyResponse {
  key: ApiKey
  application: {
    id: string
    name: string
    keyPrefix: string
  }
  message?: string
}

export interface ApiKeyDeleteResponse {
  success: boolean
  message: string
  deletedKey: {
    id: string
    metadata: string | null
    applicationName: string
    applicationId: string
  }
}

// Authentication types
export interface LoginRequest {
  password: string
}

export interface LoginResponse {
  success: boolean
  message?: string
}

// Validation types
export interface ValidateKeyRequest {
  apiKey: string
  clientSecret: string
}

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]