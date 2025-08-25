#!/usr/bin/env python3
"""
Minimal Python client for Vince API key validation service.

This script provides a simple interface to validate API keys against a Vince
service instance using only standard library modules.

Environment Variables Required:
- VINCE_CLIENT_ID: The service API key (SERVICE_API_KEY)
- VINCE_CLIENT_SECRET: The application client secret
- VINCE_BASE_URL: Base URL of the Vince service (e.g., http://localhost:3000)

Usage:
    import vince_client
    
    # Test connection
    if vince_client.test_connection():
        print("Service is reachable")
    
    # Validate an API key
    result = vince_client.validate_key("sk-proj-abc123-def456")
    if result['valid']:
        print(f"Valid key: {result['data']}")
    else:
        print(f"Invalid key: {result['error']}")
"""

import os
import json
import urllib.request
import urllib.parse
import urllib.error
from typing import Dict, Any, Optional


def _get_env_var(name: str) -> str:
    """Get required environment variable or raise ValueError."""
    value = os.environ.get(name)
    if not value:
        raise ValueError(f"Required environment variable {name} is not set")
    return value


def _get_config() -> Dict[str, str]:
    """Get configuration from environment variables."""
    return {
        'client_id': _get_env_var('VINCE_CLIENT_ID'),
        'client_secret': _get_env_var('VINCE_CLIENT_SECRET'),
        'base_url': _get_env_var('VINCE_BASE_URL').rstrip('/')
    }


def _make_request(url: str, data: Optional[Dict[str, Any]] = None, method: str = 'GET') -> Dict[str, Any]:
    """Make HTTP request to the Vince service."""
    config = _get_config()
    
    # Prepare headers
    headers = {
        'Authorization': f"Bearer {config['client_id']}",
        'Content-Type': 'application/json',
        'User-Agent': 'vince-python-client/1.0'
    }
    
    # Prepare request
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode('utf-8')
    
    request = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            response_data = response.read().decode('utf-8')
            return json.loads(response_data)
    
    except urllib.error.HTTPError as e:
        # Try to parse error response
        try:
            error_data = json.loads(e.read().decode('utf-8'))
            return error_data
        except (json.JSONDecodeError, UnicodeDecodeError):
            return {
                'valid': False,
                'error': f'HTTP {e.code}: {e.reason}',
                'code': f'HTTP_{e.code}'
            }
    
    except urllib.error.URLError as e:
        return {
            'valid': False,
            'error': f'Connection error: {str(e.reason)}',
            'code': 'CONNECTION_ERROR'
        }
    
    except json.JSONDecodeError as e:
        return {
            'valid': False,
            'error': f'Invalid JSON response: {str(e)}',
            'code': 'JSON_DECODE_ERROR'
        }
    
    except Exception as e:
        return {
            'valid': False,
            'error': f'Unexpected error: {str(e)}',
            'code': 'UNEXPECTED_ERROR'
        }


def test_connection() -> bool:
    """
    Test connection to the Vince service by hitting the health endpoint.
    
    Returns:
        True if service is reachable and responding, False otherwise.
    """
    try:
        config = _get_config()
        health_url = f"{config['base_url']}/api/health"
        
        # Simple GET request to health endpoint (no auth required)
        request = urllib.request.Request(health_url, method='GET')
        with urllib.request.urlopen(request, timeout=5) as response:
            return response.getcode() == 200
    
    except Exception:
        return False


def validate_key(api_key: str) -> Dict[str, Any]:
    """
    Validate an API key against the Vince service.
    
    Args:
        api_key: The API key to validate
        
    Returns:
        Dictionary with validation result:
        - If valid: {'valid': True, 'data': {'metadata': ..., 'applicationName': ..., 'keyId': ...}}
        - If invalid: {'valid': False, 'error': '...', 'code': '...'}
        
    The metadata field will be converted to a dict if it's valid JSON, otherwise left as string.
    """
    try:
        config = _get_config()
        validate_url = f"{config['base_url']}/api/validate"
        
        payload = {
            'apiKey': api_key,
            'clientSecret': config['client_secret']
        }
        
        result = _make_request(validate_url, payload, 'POST')
        
        # If validation was successful and we have metadata, try to parse it as JSON
        if result.get('valid') and result.get('data', {}).get('metadata'):
            metadata = result['data']['metadata']
            if isinstance(metadata, str):
                try:
                    result['data']['metadata'] = json.loads(metadata)
                except json.JSONDecodeError:
                    # Leave as string if it's not valid JSON
                    pass
        
        return result
        
    except ValueError as e:
        return {
            'valid': False,
            'error': str(e),
            'code': 'CONFIGURATION_ERROR'
        }


if __name__ == '__main__':
    """Simple CLI interface for testing."""
    import sys
    
    print("Vince API Key Validation Client")
    print("=" * 40)
    
    # Test connection
    print("Testing connection...")
    if test_connection():
        print("✓ Service is reachable")
    else:
        print("✗ Service is not reachable")
        sys.exit(1)
    
    # If API key provided as argument, validate it
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
        print(f"\nValidating key: {api_key}")
        
        result = validate_key(api_key)
        
        if result['valid']:
            print("✓ Key is valid")
            data = result['data']
            print(f"  Application: {data['applicationName']}")
            print(f"  Key ID: {data['keyId']}")
            print(f"  Metadata: {data['metadata']}")
        else:
            print("✗ Key is invalid")
            print(f"  Error: {result['error']}")
            print(f"  Code: {result['code']}")
    else:
        print("\nUsage: python vince_client.py <api_key_to_validate>")
        print("Or import as module and use validate_key() function")
