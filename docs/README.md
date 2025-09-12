# VibeCaaS Platform Documentation

## Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+**: [Download here](https://nodejs.org/)
- **Docker & Docker Compose**: [Download here](https://docs.docker.com/get-docker/)
- **Git**: [Download here](https://git-scm.com/)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ttracx/VibeCaaSPlatform.git
   cd VibeCaaSPlatform
   ```

2. **Run the setup script:**
   ```bash
   ./scripts/setup-dev.sh
   ```

3. **Start the development environment:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Health Check: http://localhost:8000/health

### Default Login Credentials

For local development, you can use these credentials:
- **Email**: demo@vibecaas.com
- **Password**: demo123

## Architecture Overview

### Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Redis for caching
- **Container Runtime**: Docker + Kubernetes
- **Cloud Provider**: NVIDIA Cloud for GPU resources
- **Authentication**: JWT-based authentication

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   Backend API   │────│  NVIDIA Cloud   │
│   (React/Next)  │    │  (Node.js/K8s)  │    │   (GPU Compute) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │              ┌─────────────────┐              │
        └──────────────│   PostgreSQL    │──────────────┘
                       │   (Metadata)    │
                       └─────────────────┘
```

## API Documentation

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free"
  },
  "token": "jwt-token"
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### App Management Endpoints

#### GET /apps
Get all apps for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My App",
    "description": "App description",
    "language": "javascript",
    "framework": "react",
    "status": "running",
    "url": "https://my-app.vibecaas.com",
    "resources": {
      "cpu": "0.5 vCPU",
      "memory": "1GB",
      "storage": "5GB"
    }
  }
]
```

#### POST /apps
Create a new application.

**Request Body:**
```json
{
  "name": "My New App",
  "description": "Description of my app",
  "language": "python",
  "framework": "fastapi",
  "resources": {
    "cpu": "1 vCPU",
    "memory": "2GB",
    "storage": "10GB"
  }
}
```

### Resource Management Endpoints

#### GET /resources/usage
Get resource usage statistics for user's apps.

#### GET /resources/gpu
Get available NVIDIA GPU resources.

## Deployment Guide

### Production Deployment

1. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Build and deploy:**
   ```bash
   ./scripts/deploy.sh
   ```

### Environment Variables

#### Backend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend server port | `8000` |
| `DATABASE_URL` | PostgreSQL connection string | See .env.example |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NVIDIA_CLOUD_API_KEY` | NVIDIA Cloud API key | Required |

#### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

### NVIDIA Cloud Integration

#### GPU Resource Management

The platform integrates with NVIDIA Cloud to provide GPU compute resources:

1. **GPU Types Supported:**
   - NVIDIA RTX 4090 (24GB VRAM)
   - NVIDIA A100 (40GB VRAM)
   - NVIDIA H100 (80GB VRAM)

2. **Resource Allocation:**
   - Automatic GPU provisioning for ML/AI workloads
   - Dynamic scaling based on demand
   - Cost optimization with spot instances

3. **Configuration:**
   ```bash
   export NVIDIA_CLOUD_API_KEY="your-api-key"
   export NVIDIA_CLOUD_PROJECT_ID="your-project-id"
   export NVIDIA_CLOUD_REGION="us-west-1"
   ```

### Kubernetes Deployment

#### Prerequisites

- Kubernetes cluster with NVIDIA GPU Operator installed
- `kubectl` configured with cluster access
- Container registry for storing images

#### Deployment Steps

1. **Apply Kubernetes manifests:**
   ```bash
   kubectl apply -f infrastructure/kubernetes/
   ```

2. **Verify deployment:**
   ```bash
   kubectl get pods -n vibecaas
   kubectl get services -n vibecaas
   ```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Symptoms:** Backend fails to start with database connection error.

**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres redis
```

#### 2. Frontend Not Loading

**Symptoms:** White screen or build errors in frontend.

**Solution:**
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm install
npm run dev
```

#### 3. GPU Resources Not Available

**Symptoms:** Apps requiring GPU fail to start.

**Solution:**
- Verify NVIDIA Cloud API credentials
- Check GPU quota limits
- Ensure cluster has GPU nodes available

### Logs and Monitoring

#### View Application Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres
```

#### Kubernetes Logs

```bash
# View pod logs
kubectl logs -f deployment/vibecaas-backend -n vibecaas

# View events
kubectl get events -n vibecaas --sort-by='.lastTimestamp'
```

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test locally
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing ESLint configuration
- Write tests for new features
- Update documentation as needed

### Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm test
```

## Support

For support and questions:

- **Documentation**: This README and docs/ folder
- **Issues**: GitHub Issues
- **Community**: Discord Server (coming soon)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.