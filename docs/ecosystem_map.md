# VibeCaaS Ecosystem Map

## Overview
This document provides a comprehensive map of the VibeCaaS ecosystem, including all services, components, and their interactions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                VibeCaaS Platform                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   Frontend      │    │   API Gateway   │    │   Backend       │            │
│  │   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   Services      │            │
│  │                 │    │                 │    │                 │            │
│  │ • Dashboard     │    │ • Auth          │    │ • Auth Service  │            │
│  │ • IDE           │    │ • Rate Limiting │    │ • Project Mgmt  │            │
│  │ • Live Preview  │    │ • CORS          │    │ • Agent Orchestr│            │
│  │ • MicroVM UI    │    │ • Load Balancer │    │ • MicroVM Mgmt  │            │
│  │ • Domain Mgmt   │    │                 │    │ • Domain Mgmt   │            │
│  │ • Billing UI    │    │                 │    │ • Billing       │            │
│  └─────────────────┘    └─────────────────┘    │ • Observability │            │
│                                                 └─────────────────┘            │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   AI Agents     │    │   MicroVMs      │    │   Domains       │            │
│  │   (Celery)      │    │   (Firecracker) │    │   (Name.com)    │            │
│  │                 │    │                 │    │                 │            │
│  │ • Planning      │    │ • VM Control    │    │ • Search        │            │
│  │ • Frontend      │    │ • Runtime Mgmt  │    │ • Purchase      │            │
│  │ • Backend       │    │ • Dev URLs      │    │ • DNS Mgmt      │            │
│  │ • Testing       │    │ • Resource Mgmt │    │ • SSL Certs     │            │
│  │ • Integration   │    │ • Monitoring    │    │ • Webhooks      │            │
│  │ • AI Features   │    │                 │    │                 │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   Data Layer    │    │   Observability │    │   External      │            │
│  │                 │    │                 │    │   Services      │            │
│  │ • PostgreSQL    │    │ • Prometheus    │    │ • Stripe        │            │
│  │ • Redis         │    │ • Grafana       │    │ • Name.com API  │            │
│  │ • MinIO/S3      │    │ • OpenTelemetry │    │ • OpenAI        │            │
│  │ • Elasticsearch │    │ • Loki          │    │ • Anthropic     │            │
│  └─────────────────┘    └─────────────────┘    │ • Google AI     │            │
│                                                 └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Core Services

### 1. Frontend (Next.js/React)
- **Location**: `/frontend/`
- **Technology**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Components**:
  - Dashboard (`VibeCaaSDashboard.tsx`)
  - IDE Interface (`MonacoEditor`)
  - Live Preview (`LivePreview.tsx`)
  - MicroVM Management (`MicroVMDashboard.tsx`)
  - Domain Management (`DomainSearch.tsx`, `DomainCheckout.tsx`, `DomainConnect.tsx`)
  - DNS Management (`DNSManager.tsx`)
  - URL Forwarding (`URLForwarding.tsx`)
  - Billing Dashboard (`BillingDashboard.tsx`)

### 2. Backend API (FastAPI)
- **Location**: `/backend/`
- **Technology**: FastAPI, Python 3.11+, SQLAlchemy, Pydantic
- **Services**:
  - Auth Service (`auth/`)
  - Project Management (`projects/`)
  - Agent Orchestration (`agents/`)
  - MicroVM Management (`microvm/`)
  - Domain Management (`domains/`)
  - Billing Service (`billing/`)
  - Secrets Management (`secrets/`)
  - Observability (`observability/`)

### 3. AI Agent System
- **Location**: `/backend/app/agents/`
- **Technology**: Celery, Redis, OpenAI, Anthropic, Google AI
- **Agents**:
  - Planning Agent: Analyzes requirements and creates task breakdowns
  - Frontend Agent: Builds React/Next.js components
  - Backend Agent: Develops FastAPI endpoints
  - Testing Agent: Runs comprehensive tests
  - Integration Agent: Connects systems and handles deployment
  - AI Feature Agent: Implements intelligent features

### 4. MicroVM Management
- **Location**: `/backend/app/services/microvm_service.py`
- **Technology**: Firecracker, vm-control API
- **Features**:
  - VM provisioning and lifecycle management
  - Resource allocation (CPU, memory)
  - Runtime template support
  - Dev URL generation
  - Health monitoring

### 5. Domain Management
- **Location**: `/backend/app/services/domains/`
- **Technology**: Name.com API, ACME, DNS
- **Features**:
  - Domain search and pricing
  - Purchase and registration
  - DNS record management
  - SSL certificate issuance
  - URL forwarding
  - Webhook handling

## Data Flow

### 1. User Authentication Flow
```
User → Frontend → API Gateway → Auth Service → JWT Token → User Session
```

