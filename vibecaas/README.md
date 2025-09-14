# VibeCaaS - Container as a Service Platform

A complete Container-as-a-Service platform with GPU support, multi-tenancy, and enterprise features.

## 🏗️ Architecture Overview

VibeCaaS provides a comprehensive platform for deploying and managing containerized applications with:
- Multi-tenant Kubernetes orchestration
- GPU resource management (NVIDIA T4, V100, A100)
- Auto-scaling and load balancing
- Enterprise security features
- Global multi-region deployment
- Complete monitoring and observability

## 📁 Project Structure

```
vibecaas/
├── backend/           # FastAPI backend service
├── frontend/          # Next.js frontend dashboard
├── infrastructure/    # Kubernetes manifests and Terraform
├── monitoring/        # Prometheus, Grafana configurations
├── scripts/          # Deployment and utility scripts
└── docs/             # Documentation
```

## 🚀 Quick Start

### Local Development

```bash
# Start all services with Docker Compose
docker-compose up -d

# Access services
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
```

### Production Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f infrastructure/k8s/

# Deploy with Helm
helm install vibecaas infrastructure/helm/vibecaas
```

## 🔑 Key Features

- **Multi-Tenancy**: Isolated namespaces for each user
- **GPU Support**: Shared and dedicated GPU resources
- **Auto-scaling**: Horizontal and vertical pod autoscaling
- **Monitoring**: Complete observability stack
- **Security**: RBAC, network policies, secrets management
- **CI/CD**: Automated deployment pipeline
- **Billing**: Subscription and usage-based billing

## 📊 User Tiers

| Tier | Apps | CPU | RAM | Storage | GPU | Price |
|------|------|-----|-----|---------|-----|-------|
| Free | 3 | 0.5 | 512MB | 1GB | None | $0/mo |
| Hobby | 5 | 1 | 2GB | 5GB | Shared | $10/mo |
| Pro | 20 | 2 | 8GB | 20GB | T4 | $50/mo |
| Team | 50 | 4 | 16GB | 100GB | Pool | $200/mo |
| Enterprise | Unlimited | Custom | Custom | Custom | A100/H100 | Custom |

## 📚 Documentation

- [Architecture Guide](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guide](docs/security.md)

## 📝 License

MIT License