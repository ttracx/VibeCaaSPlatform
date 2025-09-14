# VibeCaaS - Multi-Agent AI Development Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0+-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)

**VibeCaaS** is a revolutionary multi-tenant development platform that combines the power of AI agents with containerized cloud deployment. Think Replit meets Cursor, but with autonomous AI agents that plan, code, test, and deploy your applications in real-time.

## 🚀 **What is VibeCaaS?**

VibeCaaS is a **vibe coding as a service** application that provides:

- **🤖 AI Agent Orchestration**: Multi-agent system with specialized agents for planning, coding, testing, and deployment
- **☁️ Container as a Service**: Isolated Docker containers for each project with GPU support
- **🔄 Live Preview**: Real-time preview with custom subdomains (`project.vibecaas.com`)
- **💳 Usage-Based Billing**: Stripe integration with transparent pricing
- **🔐 Enterprise Security**: Multi-tenant RBAC, secrets vault, and audit logging
- **📊 Full Observability**: Prometheus, Grafana, and OpenTelemetry integration

## 🏗️ **Architecture**

### **Frontend (Next.js/React)**
- Modern IDE interface with Monaco Editor
- Real-time collaboration with Yjs
- Live preview pane with WebSocket updates
- Usage dashboard and billing management
- Agent activity monitoring

### **Backend (FastAPI/Python)**
- RESTful API with automatic OpenAPI documentation
- JWT authentication and RBAC
- Multi-tenant project management
- AI agent orchestration with Celery
- Stripe billing integration

### **Agent Orchestration**
- **Planning Agent**: Breaks down tasks and assigns work
- **Frontend Agent**: Handles UI/UX development
- **Backend Agent**: Manages server-side logic
- **Integration Agent**: Connects systems and deploys
- **Testing Agent**: Ensures quality and performance
- **AI Feature Agent**: Implements intelligent features

### **Infrastructure**
- **Database**: PostgreSQL with Neon (multi-tenant schema)
- **Cache**: Redis for sessions and task queues
- **Storage**: S3-compatible object store (MinIO/AWS)
- **Containers**: Docker with Kubernetes support
- **Monitoring**: Prometheus, Grafana, Loki
- **Security**: Per-tenant isolation, secrets vault

## 🚀 **Quick Start**

### **Prerequisites**
- Docker and Docker Compose
- Node.js 18+ and Python 3.11+
- Git

### **1. Clone and Setup**
```bash
git clone https://github.com/ttracx/VibeCaaSPlatform.git
cd VibeCaaSPlatform
cp .env.example .env
```

### **2. Configure Environment**
Edit `.env` with your API keys:
```bash
# Required: Get these from your providers
OPENAI_API_KEY="your_openai_key_here"
STRIPE_SECRET_KEY="sk_live_your_stripe_key_here"
VITE_STRIPE_PUBLIC_KEY="pk_live_your_stripe_key_here"

# Optional: For domain management
DEV_NAMECOM_USERNAME="your_namecom_username"
DEV_NAMECOM_API_TOKEN="your_namecom_token"
```

### **3. Start Development Environment**
```bash
# Start all services
docker-compose up -d

# Or start individual services
docker-compose up postgres redis minio -d
docker-compose up backend frontend -d
```

### **4. Access the Platform**
- **Frontend**: http://localhost:3000
- **Backend API**: http://api.localhost:8000
- **API Docs**: http://api.localhost:8000/docs
- **Traefik Dashboard**: http://traefik.localhost:8080
- **Grafana**: http://localhost:3001 (admin/admin)

## 🎯 **Core Features**

### **AI Agent Workflow**
1. **User creates project** → Planning Agent analyzes requirements
2. **Planning Agent** → Breaks down into tasks, assigns to specialized agents
3. **Coding Agents** → Write code in parallel (frontend + backend)
4. **Testing Agent** → Runs tests, validates functionality
5. **Integration Agent** → Deploys to container, configures preview
6. **Live Preview** → User sees real-time updates at `project.vibecaas.com`

