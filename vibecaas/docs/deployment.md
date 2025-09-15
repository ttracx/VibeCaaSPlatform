# VibeCaaS Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Production Setup](#production-setup)
5. [Multi-Region Deployment](#multi-region-deployment)
6. [Monitoring Setup](#monitoring-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Docker 20.10+
- Kubernetes 1.25+
- Helm 3.10+
- kubectl 1.25+
- Python 3.11+
- Node.js 18+
- NVIDIA GPU drivers (for GPU nodes)
- NVIDIA Container Toolkit

### Cloud Provider Requirements
- AWS EKS, GKE, or AKS cluster
- Load balancer support
- Persistent volume support
- GPU node pools (optional)

## Local Development

### 1. Clone Repository
```bash
git clone https://github.com/your-org/vibecaas.git
cd vibecaas
```

### 2. Environment Setup
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit configuration files
vim backend/.env
vim frontend/.env
```

### 3. Start Services with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 4. Initialize Database
```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Create admin user
docker-compose exec backend python scripts/create_admin.py
```

### 5. Access Services
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Kibana: http://localhost:5601

## Kubernetes Deployment

### 1. Create Namespace
```bash
kubectl create namespace vibecaas
kubectl create namespace vibecaas-apps
kubectl create namespace vibecaas-monitoring
```

### 2. Install NGINX Ingress Controller
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer
```

### 3. Install Cert-Manager
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@vibecaas.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 4. Create Secrets
```bash
# Database credentials
kubectl create secret generic vibecaas-secrets \
  --from-literal=database-url="postgresql://user:pass@postgres:5432/vibecaas" \
  --from-literal=redis-url="redis://redis:6379/0" \
  --from-literal=secret-key="your-secret-key" \
  -n vibecaas

# Container registry credentials
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=TOKEN \
  -n vibecaas
```

### 5. Deploy PostgreSQL
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgresql bitnami/postgresql \
  --namespace vibecaas \
  --set auth.postgresPassword=vibecaas \
  --set auth.database=vibecaas \
  --set persistence.size=50Gi
```

### 6. Deploy Redis
```bash
helm install redis bitnami/redis \
  --namespace vibecaas \
  --set auth.enabled=false \
  --set master.persistence.size=10Gi
```

### 7. Deploy VibeCaaS Components
```bash
# Apply all Kubernetes manifests
kubectl apply -f infrastructure/k8s/

# Verify deployments
kubectl get deployments -n vibecaas
kubectl get pods -n vibecaas
kubectl get services -n vibecaas
kubectl get ingress -n vibecaas
```

### 8. Setup GPU Support
```bash
# Install NVIDIA GPU Operator
helm repo add nvidia https://nvidia.github.io/gpu-operator
helm install gpu-operator nvidia/gpu-operator \
  --namespace gpu-operator \
  --create-namespace \
  --set driver.enabled=true \
  --set toolkit.enabled=true \
  --set devicePlugin.enabled=true \
  --set dcgmExporter.enabled=true

# Label GPU nodes
kubectl label nodes gpu-node-1 gpu-type=T4
kubectl label nodes gpu-node-2 gpu-type=V100

# Add GPU taints
kubectl taint nodes gpu-node-1 nvidia.com/gpu=true:NoSchedule
```

## Production Setup

### 1. High Availability Configuration
```yaml
# backend-ha.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vibecaas-backend
  namespace: vibecaas
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - vibecaas-backend
            topologyKey: kubernetes.io/hostname
```

### 2. Database High Availability
```bash
# Deploy PostgreSQL with replication
helm install postgresql-ha bitnami/postgresql-ha \
  --namespace vibecaas \
  --set postgresql.replicaCount=3 \
  --set postgresql.syncronousCommit=on \
  --set persistence.size=100Gi
```

### 3. Autoscaling Configuration
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vibecaas-backend-hpa
  namespace: vibecaas
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vibecaas-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 4. Network Policies
```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: vibecaas-backend-policy
  namespace: vibecaas
spec:
  podSelector:
    matchLabels:
      app: vibecaas-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - podSelector:
        matchLabels:
          app: vibecaas-frontend
    ports:
    - protocol: TCP
      port: 8000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

## Multi-Region Deployment

### 1. Setup Regions
```bash
# US-West
export KUBECONFIG=~/.kube/config-us-west
kubectl apply -f infrastructure/k8s/

# EU-Central
export KUBECONFIG=~/.kube/config-eu-central
kubectl apply -f infrastructure/k8s/

# Asia-Pacific
export KUBECONFIG=~/.kube/config-asia-pacific
kubectl apply -f infrastructure/k8s/
```

### 2. Configure Global Load Balancing
```yaml
# AWS Route 53 configuration
resource "aws_route53_record" "vibecaas" {
  zone_id = var.zone_id
  name    = "vibecaas.com"
  type    = "A"

  alias {
    name                   = aws_lb.global.dns_name
    zone_id                = aws_lb.global.zone_id
    evaluate_target_health = true
  }

  set_identifier = "us-west"
  
  geolocation_routing_policy {
    continent = "NA"
  }
}
```

### 3. Database Replication
```bash
# Setup PostgreSQL streaming replication
kubectl exec -it postgresql-0 -n vibecaas -- psql -U postgres -c "
CREATE PUBLICATION vibecaas_pub FOR ALL TABLES;
"

# On replica regions
kubectl exec -it postgresql-0 -n vibecaas -- psql -U postgres -c "
CREATE SUBSCRIPTION vibecaas_sub
CONNECTION 'host=primary.vibecaas.com dbname=vibecaas user=replicator'
PUBLICATION vibecaas_pub;
"
```

## Monitoring Setup

### 1. Deploy Prometheus Stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace vibecaas-monitoring \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
  --set grafana.adminPassword=admin
```

### 2. Configure Grafana Dashboards
```bash
# Import dashboards
kubectl apply -f monitoring/grafana/dashboards/

# Access Grafana
kubectl port-forward -n vibecaas-monitoring svc/kube-prometheus-stack-grafana 3000:80
```

### 3. Setup Alerting
```yaml
# alerting-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: vibecaas-alerts
  namespace: vibecaas-monitoring
spec:
  groups:
  - name: vibecaas
    interval: 30s
    rules:
    - alert: HighCPUUsage
      expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
      for: 5m
      annotations:
        summary: "High CPU usage detected"
        description: "CPU usage is above 80% for {{ $labels.pod }}"
    
    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
      for: 5m
      annotations:
        summary: "Pod is crash looping"
        description: "Pod {{ $labels.pod }} is crash looping"
```

### 4. Setup Logging
```bash
# Deploy EFK stack
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
  --namespace vibecaas-monitoring \
  --set replicas=3 \
  --set minimumMasterNodes=2

helm install kibana elastic/kibana \
  --namespace vibecaas-monitoring

helm install fluentd stable/fluentd-elasticsearch \
  --namespace vibecaas-monitoring \
  --set elasticsearch.host=elasticsearch-master
```

## Troubleshooting

### Common Issues

#### 1. Pods Not Starting
```bash
# Check pod status
kubectl describe pod POD_NAME -n vibecaas

# Check logs
kubectl logs POD_NAME -n vibecaas

# Check events
kubectl get events -n vibecaas --sort-by='.lastTimestamp'
```

#### 2. Database Connection Issues
```bash
# Test database connection
kubectl exec -it vibecaas-backend-xxx -n vibecaas -- python -c "
from app.core.database import engine
engine.connect()
print('Database connected successfully')
"
```

#### 3. GPU Not Available
```bash
# Check GPU nodes
kubectl get nodes -l gpu-type

# Check GPU operator status
kubectl get pods -n gpu-operator

# Check GPU allocations
kubectl describe nodes gpu-node-1 | grep -A 5 "Allocated resources"
```

#### 4. Ingress Not Working
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress rules
kubectl describe ingress -n vibecaas

# Check SSL certificates
kubectl get certificates -n vibecaas
```

### Performance Tuning

#### 1. Database Optimization
```sql
-- Increase connection pool
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';

-- Create indexes
CREATE INDEX idx_apps_owner ON applications(owner_id);
CREATE INDEX idx_apps_status ON applications(status);
```

#### 2. Redis Optimization
```bash
# Set max memory policy
kubectl exec -it redis-master-0 -n vibecaas -- redis-cli CONFIG SET maxmemory-policy allkeys-lru
kubectl exec -it redis-master-0 -n vibecaas -- redis-cli CONFIG SET maxmemory 2gb
```

#### 3. Kubernetes Resource Optimization
```yaml
# resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: vibecaas-apps
spec:
  hard:
    requests.cpu: "100"
    requests.memory: 200Gi
    requests.storage: 1Ti
    persistentvolumeclaims: "100"
    pods: "200"
```

## Backup and Recovery

### 1. Database Backup
```bash
# Create backup
kubectl exec -it postgresql-0 -n vibecaas -- pg_dump -U postgres vibecaas > backup.sql

# Automated backups with CronJob
kubectl apply -f infrastructure/k8s/backup-cronjob.yaml
```

### 2. Disaster Recovery
```bash
# Restore from backup
kubectl exec -i postgresql-0 -n vibecaas -- psql -U postgres vibecaas < backup.sql

# Verify restoration
kubectl exec -it postgresql-0 -n vibecaas -- psql -U postgres -d vibecaas -c "SELECT COUNT(*) FROM users;"
```

## Security Hardening

### 1. Pod Security Policies
```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: vibecaas-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

### 2. Secrets Management
```bash
# Use Sealed Secrets
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.18.0/controller.yaml

# Encrypt secrets
echo -n mypassword | kubectl create secret generic mysecret --dry-run=client --from-file=password=/dev/stdin -o yaml | kubeseal -o yaml > mysealedsecret.yaml
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/vibecaas/issues
- Documentation: https://docs.vibecaas.com
- Email: support@vibecaas.com