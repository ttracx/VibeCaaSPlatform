"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvisioningService = void 0;
const k8sClient_1 = require("../utils/k8sClient");
const logger_1 = require("../utils/logger");
class ProvisioningService {
    static async provisionApp(app) {
        try {
            logger_1.logger.info(`Starting provisioning for app ${app.id}`);
            await this.createNamespace(app.namespace);
            await this.createDeployment(app);
            await this.createService(app);
            if (app.port) {
                await this.createIngress(app);
            }
            logger_1.logger.info(`App ${app.id} provisioned successfully`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to provision app ${app.id}:`, error);
            throw error;
        }
    }
    static async terminateApp(app) {
        try {
            logger_1.logger.info(`Terminating app ${app.id}`);
            if (app.kubernetesConfig?.ingressName) {
                await this.k8sClient.deleteIngress(app.kubernetesConfig.ingressName, app.namespace);
            }
            if (app.kubernetesConfig?.serviceName) {
                await this.k8sClient.deleteService(app.kubernetesConfig.serviceName, app.namespace);
            }
            if (app.kubernetesConfig?.deploymentName) {
                await this.k8sClient.deleteDeployment(app.kubernetesConfig.deploymentName, app.namespace);
            }
            await this.k8sClient.deleteNamespace(app.namespace);
            logger_1.logger.info(`App ${app.id} terminated successfully`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to terminate app ${app.id}:`, error);
            throw error;
        }
    }
    static async createNamespace(namespace) {
        const namespaceManifest = {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
                name: namespace,
                labels: {
                    'vibecaas.com/managed': 'true'
                }
            }
        };
        await this.k8sClient.createNamespace(namespaceManifest);
    }
    static async createDeployment(app) {
        const deploymentName = `app-${app.id}`;
        const labels = {
            'app': app.name,
            'app-id': app.id,
            'user-id': app.userId,
            'vibecaas.com/managed': 'true'
        };
        const deploymentManifest = {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: {
                name: deploymentName,
                namespace: app.namespace,
                labels
            },
            spec: {
                replicas: 1,
                selector: {
                    matchLabels: {
                        'app-id': app.id
                    }
                },
                template: {
                    metadata: {
                        labels
                    },
                    spec: {
                        containers: [{
                                name: app.name,
                                image: app.image,
                                ports: [{
                                        containerPort: app.port,
                                        name: 'http'
                                    }],
                                resources: {
                                    requests: {
                                        cpu: app.resources.cpu,
                                        memory: app.resources.memory
                                    },
                                    limits: {
                                        cpu: app.resources.cpu,
                                        memory: app.resources.memory
                                    }
                                },
                                env: Object.entries(app.environment).map(([key, value]) => ({
                                    name: key,
                                    value: value
                                })),
                                volumeMounts: app.volumes.map(volume => ({
                                    name: volume.name,
                                    mountPath: volume.mountPath
                                }))
                            }],
                        volumes: app.volumes.map(volume => ({
                            name: volume.name,
                            persistentVolumeClaim: {
                                claimName: `${volume.name}-pvc`
                            }
                        }))
                    }
                }
            }
        };
        await this.k8sClient.createDeployment(deploymentManifest, app.namespace);
        app.kubernetesConfig = {
            ...app.kubernetesConfig,
            deploymentName
        };
    }
    static async createService(app) {
        const serviceName = `app-${app.id}-service`;
        const labels = {
            'app-id': app.id,
            'vibecaas.com/managed': 'true'
        };
        const serviceManifest = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: serviceName,
                namespace: app.namespace,
                labels
            },
            spec: {
                selector: {
                    'app-id': app.id
                },
                ports: [{
                        port: app.port,
                        targetPort: app.port,
                        name: 'http'
                    }],
                type: 'ClusterIP'
            }
        };
        await this.k8sClient.createService(serviceManifest, app.namespace);
        app.kubernetesConfig = {
            ...app.kubernetesConfig,
            serviceName
        };
    }
    static async createIngress(app) {
        const ingressName = `app-${app.id}-ingress`;
        const hostname = `${app.id}.vibecaas.local`;
        const ingressManifest = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: ingressName,
                namespace: app.namespace,
                annotations: {
                    'nginx.ingress.kubernetes.io/rewrite-target': '/',
                    'cert-manager.io/cluster-issuer': 'letsencrypt-prod'
                }
            },
            spec: {
                rules: [{
                        host: hostname,
                        http: {
                            paths: [{
                                    path: '/',
                                    pathType: 'Prefix',
                                    backend: {
                                        service: {
                                            name: `app-${app.id}-service`,
                                            port: {
                                                number: app.port
                                            }
                                        }
                                    }
                                }]
                        }
                    }],
                tls: [{
                        hosts: [hostname],
                        secretName: `${app.id}-tls`
                    }]
            }
        };
        await this.k8sClient.createIngress(ingressManifest, app.namespace);
        app.kubernetesConfig = {
            ...app.kubernetesConfig,
            ingressName
        };
        app.url = `https://${hostname}`;
    }
}
exports.ProvisioningService = ProvisioningService;
ProvisioningService.k8sClient = new k8sClient_1.K8sClient();
//# sourceMappingURL=ProvisioningService.js.map