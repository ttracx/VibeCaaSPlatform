#!/bin/bash

# VibeCaaS Setup Script

set -e

echo "🚀 Setting up VibeCaaS Platform..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed. Aborting." >&2; exit 1; }

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Environment file created"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec -T backend alembic upgrade head

echo "✅ Setup complete!"
echo ""
echo "🌐 Access the platform:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:8000"
echo "   Adminer: http://localhost:8080"
echo "   Grafana: http://localhost:3001"
echo ""
echo "📝 Default credentials:"
echo "   Admin: admin@vibecaas.local / admin123"
echo ""
echo "Run 'docker-compose logs -f' to view logs"