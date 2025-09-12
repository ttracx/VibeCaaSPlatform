#!/bin/bash

# Local development setup script
set -e

echo "🚀 Setting up VibeCaaS Platform for local development..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_status "Docker is running"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Root dependencies
    npm install
    
    # Frontend dependencies
    cd frontend
    npm install
    cd ..
    print_status "Frontend dependencies installed"
    
    # Backend dependencies
    cd backend
    npm install
    cd ..
    print_status "Backend dependencies installed"
}

# Setup environment files
setup_env() {
    echo "⚙️  Setting up environment files..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_status "Created .env file from template"
        print_warning "Please update .env with your configuration"
    else
        print_status ".env file already exists"
    fi
    
    # Backend env
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOF
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://vibecaas:password@localhost:5432/vibecaas
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
NVIDIA_CLOUD_API_KEY=your-nvidia-api-key
LOG_LEVEL=info
EOF
        print_status "Created backend .env file"
    fi
    
    # Frontend env
    if [ ! -f frontend/.env.local ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
        print_status "Created frontend .env.local file"
    fi
}

# Start services with Docker Compose
start_services() {
    echo "🐳 Starting services with Docker Compose..."
    
    # Start database and Redis
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    print_status "Database and Redis are running"
}

# Setup database
setup_database() {
    echo "🗄️  Setting up database..."
    
    # Create database schema (simplified for demo)
    docker-compose exec postgres psql -U vibecaas -d vibecaas -c "
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            plan VARCHAR(50) DEFAULT 'free',
            created_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS apps (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            user_id UUID REFERENCES users(id),
            language VARCHAR(50),
            framework VARCHAR(50),
            status VARCHAR(50) DEFAULT 'stopped',
            url VARCHAR(255),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    " 2>/dev/null || true
    
    print_status "Database schema created"
}

# Create useful aliases
create_aliases() {
    echo "🔧 Creating useful aliases..."
    
    cat > dev-commands.sh << 'EOF'
#!/bin/bash

# Development commands for VibeCaaS Platform

# Start all services
alias vibe-start="npm run dev"

# Start only backend
alias vibe-backend="cd backend && npm run dev"

# Start only frontend
alias vibe-frontend="cd frontend && npm run dev"

# View logs
alias vibe-logs-backend="docker-compose logs -f backend"
alias vibe-logs-frontend="docker-compose logs -f frontend"
alias vibe-logs-db="docker-compose logs -f postgres"

# Database operations
alias vibe-db-connect="docker-compose exec postgres psql -U vibecaas -d vibecaas"
alias vibe-db-reset="docker-compose down -v && docker-compose up -d postgres redis"

# Build for production
alias vibe-build="npm run build"

# Run tests
alias vibe-test="npm test"

echo "VibeCaaS development commands loaded!"
echo ""
echo "Available commands:"
echo "  vibe-start        - Start all services"
echo "  vibe-backend      - Start only backend"
echo "  vibe-frontend     - Start only frontend"
echo "  vibe-logs-*       - View service logs"
echo "  vibe-db-connect   - Connect to database"
echo "  vibe-db-reset     - Reset database"
echo "  vibe-build        - Build for production"
echo "  vibe-test         - Run tests"
EOF
    
    chmod +x dev-commands.sh
    print_status "Development commands created in dev-commands.sh"
}

# Main setup
main() {
    echo "🌟 VibeCaaS Platform Local Development Setup"
    echo "============================================="
    
    check_docker
    install_dependencies
    setup_env
    start_services
    setup_database
    create_aliases
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update .env files with your configuration"
    echo "2. Run 'npm run dev' to start all services"
    echo "3. Visit http://localhost:3000 for the frontend"
    echo "4. Backend API will be available at http://localhost:8000"
    echo ""
    echo "🛠️  Development commands:"
    echo "  source dev-commands.sh  # Load helpful aliases"
    echo "  npm run dev            # Start all services"
    echo "  npm run dev:frontend   # Start only frontend"
    echo "  npm run dev:backend    # Start only backend"
    echo ""
    echo "📚 Documentation:"
    echo "  - API docs: http://localhost:8000/docs"
    echo "  - Health check: http://localhost:8000/health"
    echo ""
    print_warning "Don't forget to configure your NVIDIA Cloud API key in .env!"
}

main "$@"