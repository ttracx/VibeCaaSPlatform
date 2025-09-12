#!/bin/bash

# VibeCaaS NVIDIA Cloud Deployment Script
# Automated deployment of VibeCaaS platform on NVIDIA DGX Cloud / NGC

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_NAME="${CLUSTER_NAME:-vibecaas-cluster}"
REGION="${REGION:-us-west-2}"
NODE_COUNT="${NODE_COUNT:-3}"
GPU_NODE_COUNT="${GPU_NODE_COUNT:-2}"
DOMAIN="${DOMAIN:-vibecaas.com}"
NGC_API_KEY="${NGC_API_KEY}"
NGC_ORG="${NGC_ORG:-vibecaas}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_tools=()
    
    # Check required tools
    command -v kubectl >/dev/null 2>&1 || missing_tools+=("kubectl")
    command -v helm >/dev/null 2>&1 || missing_tools+=("helm")
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    command -v jq >/dev/null 2>&1 || missing_tools+=("jq")
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Please install missing tools and try again"
        exit 1
    fi
    
    # Check NGC API key
    if [ -z "$NGC_API_KEY" ]; then
        print_error "NGC_API_KEY environment variable is not set"
        print_status "Please set your NGC API key: export NGC_API_KEY=your-key"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Setup NVIDIA Cloud CLI
setup_nvidia_cli() {
    print_status "Setting up NVIDIA Cloud CLI..."
    
    # Download and install NGC CLI if not present
    if ! command -v ngc >/dev/null 2>&1; then
        print_status "Installing NGC CLI..."
        wget -O ngccli_linux.zip https://ngc.nvidia.com/downloads/ngccli_linux.zip
        unzip -o ngccli_linux.zip
        chmod +x ngc
        sudo mv ngc /usr/local/bin/
        rm ngccli_linux.zip
    fi
    
    # Configure NGC CLI
    print_status "Configuring NGC CLI..."
    ngc config set --api-key "$NGC_API_KEY" --org "$NGC_ORG"
    
    print_success "NGC CLI configured"
}

# Install NVIDIA GPU Operator
install_gpu_operator() {
    print_status "Installing NVIDIA GPU Operator..."
    
    # Add NVIDIA Helm repository
    helm repo add nvidia https://nvidia.github.io/gpu-operator
    helm repo update
    
    # Install GPU Operator
    helm install --wait \
        gpu-operator nvidia/gpu-operator \
        --namespace gpu-operator \
        --create-namespace \
        --set operator.defaultRuntime=containerd \
        --set driver.enabled=true \
        --set toolkit.enabled=true \
        --set devicePlugin.enabled=true \
        --set migManager.enabled=true \
        --set dcgmExporter.enabled=true \
        --set gfd.enabled=true
    
    print_success "GPU Operator installed"
}

# Install NGINX Ingress Controller
install_ingress_controller() {
    print_status "Installing NGINX Ingress Controller..."
    
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
    
    helm install --wait \
        ingress-nginx ingress-nginx/ingress-nginx \
        --namespace ingress-nginx \
        --create-namespace \
        --set controller.service.type=LoadBalancer \
        --set controller.metrics.enabled=true \
        --set controller.podAnnotations."prometheus\.io/scrape"=true \
        --set controller.podAnnotations."prometheus\.io/port"="10254"
    
    print_success "NGINX Ingress Controller installed"
}

# Install Cert-Manager for SSL
install_cert_manager() {
    print_status "Installing Cert-Manager..."
    
    # Install cert-manager
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
    
    # Wait for cert-manager to be ready
    kubectl wait --for=condition=ready pod \
        -l app.kubernetes.io/instance=cert-manager \
        -n cert-manager \
        --timeout=300s
    
    print_success "Cert-Manager installed"
}

# Create database secrets
create_secrets() {
    print_status "Creating secrets..."
    
    # Generate random passwords
    DB_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    GRAFANA_PASSWORD=$(openssl rand -base64 16)
    
    # Create namespace
    kubectl create namespace vibecaas-system --dry-run=client -o yaml | kubectl apply -f -
    
    # Create database secret
    kubectl create secret generic postgres-secret \
        --from-literal=password="$DB_PASSWORD" \
        --namespace vibecaas-system \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Create Grafana secret
    kubectl create secret generic grafana-secret \
        --from-literal=admin-password="$GRAFANA_PASSWORD" \
        --namespace vibecaas-system \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Update vibecaas-secrets with actual values
    kubectl create secret generic vibecaas-secrets \
        --from-literal=DATABASE_URL="postgresql://vibecaas_user:${DB_PASSWORD}@postgres-vibecaas.vibecaas-system.svc.cluster.local/vibecaas" \
        --from-literal=REDIS_URL="redis://redis-vibecaas.vibecaas-system.svc.cluster.local:6379" \
        --from-literal=NGC_API_KEY="$NGC_API_KEY" \
        --from-literal=JWT_SECRET="$JWT_SECRET" \
        --from-literal=S3_BUCKET="vibecaas-user-data" \
        --namespace vibecaas-system \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Save credentials
    cat <<EOF > credentials.txt
=====================================
VibeCaaS Platform Credentials
=====================================
Grafana Admin Password: $GRAFANA_PASSWORD
Database Password: $DB_PASSWORD
JWT Secret: $JWT_SECRET
=====================================
EOF
    
    print_success "Secrets created (credentials saved to credentials.txt)"
}