### **Multi-Tenant Architecture**
- **Tenant Isolation**: Each user gets isolated namespace
- **RBAC**: Role-based access control (Admin, Developer, Viewer)
- **Resource Quotas**: CPU, memory, storage limits per tier
- **Secrets Vault**: Encrypted storage for API keys and credentials

### **Billing & Usage**
- **Transparent Pricing**: Pay only for what you use
- **Usage Metering**: Track compute time, storage, agent hours
- **Stripe Integration**: Secure payment processing
- **Quota Management**: Automatic limits and notifications

## 📊 **Monitoring & Observability**

### **Metrics (Prometheus)**
- Application performance metrics
- Container resource usage
- AI agent task completion rates
- API response times and error rates

### **Logs (Loki)**
- Centralized logging across all services
- Structured JSON logs with correlation IDs
- Real-time log streaming to frontend

### **Dashboards (Grafana)**
- System health overview
- User activity and usage patterns
- AI agent performance analytics
- Billing and cost analysis

## 🔒 **Security Features**

- **JWT Authentication**: Secure token-based auth
- **RBAC**: Fine-grained permission system
- **Secrets Vault**: Encrypted storage for sensitive data
- **Container Isolation**: Sandboxed execution environments
- **Audit Logging**: Complete activity trail
- **Input Validation**: Pydantic schemas for all inputs
- **Rate Limiting**: API protection against abuse

## 🛠️ **Development**

### **Backend Development**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### **Frontend Development**
```bash
cd frontend
npm install
npm run dev
```

### **Database Migrations**
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### **Testing**
```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e
```

## 🚀 **Deployment**

### **Local Development**
```bash
docker-compose up -d
```

### **Production (Kubernetes)**
```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Or use Helm
helm install vibecaas ./helm/vibecaas
```

### **Cloud Deployment**
- **AWS**: EKS with RDS and S3
- **GCP**: GKE with Cloud SQL and Cloud Storage
- **Azure**: AKS with Azure Database and Blob Storage

## 📈 **Pricing Tiers**

### **Starter** - $9/month
- 10 projects
- 50 hours compute/month
- 5GB storage
- Basic AI agents

### **Pro** - $29/month
- 50 projects
- 200 hours compute/month
- 50GB storage
- Advanced AI agents
- Custom domains

### **Team** - $99/month
- Unlimited projects
- 1000 hours compute/month
- 500GB storage
- All AI agents
- Priority support
- Team collaboration

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### **Code Standards**
- **Python**: Black formatting, type hints, docstrings
- **TypeScript**: ESLint, Prettier, strict mode
- **Tests**: 90%+ coverage required
- **Documentation**: Update docs for new features

## 📚 **Documentation**

- [API Documentation](http://api.localhost:8000/docs) - Interactive API docs
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment
- [Contributing Guide](CONTRIBUTING.md) - Development guidelines
- [Architecture Overview](docs/ARCHITECTURE.md) - System design

## 🐛 **Troubleshooting**

### **Common Issues**

**Backend won't start:**
```bash
# Check database connection
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

**Frontend build fails:**
```bash
# Clear node modules
rm -rf frontend/node_modules
cd frontend && npm install
```

**Agent tasks not processing:**
```bash
# Check Celery workers
docker-compose logs celery_worker

# Restart workers
docker-compose restart celery_worker celery_beat
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Replit** for inspiration on the IDE interface
- **Cursor** for AI-powered development concepts
- **FastAPI** for the excellent Python web framework
- **Next.js** for the powerful React framework
- **Docker** for containerization
- **Stripe** for payment processing

## 📞 **Support**

- **Documentation**: [docs.vibecaas.com](https://docs.vibecaas.com)
- **Issues**: [GitHub Issues](https://github.com/ttracx/VibeCaaSPlatform/issues)
- **Discord**: [Join our community](https://discord.gg/vibecaas)
- **Email**: support@vibecaas.com

---

**Built with ❤️ by the VibeCaaS Team**

*Transforming how developers build, deploy, and scale applications with AI-powered automation.*