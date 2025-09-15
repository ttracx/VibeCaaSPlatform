"""
Kubernetes service for container orchestration
"""

from kubernetes import client, config
from kubernetes.client.rest import ApiException
from typing import Optional, Dict, List
import yaml
import base64

from app.core.config import settings
from app.models.application import Application

class KubernetesService:
    def __init__(self):
        """Initialize Kubernetes client"""
        if settings.K8S_IN_CLUSTER:
            config.load_incluster_config()
        else:
            config.load_kube_config()
        
        self.v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()
        self.networking_v1 = client.NetworkingV1Api()
        self.batch_v1 = client.BatchV1Api()
    
    def create_namespace(self, name: str) -> bool:
        """Create Kubernetes namespace"""
        try:
            namespace = client.V1Namespace(
                metadata=client.V1ObjectMeta(
                    name=name,
                    labels={"managed-by": "vibecaas"}
                )
            )
            self.v1.create_namespace(namespace)
            return True
        except ApiException as e:
            if e.status == 409:  # Already exists
                return True
            print(f"Failed to create namespace: {e}")
            return False
    
    def create_resource_quota(self, namespace: str, cpu: str, memory: str, storage: str) -> bool:
        """Create resource quota for namespace"""
        try:
            quota = client.V1ResourceQuota(
                metadata=client.V1ObjectMeta(name=f"{namespace}-quota"),
                spec=client.V1ResourceQuotaSpec(
                    hard={
                        "requests.cpu": cpu,
                        "requests.memory": memory,
                        "requests.storage": storage,
                        "persistentvolumeclaims": "5",
                        "pods": "10",
                        "services": "5"
                    }
                )
            )
            self.v1.create_namespaced_resource_quota(namespace, quota)
            return True
        except ApiException as e:
            if e.status == 409:  # Already exists
                return True
            print(f"Failed to create resource quota: {e}")
            return False
    
    def create_network_policy(self, namespace: str) -> bool:
        """Create network policy for namespace isolation"""
        try:
            policy = client.V1NetworkPolicy(
                metadata=client.V1ObjectMeta(name=f"{namespace}-isolation"),
                spec=client.V1NetworkPolicySpec(
                    pod_selector=client.V1LabelSelector(),
                    policy_types=["Ingress", "Egress"],
                    ingress=[
                        client.V1NetworkPolicyIngressRule(
                            from_=[
                                client.V1NetworkPolicyPeer(
                                    namespace_selector=client.V1LabelSelector(
                                        match_labels={"name": namespace}
                                    )
                                ),
                                client.V1NetworkPolicyPeer(
                                    namespace_selector=client.V1LabelSelector(
                                        match_labels={"name": "ingress-nginx"}
                                    )
                                )
                            ]
                        )
                    ],
                    egress=[
                        client.V1NetworkPolicyEgressRule(
                            to=[
                                client.V1NetworkPolicyPeer(
                                    namespace_selector=client.V1LabelSelector()
                                )
                            ]
                        )
                    ]
                )
            )
            self.networking_v1.create_namespaced_network_policy(namespace, policy)
            return True
        except ApiException as e:
            if e.status == 409:  # Already exists
                return True
            print(f"Failed to create network policy: {e}")
            return False
    
    def deploy_application(self, app: Application) -> bool:
        """Deploy application to Kubernetes"""
        try:
            # Create namespace if not exists
            self.create_namespace(app.namespace)
            
            # Create resource quota
            self.create_resource_quota(
                app.namespace,
                f"{app.cpu_limit}m",
                f"{app.memory_limit}Mi",
                f"{app.storage_limit}Mi"
            )
            
            # Create network policy
            self.create_network_policy(app.namespace)
            
            # Create deployment
            deployment = self._create_deployment_manifest(app)
            self.apps_v1.create_namespaced_deployment(app.namespace, deployment)
            
            # Create service
            service = self._create_service_manifest(app)
            self.v1.create_namespaced_service(app.namespace, service)
            
            # Create ingress
            ingress = self._create_ingress_manifest(app)
            self.networking_v1.create_namespaced_ingress(app.namespace, ingress)
            
            return True
        except ApiException as e:
            print(f"Failed to deploy application: {e}")
            return False
    
    def _create_deployment_manifest(self, app: Application) -> client.V1Deployment:
        """Create deployment manifest"""
        # Environment variables
        env_vars = [
            client.V1EnvVar(name=k, value=v)
            for k, v in app.environment_variables.items()
        ]
        
        # Container spec
        container = client.V1Container(
            name=app.name,
            image=app.image or f"{settings.REGISTRY_URL}/{app.owner_id}/{app.name}:latest",
            ports=[client.V1ContainerPort(container_port=app.port)],
            env=env_vars,
            resources=client.V1ResourceRequirements(
                requests={
                    "cpu": f"{app.cpu_limit}m",
                    "memory": f"{app.memory_limit}Mi"
                },
                limits={
                    "cpu": f"{app.cpu_limit * 2}m",
                    "memory": f"{app.memory_limit * 2}Mi"
                }
            ),
            liveness_probe=client.V1Probe(
                http_get=client.V1HTTPGetAction(
                    path=app.health_check_path,
                    port=app.port
                ),
                initial_delay_seconds=30,
                period_seconds=10
            ),
            readiness_probe=client.V1Probe(
                http_get=client.V1HTTPGetAction(
                    path=app.health_check_path,
                    port=app.port
                ),
                initial_delay_seconds=5,
                period_seconds=5
            )
        )
        
        # Add GPU resources if enabled
        if app.gpu_enabled and app.gpu_type:
            container.resources.limits["nvidia.com/gpu"] = "1"
        
        # Pod spec
        pod_spec = client.V1PodSpec(
            containers=[container],
            security_context=client.V1PodSecurityContext(
                run_as_non_root=True,
                run_as_user=1000,
                fs_group=1000
            )
        )
        
        # Deployment spec
        deployment = client.V1Deployment(
            metadata=client.V1ObjectMeta(
                name=app.deployment_name,
                labels={"app": app.name, "owner": app.owner_id}
            ),
            spec=client.V1DeploymentSpec(
                replicas=app.replicas,
                selector=client.V1LabelSelector(
                    match_labels={"app": app.name}
                ),
                template=client.V1PodTemplateSpec(
                    metadata=client.V1ObjectMeta(
                        labels={"app": app.name, "owner": app.owner_id}
                    ),
                    spec=pod_spec
                )
            )
        )
        
        return deployment
    
    def _create_service_manifest(self, app: Application) -> client.V1Service:
        """Create service manifest"""
        service = client.V1Service(
            metadata=client.V1ObjectMeta(
                name=app.service_name,
                labels={"app": app.name, "owner": app.owner_id}
            ),
            spec=client.V1ServiceSpec(
                selector={"app": app.name},
                ports=[
                    client.V1ServicePort(
                        port=80,
                        target_port=app.port,
                        protocol="TCP"
                    )
                ],
                type="ClusterIP"
            )
        )
        return service
    
    def _create_ingress_manifest(self, app: Application) -> client.V1Ingress:
        """Create ingress manifest"""
        # TLS configuration
        tls = []
        if app.ssl_enabled:
            tls = [
                client.V1IngressTLS(
                    hosts=[f"{app.subdomain}.vibecaas.com"],
                    secret_name=f"{app.name}-tls"
                )
            ]
        
        # Ingress rules
        rules = [
            client.V1IngressRule(
                host=f"{app.subdomain}.vibecaas.com",
                http=client.V1HTTPIngressRuleValue(
                    paths=[
                        client.V1HTTPIngressPath(
                            path="/",
                            path_type="Prefix",
                            backend=client.V1IngressBackend(
                                service=client.V1IngressServiceBackend(
                                    name=app.service_name,
                                    port=client.V1ServiceBackendPort(number=80)
                                )
                            )
                        )
                    ]
                )
            )
        ]
        
        # Add custom domain if configured
        if app.custom_domain:
            rules.append(
                client.V1IngressRule(
                    host=app.custom_domain,
                    http=client.V1HTTPIngressRuleValue(
                        paths=[
                            client.V1HTTPIngressPath(
                                path="/",
                                path_type="Prefix",
                                backend=client.V1IngressBackend(
                                    service=client.V1IngressServiceBackend(
                                        name=app.service_name,
                                        port=client.V1ServiceBackendPort(number=80)
                                    )
                                )
                            )
                        ]
                    )
                )
            )
            if app.ssl_enabled:
                tls.append(
                    client.V1IngressTLS(
                        hosts=[app.custom_domain],
                        secret_name=f"{app.name}-custom-tls"
                    )
                )
        
        ingress = client.V1Ingress(
            metadata=client.V1ObjectMeta(
                name=app.ingress_name,
                labels={"app": app.name, "owner": app.owner_id},
                annotations={
                    "kubernetes.io/ingress.class": "nginx",
                    "cert-manager.io/cluster-issuer": "letsencrypt-prod",
                    "nginx.ingress.kubernetes.io/proxy-body-size": "100m",
                    "nginx.ingress.kubernetes.io/proxy-connect-timeout": "600",
                    "nginx.ingress.kubernetes.io/proxy-send-timeout": "600",
                    "nginx.ingress.kubernetes.io/proxy-read-timeout": "600"
                }
            ),
            spec=client.V1IngressSpec(
                tls=tls,
                rules=rules
            )
        )
        return ingress
    
    def scale_deployment(self, namespace: str, deployment_name: str, replicas: int) -> bool:
        """Scale deployment replicas"""
        try:
            body = {"spec": {"replicas": replicas}}
            self.apps_v1.patch_namespaced_deployment_scale(
                name=deployment_name,
                namespace=namespace,
                body=body
            )
            return True
        except ApiException as e:
            print(f"Failed to scale deployment: {e}")
            return False
    
    def get_pod_logs(self, namespace: str, deployment_name: str, lines: int = 100) -> str:
        """Get pod logs"""
        try:
            # Get pods for deployment
            pods = self.v1.list_namespaced_pod(
                namespace=namespace,
                label_selector=f"app={deployment_name}"
            )
            
            if not pods.items:
                return "No pods found"
            
            # Get logs from first pod
            pod_name = pods.items[0].metadata.name
            logs = self.v1.read_namespaced_pod_log(
                name=pod_name,
                namespace=namespace,
                tail_lines=lines
            )
            return logs
        except ApiException as e:
            print(f"Failed to get logs: {e}")
            return f"Error getting logs: {e}"
    
    def delete_application(self, app: Application) -> bool:
        """Delete application resources"""
        try:
            # Delete ingress
            self.networking_v1.delete_namespaced_ingress(
                name=app.ingress_name,
                namespace=app.namespace
            )
            
            # Delete service
            self.v1.delete_namespaced_service(
                name=app.service_name,
                namespace=app.namespace
            )
            
            # Delete deployment
            self.apps_v1.delete_namespaced_deployment(
                name=app.deployment_name,
                namespace=app.namespace
            )
            
            return True
        except ApiException as e:
            print(f"Failed to delete application: {e}")
            return False
    
    def get_deployment_status(self, namespace: str, deployment_name: str) -> Dict:
        """Get deployment status"""
        try:
            deployment = self.apps_v1.read_namespaced_deployment(
                name=deployment_name,
                namespace=namespace
            )
            
            return {
                "replicas": deployment.spec.replicas,
                "ready_replicas": deployment.status.ready_replicas or 0,
                "available_replicas": deployment.status.available_replicas or 0,
                "conditions": [
                    {
                        "type": c.type,
                        "status": c.status,
                        "reason": c.reason,
                        "message": c.message
                    }
                    for c in deployment.status.conditions or []
                ]
            }
        except ApiException as e:
            print(f"Failed to get deployment status: {e}")
            return {"error": str(e)}