# Deploy VibeCaaS platform
deploy_platform() {
    print_status "Deploying VibeCaaS platform..."
    
    # Apply all Kubernetes manifests
    kubectl apply -f kubernetes/production/vibecaas-manifests.yaml
    
    # Wait for deployments to be ready
    print_status "Waiting for deployments to be ready..."
    
    kubectl wait --for=condition=available \
        deployment/provisioning-service \
        -n vibecaas-system \
        --timeout=300s
    
    kubectl wait --for=condition=available \
        deployment/api-gateway \
        -n vibecaas-system \
        --timeout=300s
    
    print_success "VibeCaaS platform deployed"
}

# Configure DNS
configure_dns() {
    print_status "Configuring DNS..."
    
    # Get LoadBalancer IP
    LB_IP=$(kubectl get svc ingress-nginx-controller \
        -n ingress-nginx \
        -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$LB_IP" ]; then
        print_warning "LoadBalancer IP not yet assigned. Waiting..."
        sleep 30
        LB_IP=$(kubectl get svc ingress-nginx-controller \
            -n ingress-nginx \
            -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    fi
    
    if [ -n "$LB_IP" ]; then
        print_success "LoadBalancer IP: $LB_IP"
        print_status "Please configure the following DNS records:"
        echo "  *.${DOMAIN} -> ${LB_IP}"
        echo "  api.${DOMAIN} -> ${LB_IP}"
        echo "  metrics.${DOMAIN} -> ${LB_IP}"
    else
        print_warning "Could not get LoadBalancer IP. Please check manually."
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Create database schema
    kubectl exec -it postgres-vibecaas-0 \
        -n vibecaas-system \
        -- psql -U vibecaas_user -d vibecaas <<'EOF'
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    credits INTEGER DEFAULT 0
);

-- Apps table
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) UNIQUE,
    status VARCHAR(50),
    framework VARCHAR(50),
    runtime VARCHAR(50),
    gpu_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_deployed TIMESTAMP,
    k8s_namespace VARCHAR(255),
    container_image VARCHAR(500),
    url VARCHAR(500)
);

-- App Resources
CREATE TABLE IF NOT EXISTS app_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id),
    cpu_cores DECIMAL(3,2),
    memory_mb INTEGER,
    gpu_type VARCHAR(50),
    gpu_hours_used DECIMAL(10,2),
    storage_gb INTEGER,
    bandwidth_gb DECIMAL(10,2),
    month DATE
);

-- Deployments
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id),
    version INTEGER,
    commit_hash VARCHAR(100),
    status VARCHAR(50),
    deployed_at TIMESTAMP DEFAULT NOW(),
    deployment_config JSONB
);

-- Create indexes
CREATE INDEX idx_apps_user_id ON apps(user_id);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_app_resources_app_id ON app_resources(app_id);
CREATE INDEX idx_deployments_app_id ON deployments(app_id);
EOF
    
    print_success "Database migrations completed"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check pod status
    echo -e "\n${BLUE}Pod Status:${NC}"
    kubectl get pods -n vibecaas-system
    
    # Check services
    echo -e "\n${BLUE}Services:${NC}"
    kubectl get svc -n vibecaas-system
    
    # Check ingress
    echo -e "\n${BLUE}Ingress:${NC}"
    kubectl get ingress -n vibecaas-system
    
    # Test API endpoint
    API_URL="http://$(kubectl get svc api-gateway -n vibecaas-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/health"
    
    if curl -s "$API_URL" > /dev/null 2>&1; then
        print_success "API Gateway is accessible"
    else
        print_warning "API Gateway not yet accessible. It may take a few minutes."
    fi
    
    print_success "Deployment verification complete"
}

# Cleanup function
cleanup() {
    print_warning "Cleaning up temporary files..."
    rm -f cluster-config.yaml
    rm -f Dockerfile.provisioning
    rm -f requirements.txt
}

# Main deployment flow
main() {
    print_status "Starting VibeCaaS deployment on NVIDIA Cloud..."
    echo ""
    echo "Cluster: $CLUSTER_NAME"
    echo "Region: $REGION"
    echo "Domain: $DOMAIN"
    echo ""
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Run deployment steps
    check_prerequisites
    setup_nvidia_cli
    
    # Assuming cluster exists, configure kubectl
    print_status "Configuring kubectl..."
    # kubectl config use-context $CLUSTER_NAME
    
    # Install platform components
    install_gpu_operator
    install_ingress_controller
    install_cert_manager
    create_secrets
    deploy_platform
    run_migrations
    configure_dns
    verify_deployment
    
    print_success "VibeCaaS deployment completed successfully!"
    echo ""
    echo ""
    echo "Next Steps:"
    echo "1. Configure DNS records as shown above"
    echo "2. Access Grafana at: https://metrics.${DOMAIN}"
    echo "3. API endpoint: https://api.${DOMAIN}"
    echo "4. Check credentials.txt for passwords"
    echo ""
}

# Run main function
main "$@"