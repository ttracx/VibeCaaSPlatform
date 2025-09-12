#!/bin/bash

# VibeCaaS Platform Deployment Script
set -e

echo "🚀 Starting VibeCaaS Platform deployment..."

# Configuration
REGISTRY="your-registry.com"
PROJECT_NAME="vibecaas"
NAMESPACE="vibecaas"
CLUSTER_NAME="vibecaas-cluster"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_status "Docker is installed"
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    print_status "kubectl is installed"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_status "Node.js is installed"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm is installed"
}

# Build Docker images
build_images() {
    echo "🏗️  Building Docker images..."
    
    # Build backend
    echo "Building backend image..."
    cd backend
    docker build -t ${REGISTRY}/${PROJECT_NAME}/backend:latest .
    cd ..
    print_status "Backend image built"
    
    # Build frontend
    echo "Building frontend image..."
    cd frontend
    docker build -t ${REGISTRY}/${PROJECT_NAME}/frontend:latest .
    cd ..
    print_status "Frontend image built"
}

# Push images to registry
push_images() {
    echo "📤 Pushing images to registry..."
    
    docker push ${REGISTRY}/${PROJECT_NAME}/backend:latest
    print_status "Backend image pushed"
    
    docker push ${REGISTRY}/${PROJECT_NAME}/frontend:latest
    print_status "Frontend image pushed"
}

# Deploy to Kubernetes
deploy_k8s() {
    echo "☸️  Deploying to Kubernetes..."
    
    # Create namespace
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    print_status "Namespace created/updated"
    
    # Apply secrets (you should create these manually with real values)
    kubectl apply -f infrastructure/kubernetes/secrets.yaml
    print_status "Secrets applied"
    
    # Apply deployments
    kubectl apply -f infrastructure/kubernetes/deployment.yaml
    print_status "Deployments applied"
    
    # Apply ingress
    kubectl apply -f infrastructure/kubernetes/ingress.yaml
    print_status "Ingress applied"
    
    # Wait for deployments to be ready
    echo "⏳ Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/vibecaas-backend -n ${NAMESPACE}
    kubectl wait --for=condition=available --timeout=300s deployment/vibecaas-frontend -n ${NAMESPACE}
    print_status "All deployments are ready"
}

# Setup monitoring (optional)
setup_monitoring() {
    echo "📊 Setting up monitoring..."
    
    # Install Prometheus and Grafana (simplified)
    kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml
    print_status "Monitoring setup initiated"
}

# Main deployment flow
main() {
    echo "🌟 VibeCaaS Platform Deployment"
    echo "================================"
    
    # Check if running in CI/CD or local
    if [[ "${CI}" == "true" ]]; then
        echo "🤖 Running in CI/CD mode"
    else
        echo "💻 Running in local mode"
        
        # Confirm deployment
        read -p "Are you sure you want to deploy? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled"
            exit 0
        fi
    fi
    
    check_prerequisites
    build_images
    
    # Only push images if registry is configured
    if [[ "${REGISTRY}" != "your-registry.com" ]]; then
        push_images
    else
        print_warning "Registry not configured, skipping image push"
    fi
    
    deploy_k8s
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your DNS to point to the cluster IP"
    echo "2. Configure SSL certificates"
    echo "3. Set up monitoring and alerting"
    echo "4. Update secrets with production values"
    echo ""
    echo "🔍 Useful commands:"
    echo "kubectl get pods -n ${NAMESPACE}"
    echo "kubectl logs -f deployment/vibecaas-backend -n ${NAMESPACE}"
    echo "kubectl logs -f deployment/vibecaas-frontend -n ${NAMESPACE}"
}

# Run main function
main "$@"