# VibeCaaS Platform

🚀 A modern Platform-as-a-Service (PaaS) similar to Replit/Railway for deploying and managing containerized applications with GPU support on NVIDIA Cloud.

![VibeCaaS Dashboard](https://img.shields.io/badge/status-production_ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Kubernetes](https://img.shields.io/badge/kubernetes-ready-purple)
![NVIDIA](https://img.shields.io/badge/NVIDIA-GPU_Ready-76B900)

## 🌟 Features

- **Instant App Deployment**: Deploy apps in seconds with automatic containerization
- **GPU Support**: Native NVIDIA GPU support for AI/ML workloads
- **Multi-Language Support**: Python, Node.js, Go, Rust, Java, and more
- **Resource Management**: CPU, Memory, Storage, and GPU quota management
- **Real-time Monitoring**: Metrics, logs, and terminal access
- **Auto-scaling**: Automatic scaling based on demand
- **User Tiers**: Free, Hobby, Pro, Team, and Enterprise plans
- **Web IDE**: Built-in code editor with live preview
- **SSL Certificates**: Automatic HTTPS for all apps

## 🏗️ Architecture

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
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: FastAPI, Python 3.11, SQLAlchemy, Celery
- **Database**: PostgreSQL, Redis
- **Container**: Docker, Kubernetes
- **Monitoring**: Prometheus, Grafana
- **Proxy**: NGINX

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ & npm
- Python 3.11+
- Make (optional)
- 8GB RAM minimum

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/vibecaas-platform.git
cd vibecaas-platform
```

### 2. Setup environment
```bash
make setup
# OR manually:
cp .env.example .env
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
```

### 3. Start development environment
```bash
make dev
# OR:
docker-compose up -d
```

### 4. Access the platform
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Adminer: http://localhost:8080
- Grafana: http://localhost:3001 (admin/admin)

## 📁 Project Structure

```
vibecaas-platform/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend service
├── nginx/            # NGINX configuration
├── database/         # Database schemas and migrations
├── kubernetes/       # K8s manifests for production
├── monitoring/       # Prometheus & Grafana configs
├── scripts/          # Utility scripts
├── docker-compose.yml
└── Makefile
```

## 🔧 Development

### Run tests
```bash
make test
```

### View logs
```bash
make logs
# Or specific service:
docker-compose logs -f backend
```

### Database migrations
```bash
make migrate
```

### Access containers
```bash
make shell-api  # API container shell
make shell-db   # Database shell
```

## 🚢 Production Deployment

### NVIDIA Cloud Deployment

#### 1. Build production images
```bash
docker build -t nvcr.io/your-org/vibecaas-backend:latest ./backend
docker build -t nvcr.io/your-org/vibecaas-frontend:latest ./frontend
```

#### 2. Push to NGC Registry
```bash
docker login nvcr.io
docker push nvcr.io/your-org/vibecaas-backend:latest
docker push nvcr.io/your-org/vibecaas-frontend:latest
```

#### 3. Deploy to Kubernetes
```bash
kubectl apply -f kubernetes/nvidia-cloud-deployment.yaml
```

#### 4. Configure DNS
Point your domain to the LoadBalancer IP:
```bash
kubectl get svc -n vibecaas-system
```

### Environment Variables
Configure production environment variables in `.env.production`:
- `DATABASE_URL`: Production database URL
- `REDIS_URL`: Production Redis URL
- `JWT_SECRET`: Strong secret key
- `DOCKER_REGISTRY`: Container registry URL
- `DOMAIN`: Your domain name

## 📊 Monitoring

Access monitoring dashboards:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
  - Username: admin
  - Password: admin

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Network isolation with Kubernetes NetworkPolicies
- Encrypted secrets management
- Regular security updates

## 💰 Pricing Tiers

| Tier | CPU | RAM | GPU | Storage | Monthly Price |
|------|-----|-----|-----|---------|---------------|
| Free | 0.5 core | 512MB | None | 1GB | $0 |
| Hobby | 1 core | 2GB | Shared T4 (1hr/day) | 5GB | $10 |
| Pro | 2 cores | 8GB | T4 (8hrs/day) | 20GB | $50 |
| Team | 4 cores | 16GB | Dedicated T4 | 100GB | $200 |
| Enterprise | Custom | Custom | A100/H100 | Custom | Custom |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 API Documentation

### Authentication
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### App Management
```bash
# Create app
curl -X POST http://localhost:8000/api/v1/apps \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-app","framework":"python","gpu_enabled":false}'

# List apps
curl http://localhost:8000/api/v1/apps \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get app details
curl http://localhost:8000/api/v1/apps/APP_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Stop app
curl -X POST http://localhost:8000/api/v1/apps/APP_ID/action \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"stop"}'
```

## 🐛 Troubleshooting

### Docker issues
```bash
# Reset Docker environment
docker-compose down -v
docker system prune -a
```

### Database connection issues
```bash
# Check database status
docker-compose exec postgres pg_isready

# Reset database
docker-compose exec postgres psql -U vibecaas_user -d vibecaas -f /docker-entrypoint-initdb.d/init.sql
```

### Port conflicts
```bash
# Check port usage
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL
```

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Development Guide](docs/DEVELOPMENT.md)

## 🆘 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/vibecaas-platform/issues)
- Discord: [Join our community](https://discord.gg/vibecaas)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- NVIDIA for GPU infrastructure
- Open source community
- All contributors

## 🔐 Security

For security issues, please email security@vibecaas.com

---

Built with ❤️ by the VibeCaaS Team