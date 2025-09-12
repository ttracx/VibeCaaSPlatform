"""
Container deployment manager for NVIDIA cloud infrastructure
"""

import os
import yaml
import json
import requests
from typing import Dict, List, Optional
from dataclasses import dataclass
from kubernetes import client, config
from kubernetes.client.rest import ApiException

@dataclass
class AppDeployment:
    app_id: str
    name: str
    image: str
    gpu_required: bool
    gpu_type: Optional[str]
    resources: Dict[str, str]
    environment: Dict[str, str]
    status: str

class ContainerManager:
    def __init__(self, kubeconfig_path: Optional[str] = None):
        """Initialize Kubernetes client"""
        try:
            if kubeconfig_path:
                config.load_kube_config(config_file=kubeconfig_path)
            else:
                config.load_incluster_config()
        except Exception:
            config.load_kube_config()
        
        self.v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()
        self.networking_v1 = client.NetworkingV1Api()
        
        self.namespace = "vibecaas"
    
    def create_app_deployment(self, app: AppDeployment) -> bool:
        """Create Kubernetes deployment for an app"""
        try:
            # Create deployment manifest
            deployment = self._create_deployment_manifest(app)
            
            # Create deployment
            self.apps_v1.create_namespaced_deployment(
                namespace=self.namespace,
                body=deployment
            )
            
            # Create service
            service = self._create_service_manifest(app)
            self.v1.create_namespaced_service(
                namespace=self.namespace,
                body=service
            )
            
            # Create ingress if needed
            if not app.gpu_required:  # Web apps get ingress
                ingress = self._create_ingress_manifest(app)
                self.networking_v1.create_namespaced_ingress(
                    namespace=self.namespace,
                    body=ingress
                )
            
            return True
        except ApiException as e:
            print(f"Error creating deployment: {e}")
            return False
    
    def _create_deployment_manifest(self, app: AppDeployment) -> client.V1Deployment:
        """Create Kubernetes deployment manifest"""
        
        # Container specification
        container = client.V1Container(
            name=app.name,
            image=app.image,
            ports=[client.V1ContainerPort(container_port=8080)],
            env=[
                client.V1EnvVar(name=k, value=v) 
                for k, v in app.environment.items()
            ],
            resources=client.V1ResourceRequirements(
                requests={
                    "memory": app.resources.get("memory", "256Mi"),
                    "cpu": app.resources.get("cpu", "250m")
                },
                limits={
                    "memory": app.resources.get("memory_limit", "512Mi"),
                    "cpu": app.resources.get("cpu_limit", "500m")
                }
            )
        )
        
        # Add GPU resources if required
        if app.gpu_required:
            container.resources.limits["nvidia.com/gpu"] = "1"
            container.resources.requests["nvidia.com/gpu"] = "1"
        
        # Pod template
        template = client.V1PodTemplateSpec(
            metadata=client.V1ObjectMeta(
                labels={"app": app.name}
            ),
            spec=client.V1PodSpec(
                containers=[container],
                restart_policy="Always"
            )
        )
        
        # Add node selector for GPU nodes if needed
        if app.gpu_required:
            template.spec.node_selector = {"nvidia.com/gpu.present": "true"}
            template.spec.tolerations = [
                client.V1Toleration(
                    key="nvidia.com/gpu",
                    operator="Equal",
                    value="true",
                    effect="NoSchedule"
                )
            ]
        
        # Deployment specification
        spec = client.V1DeploymentSpec(
            replicas=1 if app.gpu_required else 2,
            selector=client.V1LabelSelector(
                match_labels={"app": app.name}
            ),
            template=template
        )
        
        # Deployment object
        deployment = client.V1Deployment(
            api_version="apps/v1",
            kind="Deployment",
            metadata=client.V1ObjectMeta(
                name=app.name,
                labels={"app": app.name, "app-id": app.app_id}
            ),
            spec=spec
        )
        
        return deployment
    
    def _create_service_manifest(self, app: AppDeployment) -> client.V1Service:
        """Create Kubernetes service manifest"""
        return client.V1Service(
            api_version="v1",
            kind="Service",
            metadata=client.V1ObjectMeta(
                name=f"{app.name}-service",
                labels={"app": app.name}
            ),
            spec=client.V1ServiceSpec(
                selector={"app": app.name},
                ports=[
                    client.V1ServicePort(
                        port=80,
                        target_port=8080,
                        protocol="TCP"
                    )
                ],
                type="ClusterIP"
            )
        )
    
    def _create_ingress_manifest(self, app: AppDeployment) -> client.V1Ingress:
        """Create Kubernetes ingress manifest"""
        return client.V1Ingress(
            api_version="networking.k8s.io/v1",
            kind="Ingress",
            metadata=client.V1ObjectMeta(
                name=f"{app.name}-ingress",
                annotations={
                    "kubernetes.io/ingress.class": "nginx",
                    "cert-manager.io/cluster-issuer": "letsencrypt-prod"
                }
            ),
            spec=client.V1IngressSpec(
                tls=[
                    client.V1IngressTLS(
                        hosts=[f"{app.name}.vibecaas.com"],
                        secret_name=f"{app.name}-tls"
                    )
                ],
                rules=[
                    client.V1IngressRule(
                        host=f"{app.name}.vibecaas.com",
                        http=client.V1HTTPIngressRuleValue(
                            paths=[
                                client.V1HTTPIngressPath(
                                    path="/",
                                    path_type="Prefix",
                                    backend=client.V1IngressBackend(
                                        service=client.V1IngressServiceBackend(
                                            name=f"{app.name}-service",
                                            port=client.V1ServiceBackendPort(number=80)
                                        )
                                    )
                                )
                            ]
                        )
                    )
                ]
            )
        )
    
    def get_deployment_status(self, app_name: str) -> Dict:
        """Get deployment status"""
        try:
            deployment = self.apps_v1.read_namespaced_deployment(
                name=app_name,
                namespace=self.namespace
            )
            
            return {
                "name": deployment.metadata.name,
                "replicas": deployment.spec.replicas,
                "ready_replicas": deployment.status.ready_replicas or 0,
                "available_replicas": deployment.status.available_replicas or 0,
                "status": "running" if deployment.status.ready_replicas == deployment.spec.replicas else "pending"
            }
        except ApiException as e:
            print(f"Error getting deployment status: {e}")
            return {"status": "error"}
    
    def scale_deployment(self, app_name: str, replicas: int) -> bool:
        """Scale deployment"""
        try:
            # Update deployment
            deployment = self.apps_v1.read_namespaced_deployment(
                name=app_name,
                namespace=self.namespace
            )
            deployment.spec.replicas = replicas
            
            self.apps_v1.patch_namespaced_deployment(
                name=app_name,
                namespace=self.namespace,
                body=deployment
            )
            return True
        except ApiException as e:
            print(f"Error scaling deployment: {e}")
            return False
    
    def delete_deployment(self, app_name: str) -> bool:
        """Delete deployment and associated resources"""
        try:
            # Delete deployment
            self.apps_v1.delete_namespaced_deployment(
                name=app_name,
                namespace=self.namespace
            )
            
            # Delete service
            self.v1.delete_namespaced_service(
                name=f"{app_name}-service",
                namespace=self.namespace
            )
            
            # Delete ingress if exists
            try:
                self.networking_v1.delete_namespaced_ingress(
                    name=f"{app_name}-ingress",
                    namespace=self.namespace
                )
            except ApiException:
                pass  # Ingress might not exist
            
            return True
        except ApiException as e:
            print(f"Error deleting deployment: {e}")
            return False

# Example usage
if __name__ == "__main__":
    manager = ContainerManager()
    
    # Create a sample app deployment
    app = AppDeployment(
        app_id="test-app-123",
        name="my-test-app",
        image="nginx:latest",
        gpu_required=False,
        gpu_type=None,
        resources={
            "memory": "256Mi",
            "cpu": "250m",
            "memory_limit": "512Mi",
            "cpu_limit": "500m"
        },
        environment={
            "NODE_ENV": "production",
            "API_URL": "https://api.vibecaas.com"
        },
        status="pending"
    )
    
    # Deploy the app
    success = manager.create_app_deployment(app)
    if success:
        print("App deployed successfully!")
        
        # Check status
        status = manager.get_deployment_status(app.name)
        print(f"Deployment status: {status}")