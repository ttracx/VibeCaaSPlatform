# VibeCaaS API Documentation

## Base URL
```
Production: https://api.vibecaas.com
Staging: https://staging-api.vibecaas.com
Local: http://localhost:8000
```

## Authentication

All API requests require authentication using JWT tokens.

### Get Access Token
```http
POST /api/v1/auth/token
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=yourpassword
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Using the Token
Include the token in the Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer {token}
```

### User Management

#### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer {token}
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "tier": "pro",
  "created_at": "2024-01-01T00:00:00Z",
  "quotas": {
    "max_apps": 20,
    "max_cpu": 2000,
    "max_memory": 8192,
    "max_storage": 20480,
    "gpu_enabled": true
  }
}
```

#### Update User Profile
```http
PUT /api/v1/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_name": "John Smith",
  "email": "john.smith@example.com"
}
```

### Application Management

#### List Applications
```http
GET /api/v1/apps
Authorization: Bearer {token}
```

Query Parameters:
- `status`: Filter by status (running, stopped, failed)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response:
```json
{
  "items": [
    {
      "id": "app-uuid",
      "name": "my-app",
      "description": "My application",
      "framework": "fastapi",
      "status": "running",
      "url": "https://my-app-johndoe.vibecaas.com",
      "created_at": "2024-01-01T00:00:00Z",
      "resources": {
        "cpu": 1000,
        "memory": 2048,
        "storage": 5120,
        "gpu": false
      }
    }
  ],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

#### Create Application
```http
POST /api/v1/apps
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "my-app",
  "description": "My awesome application",
  "framework": "fastapi",
  "github_repo": "https://github.com/user/repo",
  "branch": "main",
  "environment_variables": {
    "DEBUG": "false",
    "DATABASE_URL": "postgresql://..."
  },
  "port": 8000,
  "cpu_limit": 1000,
  "memory_limit": 2048,
  "storage_limit": 5120,
  "gpu_enabled": false,
  "health_check_path": "/health"
}
```

#### Get Application Details
```http
GET /api/v1/apps/{app_id}
Authorization: Bearer {token}
```

#### Update Application
```http
PUT /api/v1/apps/{app_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Updated description",
  "environment_variables": {
    "NEW_VAR": "value"
  },
  "cpu_limit": 2000,
  "memory_limit": 4096
}
```

#### Delete Application
```http
DELETE /api/v1/apps/{app_id}
Authorization: Bearer {token}
```

#### Start Application
```http
POST /api/v1/apps/{app_id}/start
Authorization: Bearer {token}
```

#### Stop Application
```http
POST /api/v1/apps/{app_id}/stop
Authorization: Bearer {token}
```

#### Restart Application
```http
POST /api/v1/apps/{app_id}/restart
Authorization: Bearer {token}
```

#### Scale Application
```http
POST /api/v1/apps/{app_id}/scale
Authorization: Bearer {token}
Content-Type: application/json

{
  "replicas": 3
}
```

#### Get Application Logs
```http
GET /api/v1/apps/{app_id}/logs
Authorization: Bearer {token}
```

Query Parameters:
- `lines`: Number of lines to return (default: 100)
- `follow`: Stream logs in real-time (default: false)
- `since`: Show logs since timestamp

Response:
```json
{
  "logs": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "level": "INFO",
      "message": "Application started"
    }
  ]
}
```

#### Get Application Metrics
```http
GET /api/v1/apps/{app_id}/metrics
Authorization: Bearer {token}
```

Query Parameters:
- `period`: Time period (1h, 24h, 7d, 30d)
- `metric`: Specific metric (cpu, memory, requests)

Response:
```json
{
  "metrics": {
    "cpu": {
      "current": 0.5,
      "average": 0.3,
      "max": 0.8,
      "data": [
        {"timestamp": "2024-01-01T00:00:00Z", "value": 0.3}
      ]
    },
    "memory": {
      "current": 512,
      "average": 400,
      "max": 600,
      "data": [
        {"timestamp": "2024-01-01T00:00:00Z", "value": 400}
      ]
    },
    "requests": {
      "total": 10000,
      "rate": 100,
      "errors": 5,
      "data": [
        {"timestamp": "2024-01-01T00:00:00Z", "value": 100}
      ]
    }
  }
}
```

### Deployments

#### List Deployments
```http
GET /api/v1/deployments
Authorization: Bearer {token}
```

Query Parameters:
- `app_id`: Filter by application
- `status`: Filter by status

#### Get Deployment Details
```http
GET /api/v1/deployments/{deployment_id}
Authorization: Bearer {token}
```

#### Trigger Deployment
```http
POST /api/v1/deployments
Authorization: Bearer {token}
Content-Type: application/json

{
  "app_id": "app-uuid",
  "source": "github",
  "branch": "main",
  "commit": "abc123"
}
```

#### Rollback Deployment
```http
POST /api/v1/deployments/{deployment_id}/rollback
Authorization: Bearer {token}
```

### Billing

#### Get Subscription Status
```http
GET /api/v1/billing/subscription
Authorization: Bearer {token}
```

Response:
```json
{
  "tier": "pro",
  "status": "active",
  "current_period_start": "2024-01-01T00:00:00Z",
  "current_period_end": "2024-02-01T00:00:00Z",
  "cancel_at_period_end": false,
  "payment_method": {
    "type": "card",
    "last4": "4242",
    "brand": "visa"
  }
}
```

#### Update Subscription
```http
PUT /api/v1/billing/subscription
Authorization: Bearer {token}
Content-Type: application/json

{
  "tier": "team"
}
```

#### Cancel Subscription
```http
DELETE /api/v1/billing/subscription
Authorization: Bearer {token}
```

#### Get Usage
```http
GET /api/v1/billing/usage
Authorization: Bearer {token}
```

Response:
```json
{
  "period": "2024-01",
  "usage": {
    "compute_hours": 720,
    "storage_gb_hours": 5000,
    "bandwidth_gb": 100,
    "gpu_hours": 24
  },
  "estimated_cost": 50.00
}
```

#### Get Invoices
```http
GET /api/v1/billing/invoices
Authorization: Bearer {token}
```

#### Get Payment Methods
```http
GET /api/v1/billing/payment-methods
Authorization: Bearer {token}
```

#### Add Payment Method
```http
POST /api/v1/billing/payment-methods
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "card",
  "token": "stripe_token"
}
```

### GPU Management

#### List Available GPUs
```http
GET /api/v1/gpu/available
Authorization: Bearer {token}
```

Response:
```json
{
  "gpus": [
    {
      "type": "T4",
      "available": 5,
      "total": 10,
      "specs": {
        "memory": 16,
        "compute_capability": 7.5,
        "cost_per_hour": 0.526
      }
    }
  ]
}
```

#### Allocate GPU
```http
POST /api/v1/gpu/allocate
Authorization: Bearer {token}
Content-Type: application/json

{
  "app_id": "app-uuid",
  "gpu_type": "T4",
  "duration_hours": 1
}
```

#### Release GPU
```http
DELETE /api/v1/gpu/allocations/{allocation_id}
Authorization: Bearer {token}
```

#### Get GPU Usage
```http
GET /api/v1/gpu/usage
Authorization: Bearer {token}
```

### Admin Endpoints

#### List All Users (Admin Only)
```http
GET /api/v1/admin/users
Authorization: Bearer {admin_token}
```

#### Update User Tier (Admin Only)
```http
PUT /api/v1/admin/users/{user_id}/tier
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "tier": "enterprise"
}
```

#### System Status (Admin Only)
```http
GET /api/v1/admin/system/status
Authorization: Bearer {admin_token}
```

#### Cluster Metrics (Admin Only)
```http
GET /api/v1/admin/metrics
Authorization: Bearer {admin_token}
```

## WebSocket API

### Connect to Logs Stream
```javascript
const ws = new WebSocket('wss://api.vibecaas.com/ws/apps/{app_id}/logs');
ws.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log(log);
};
```

### Connect to Metrics Stream
```javascript
const ws = new WebSocket('wss://api.vibecaas.com/ws/apps/{app_id}/metrics');
ws.onmessage = (event) => {
  const metric = JSON.parse(event.data);
  console.log(metric);
};
```

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Application not found",
    "details": {
      "app_id": "invalid-uuid"
    }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Resource does not exist
- `VALIDATION_ERROR`: Invalid request data
- `QUOTA_EXCEEDED`: Resource quota exceeded
- `PAYMENT_REQUIRED`: Subscription required
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limits

| Tier | Requests/Minute | Requests/Hour |
|------|----------------|---------------|
| Free | 60 | 1000 |
| Hobby | 120 | 2000 |
| Pro | 300 | 5000 |
| Team | 600 | 10000 |
| Enterprise | Unlimited | Unlimited |

Rate limit headers:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704067200
```

## SDK Examples

### Python
```python
import requests

class VibeCaaSClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.vibecaas.com"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def list_apps(self):
        response = requests.get(
            f"{self.base_url}/api/v1/apps",
            headers=self.headers
        )
        return response.json()
    
    def create_app(self, app_data):
        response = requests.post(
            f"{self.base_url}/api/v1/apps",
            headers=self.headers,
            json=app_data
        )
        return response.json()

# Usage
client = VibeCaaSClient("your-api-key")
apps = client.list_apps()
```

### JavaScript/TypeScript
```typescript
class VibeCaaSClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.vibecaas.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async listApps(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/apps`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async createApp(appData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/apps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appData)
    });
    return response.json();
  }
}

// Usage
const client = new VibeCaaSClient('your-api-key');
const apps = await client.listApps();
```

### cURL
```bash
# List applications
curl -X GET https://api.vibecaas.com/api/v1/apps \
  -H "Authorization: Bearer your-api-key"

# Create application
curl -X POST https://api.vibecaas.com/api/v1/apps \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app",
    "framework": "fastapi",
    "cpu_limit": 1000,
    "memory_limit": 2048
  }'
```