### 2. Project Creation Flow
```
User → Frontend → API Gateway → Project Service → Agent Orchestrator → AI Agents → MicroVM → Live Preview
```

### 3. Domain Purchase Flow
```
User → Frontend → API Gateway → Domain Service → Name.com API → DNS Configuration → SSL Issuance → App Binding
```

### 4. MicroVM Provisioning Flow
```
User → Frontend → API Gateway → MicroVM Service → vm-control API → Firecracker → Dev URL → Live Preview
```

## External Integrations

### 1. Name.com API
- **Purpose**: Domain registration and management
- **Endpoints**: Search, pricing, purchase, DNS management
- **Authentication**: HTTP Basic Auth
- **Webhooks**: Order status, domain events

### 2. Stripe
- **Purpose**: Payment processing and billing
- **Features**: Usage-based billing, subscription management
- **Webhooks**: Payment events, subscription changes

### 3. AI Providers
- **OpenAI**: GPT-4o for code generation and analysis
- **Anthropic**: Claude 4 for planning and reasoning
- **Google AI**: Gemini 2.5 Pro for testing and optimization

### 4. vm-control API
- **Purpose**: MicroVM lifecycle management
- **Features**: VM creation, resource allocation, monitoring
- **Authentication**: API token

## Security & Compliance

### 1. Authentication & Authorization
- JWT-based authentication
- Multi-tenant RBAC
- Per-tenant isolation
- API key management

### 2. Data Protection
- Encryption at rest and in transit
- Secrets vault integration
- Audit logging
- GDPR compliance

### 3. Network Security
- VPC isolation
- Firewall rules
- DDoS protection
- SSL/TLS termination

## Monitoring & Observability

### 1. Metrics
- **Prometheus**: System and application metrics
- **Grafana**: Dashboards and visualization
- **Custom Metrics**: Business KPIs, user activity

### 2. Logging
- **Loki**: Centralized log aggregation
- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: DEBUG, INFO, WARN, ERROR

### 3. Tracing
- **OpenTelemetry**: Distributed tracing
- **Jaeger**: Trace visualization
- **Performance Monitoring**: Latency, throughput

## Deployment Architecture

### 1. Development
- Docker Compose for local development
- Hot reload for frontend and backend
- Mock services for external APIs

### 2. Staging
- Kubernetes cluster
- CI/CD pipeline
- Integration testing

### 3. Production
- Multi-region Kubernetes
- Auto-scaling
- High availability
- Disaster recovery

## API Endpoints

### 1. Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### 2. Projects
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/{id}` - Get project
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

### 3. MicroVMs
- `GET /api/v1/microvms` - List MicroVMs
- `POST /api/v1/microvms/create` - Create MicroVM
- `GET /api/v1/microvms/{id}` - Get MicroVM
- `DELETE /api/v1/microvms/{id}` - Delete MicroVM

### 4. Domains
- `GET /api/v1/domains/search` - Search domains
- `POST /api/v1/domains/purchase` - Purchase domain
- `POST /api/v1/domains/{domain}/connect` - Connect domain
- `GET /api/v1/domains/{domain}/dns` - Get DNS records
- `POST /api/v1/domains/{domain}/dns` - Create DNS record

### 5. Webhooks
- `POST /api/v1/webhooks/namecom` - Name.com webhooks
- `POST /api/v1/webhooks/stripe` - Stripe webhooks

## Configuration

### 1. Environment Variables
- Database URLs (PostgreSQL, Redis)
- API keys (Stripe, Name.com, AI providers)
- Service endpoints
- Feature flags

### 2. Feature Flags
- `FEATURE_MICROVM`: Enable MicroVM functionality
- `FEATURE_DOMAINS_FLOW`: Enable domain management
- `FEATURE_AI_AGENTS`: Enable AI agent orchestration
- `FEATURE_BILLING`: Enable billing features

## Development Workflow

### 1. Local Development
```bash
# Start all services
docker-compose up -d

# Run tests
npm test
python -m pytest

# Run linting
npm run lint
python -m flake8
```

### 2. CI/CD Pipeline
1. Code commit triggers GitHub Actions
2. Run tests and linting
3. Build Docker images
4. Deploy to staging
5. Run integration tests
6. Deploy to production

### 3. Monitoring
- Health checks for all services
- Performance monitoring
- Error tracking
- User analytics

## Future Enhancements

### 1. Planned Features
- Multi-region deployment
- Advanced AI capabilities
- Enterprise SSO integration
- Custom runtime templates
- Advanced monitoring dashboards

### 2. Scalability Improvements
- Horizontal scaling
- Database sharding
- CDN integration
- Edge computing

### 3. Security Enhancements
- Zero-trust architecture
- Advanced threat detection
- Compliance automation
- Security scanning

---

*Last updated: January 2025*
*Version: 1.0.0*
