# VibeCaaS.com - Container as a Service Platform

A complete infrastructure solution for VibeCaaS.com - a Replit/Lovable-like platform that automatically provisions isolated containers on NVIDIA Cloud for each user application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     VibeCaaS Frontend                        │
│                   (React/Next.js Web IDE)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   VibeCaaS API Gateway                       │
│                  (Kong/NGINX + Auth0/JWT)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬─────────────────┐
        │                         │                 │
┌───────▼────────┐  ┌─────────────▼──────┐  ┌──────▼─────────┐
│ Provisioning   │  │   App Management   │  │    Billing     │
│   Service      │  │      Service       │  │    Service     │
└───────┬────────┘  └─────────────┬──────┘  └────────────────┘
        │                         │
┌───────▼─────────────────────────▼──────────────────────────┐
│              NVIDIA Cloud Infrastructure                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Kubernetes Cluster (DGX Cloud/NGC)         │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │ User App │  │ User App │  │ User App │  ...   │    │
│  │  │Container │  │Container │  │Container │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

## Features

- **Multi-tenant Container Provisioning**: Isolated containers for each user application
- **Web-based IDE**: Full-featured code editor with syntax highlighting
- **Real-time Collaboration**: Multiple users can work on the same project
- **GPU Support**: NVIDIA GPU acceleration for AI/ML workloads
- **Auto-scaling**: Dynamic resource allocation based on usage
- **Billing Integration**: Usage-based pricing with NVIDIA Cloud
- **Security**: Namespace isolation and network policies

## 🚀 Live Demo

**Experience the VibeCaaS platform**: [https://vibecaas-demo.github.io](https://vibecaas-demo.github.io)

The demo showcases the complete frontend interface with:
- Interactive application management
- Real-time resource monitoring
- Application creation workflow
- Responsive design for all devices

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Kubernetes cluster (minikube for local development)
- NVIDIA Cloud account (for production)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd vibecaas-platform
   npm install
   ```

2. **Start Development Environment**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Gateway: http://localhost:8080

### Docker Deployment

1. **Build and Start**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

2. **Access Services**
   - Web App: http://localhost:3000
   - API: http://localhost:8000

### Kubernetes Deployment

1. **Deploy to Kubernetes**
   ```bash
   npm run k8s:deploy
   ```

2. **Access via Ingress**
   - Web App: http://vibecaas.local
   - API: http://api.vibecaas.local

## Project Structure

```
vibecaas-platform/
├── frontend/                 # React/Next.js frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API service layer
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── services/       # Microservices
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   └── utils/          # Utility functions
│   └── config/             # Configuration files
├── k8s/                    # Kubernetes manifests
│   ├── namespaces/         # Namespace definitions
│   ├── deployments/        # Application deployments
│   ├── services/           # Service definitions
│   └── ingress/            # Ingress configurations
├── terraform/              # Infrastructure as Code
│   ├── nvidia-cloud/       # NVIDIA Cloud resources
│   └── kubernetes/         # K8s cluster setup
├── docker/                 # Docker configurations
│   ├── frontend/           # Frontend Dockerfile
│   ├── backend/            # Backend Dockerfile
│   └── nginx/              # Nginx configuration
└── scripts/                # Deployment scripts
    ├── deploy.sh           # Main deployment script
    └── cleanup.sh          # Cleanup script
```

## Services

### Frontend (React/Next.js)
- Web-based IDE with Monaco Editor
- Real-time collaboration features
- Project management interface
- Resource monitoring dashboard

### Backend Services
- **Provisioning Service**: Container lifecycle management
- **App Management Service**: Application CRUD operations
- **Billing Service**: Usage tracking and billing
- **Auth Service**: User authentication and authorization

### Infrastructure
- **Kubernetes**: Container orchestration
- **NVIDIA Cloud**: GPU resources and compute
- **MongoDB**: Application data storage
- **Redis**: Caching and session management

## Configuration

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories:

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=VibeCaaS
```

**Backend (.env)**
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/vibecaas
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
NVIDIA_CLOUD_API_KEY=your-nvidia-api-key
KUBECONFIG_PATH=/path/to/kubeconfig
```

## Development

### Adding New Features

1. **Frontend**: Add components in `frontend/src/components/`
2. **Backend**: Add services in `backend/src/services/`
3. **API**: Define routes in `backend/src/routes/`
4. **K8s**: Add manifests in `k8s/`

### Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Integration tests
npm run test:integration
```

## Deployment

### Local Development
```bash
npm run dev
```

### Production (NVIDIA Cloud)
```bash
# Deploy infrastructure
cd terraform/nvidia-cloud
terraform init
terraform plan
terraform apply

# Deploy application
npm run k8s:deploy
```

## Monitoring

- **Application Metrics**: Prometheus + Grafana
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger for distributed tracing
- **Alerts**: AlertManager for critical issues

## Security

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Network**: Kubernetes network policies
- **Secrets**: Kubernetes secrets management
- **Container**: Non-root containers with security contexts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [docs.vibecaas.com](https://docs.vibecaas.com)
- Issues: [GitHub Issues](https://github.com/vibecaas/platform/issues)
- Community: [Discord](https://discord.gg/vibecaas)