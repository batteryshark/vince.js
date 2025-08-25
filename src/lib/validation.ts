/**
 * Validation utilities for input data
 */

/**
 * Validate metadata format
 * Used for metadata field validation - can be any string or null
 */
export function isValidMetadata(metadata: string | null | undefined): boolean {
    // Metadata is optional, so null/undefined is valid
    if (metadata === null || metadata === undefined) {
        return true;
    }

    // If provided, must be a string with reasonable length
    if (typeof metadata !== 'string') {
        return false;
    }

    // Allow empty string and reasonable length limit
    return metadata.length <= 2000; // Generous limit for JSON or other data
}

/**
 * Validate application name
 * Must be non-empty and contain only alphanumeric characters, spaces, and hyphens
 */
export function isValidApplicationName(name: string): boolean {
    if (!name || typeof name !== 'string') {
        return false;
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
        return false;
    }

    // Allow alphanumeric characters, spaces, and hyphens
    const nameRegex = /^[a-zA-Z0-9\s-]+$/;
    return nameRegex.test(trimmedName);
}

/**
 * Validate API key format
 * Should start with a prefix and have sufficient length
 */
export function isValidApiKeyFormat(key: string): boolean {
    if (!key || typeof key !== 'string') {
        return false;
    }

    // API keys should be at least 20 characters and start with a prefix pattern
    return key.length >= 20 && /^[a-z]+-[a-z0-9-]+-[a-f0-9]+$/.test(key);
}

/**
 * Sanitize string input by trimming whitespace
 */
export function sanitizeString(input: string): string {
    return typeof input === 'string' ? input.trim() : '';
}

/**
 * Extract application prefix from an API key
 * Example: sk-myapp-a1b2c3d4... -> sk-myapp-
 */
export function extractKeyPrefix(key: string): string | null {
    if (!key || typeof key !== 'string') {
        return null;
    }

    // Match pattern: prefix-appname-randomstring
    const match = key.match(/^([a-z]+-[a-z0-9-]+-)/);
    return match ? match[1] : null;
}

/**
 * Validate that a key matches the expected application prefix
 */
export function validateKeyPrefix(key: string, expectedPrefix: string): boolean {
    const actualPrefix = extractKeyPrefix(key);
    return actualPrefix === expectedPrefix;
}