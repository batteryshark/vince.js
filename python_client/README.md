# Vince Python Client

A minimal Python client for validating API keys against a Vince service instance. Uses only standard library modules for maximum compatibility.

## Quick Start

### 1. Set Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example.client .env
# Edit .env with your actual values
```

Required environment variables:
- `VINCE_CLIENT_ID`: The service API key (SERVICE_API_KEY from your Vince instance)
- `VINCE_CLIENT_SECRET`: Your application's client secret
- `VINCE_BASE_URL`: Base URL of your Vince service (e.g., `http://localhost:3000`)

### 2. Test the Connection

```bash
# Load environment variables (if using .env file)
export $(cat .env | xargs)

# Test basic functionality
python3 vince_client.py
```

### 3. Validate an API Key

```bash
# Command line usage
python3 vince_client.py sk-proj-abc123-def456-xyz789

# Or use in your Python code
python3 -c "
import vince_client
result = vince_client.validate_key('sk-proj-abc123-def456-xyz789')
print('Valid!' if result['valid'] else f'Invalid: {result[\"error\"]}')
"
```

## Library Usage

```python
import vince_client

# Test if service is reachable
if vince_client.test_connection():
    print("Service is up!")

# Validate an API key
result = vince_client.validate_key("sk-proj-abc123-def456-xyz789")

if result['valid']:
    print(f"Valid key for app: {result['data']['applicationName']}")
    print(f"Metadata: {result['data']['metadata']}")
else:
    print(f"Invalid key: {result['error']}")
```

## API Reference

### `test_connection() -> bool`

Tests connectivity to the Vince service health endpoint.

**Returns:** `True` if service is reachable, `False` otherwise.

### `validate_key(api_key: str) -> Dict[str, Any]`

Validates an API key against the Vince service.

**Parameters:**
- `api_key`: The API key to validate

**Returns:** Dictionary with validation result:
- If valid: `{'valid': True, 'data': {'metadata': ..., 'applicationName': ..., 'keyId': ...}}`
- If invalid: `{'valid': False, 'error': '...', 'code': '...'}`

**Note:** If metadata is valid JSON, it will be automatically parsed into a Python dict. Otherwise, it remains as a string.

## Gateway Integration Example

```python
# Example middleware for a web gateway
import vince_client

def validate_request_api_key(request_headers):
    api_key = request_headers.get('X-API-Key')
    if not api_key:
        return None, "Missing API key"
    
    result = vince_client.validate_key(api_key)
    
    if result['valid']:
        return result['data'], None
    else:
        return None, result['error']

# Usage in your gateway
def handle_request(request):
    key_data, error = validate_request_api_key(request.headers)
    
    if error:
        return {"error": error, "status": 401}
    
    # Use key_data['metadata'] for user context
    # key_data['applicationName'] for app identification
    # Continue processing the request...
```

## Error Handling

The client handles various error conditions gracefully:

- **Configuration errors**: Missing environment variables
- **Network errors**: Connection timeouts, service unreachable
- **HTTP errors**: 401 Unauthorized, 500 Internal Server Error, etc.
- **JSON errors**: Invalid response format
- **Service errors**: Invalid API key, invalid client secret

All errors are returned in a consistent format with `valid: False`, `error` message, and `code`.

## Dependencies

None! Uses only Python standard library:
- `os` - Environment variable access
- `json` - JSON parsing
- `urllib` - HTTP requests
- `typing` - Type hints (Python 3.5+)

## Compatibility

- Python 3.5+
- No external dependencies
- Cross-platform (Windows, macOS, Linux)
