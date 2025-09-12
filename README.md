# VibeCaaS Platform

A modern Platform-as-a-Service (PaaS) similar to Replit/Railway for deploying and managing containerized applications with GPU support on NVIDIA Cloud.

## 🚀 Features

- **Instant App Deployment**: Deploy apps in seconds with automatic containerization
- **GPU Support**: Native NVIDIA GPU support for AI/ML workloads
- **Multi-Language Support**: Python, Node.js, Go, Rust, Java, and more
- **Resource Management**: CPU, Memory, Storage, and GPU quota management
- **Real-time Monitoring**: Metrics, logs, and terminal access
- **Auto-scaling**: Automatic scaling based on demand
- **User Tiers**: Free, Hobby, Pro, Team, and Enterprise plans
- **Web IDE**: Built-in code editor with live preview
- **SSL Certificates**: Automatic HTTPS for all apps

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

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/vibecaas-platform.git
cd vibecaas-platform
```

2. **Setup environment**
```bash
make setup
# OR manually:
cp .env.example .env
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
```

3. **Start development environment**
```bash
make dev
# OR:
docker-compose up -d
```

4. **Access the platform**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Adminer: http://localhost:8080
- Grafana: http://localhost:3001 (admin/admin)

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│   FastAPI   │────▶│   Docker    │
│   Frontend  │     │   Backend   │     │  Containers │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                     │
       └───────────────────┼─────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │    Redis    │
                    └─────────────┘
```

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

**Run tests**
```bash
make test
```

**View logs**
```bash
make logs
# Or specific service:
docker-compose logs -f backend
```

**Database migrations**
```bash
make migrate
```

**Access containers**
```bash
make shell-api  # API container shell
make shell-db   # Database shell
```

## 🚢 Production Deployment

**Build production images**
```bash
docker-compose -f docker-compose.prod.yml build
```

**Deploy to Kubernetes**
```bash
kubectl apply -f kubernetes/production/
```

**Environment variables**
Configure production environment variables in `.env.production`:
- DATABASE_URL: Production database URL
- REDIS_URL: Production Redis URL
- JWT_SECRET: Strong secret key
- DOCKER_REGISTRY: Container registry URL
- DOMAIN: Your domain name

## 📊 Monitoring

Access monitoring dashboards:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
  - Username: admin
  - Password: admin

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: `docs/`
- Issues: GitHub Issues
- Discord: Join our community

## 🔐 Security

For security issues, please email security@vibecaas.com

---

Built with ❤️ by the VibeCaaS Team