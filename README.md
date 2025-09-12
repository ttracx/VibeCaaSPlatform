# VibeCaaS Platform

A comprehensive cloud application deployment and hosting platform with NVIDIA cloud integration, similar to Replit and Lovable.

## Features

- 🚀 **Instant App Deployment** - Deploy applications with one click
- 🔧 **Multi-language Support** - Support for various programming languages and frameworks
- ☁️ **NVIDIA Cloud Integration** - Leverage NVIDIA's GPU infrastructure for compute-intensive applications
- 📊 **Resource Management** - Monitor and manage compute resources in real-time
- 👥 **Multi-tenant Architecture** - Secure isolation between user environments
- 🎯 **Developer-friendly UI** - Intuitive web interface for app management

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker
- Kubernetes cluster (for production)
- NVIDIA Cloud account (for GPU resources)

### Local Development

1. **Clone and install dependencies:**
```bash
git clone https://github.com/ttracx/VibeCaaSPlatform.git
cd VibeCaaSPlatform
npm run install:all
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development servers:**
```bash
npm run dev
```

This will start:
- Frontend at http://localhost:3000
- Backend API at http://localhost:8000

## Architecture

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

## Project Structure

```
├── frontend/           # React/Next.js web application
├── backend/           # Node.js API server
├── infrastructure/    # Kubernetes manifests and Docker files
├── nvidia-cloud/     # NVIDIA cloud integration modules
├── docs/             # Documentation
└── scripts/          # Deployment and utility scripts
```

## Development

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL for metadata, Redis for sessions
- **Orchestration**: Kubernetes with Docker containers
- **Cloud Provider**: NVIDIA cloud for GPU compute

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.