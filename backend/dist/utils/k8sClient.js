"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.K8sClient = void 0;
const k8s = __importStar(require("@kubernetes/client-node"));
const logger_1 = require("./logger");
class K8sClient {
    constructor() {
        this.kc = new k8s.KubeConfig();
        try {
            this.kc.loadFromCluster();
        }
        catch (error) {
            logger_1.logger.warn('Failed to load from cluster, trying local config:', error);
            try {
                this.kc.loadFromDefault();
            }
            catch (localError) {
                logger_1.logger.error('Failed to load Kubernetes config:', localError);
                throw new Error('Unable to load Kubernetes configuration');
            }
        }
        this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
        this.appsV1Api = this.kc.makeApiClient(k8s.AppsV1Api);
        this.networkingV1Api = this.kc.makeApiClient(k8s.NetworkingV1Api);
        this.metricsApi = this.kc.makeApiClient(k8s.MetricsV1beta1Api);
    }
    async createNamespace(manifest) {
        try {
            await this.k8sApi.createNamespace(manifest);
            logger_1.logger.info(`Namespace ${manifest.metadata.name} created`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to create namespace ${manifest.metadata.name}:`, error);
            throw error;
        }
    }
    async deleteNamespace(name) {
        try {
            await this.k8sApi.deleteNamespace(name);
            logger_1.logger.info(`Namespace ${name} deleted`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to delete namespace ${name}:`, error);
            throw error;
        }
    }
    async createDeployment(manifest, namespace) {
        try {
            await this.appsV1Api.createNamespacedDeployment(namespace, manifest);
            logger_1.logger.info(`Deployment ${manifest.metadata.name} created in ${namespace}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to create deployment ${manifest.metadata.name}:`, error);
            throw error;
        }
    }
    async updateDeployment(name, namespace, manifest) {
        try {
            await this.appsV1Api.patchNamespacedDeployment(name, namespace, manifest);
            logger_1.logger.info(`Deployment ${name} updated in ${namespace}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to update deployment ${name}:`, error);
            throw error;
        }
    }
    async deleteDeployment(name, namespace) {
        try {
            await this.appsV1Api.deleteNamespacedDeployment(name, namespace);
            logger_1.logger.info(`Deployment ${name} deleted from ${namespace}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to delete deployment ${name}:`, error);
            throw error;
        }
    }
    async getDeployment(name, namespace) {
        try {
            const response = await this.appsV1Api.readNamespacedDeployment(name, namespace);
            return response.body;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get deployment ${name}:`, error);
            return null;
        }
    }
    async scaleDeployment(name, namespace, replicas) {
        try {
            const scale = {
                spec: {
                    replicas
                }
            };
            await this.appsV1Api.patchNamespacedDeploymentScale(name, namespace, scale);
            logger_1.logger.info(`Deployment ${name} scaled to ${replicas} replicas`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to scale deployment ${name}:`, error);
            throw error;
        }
    }
    async restartDeployment(name, namespace) {
        try {
            const patch = {
                spec: {
                    template: {
                        metadata: {
                            annotations: {
                                'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
                            }
                        }
                    }
                }
            };
            await this.appsV1Api.patchNamespacedDeployment(name, namespace, patch);
            logger_1.logger.info(`Deployment ${name} restarted`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to restart deployment ${name}:`, error);
            throw error;
        }
    }
    async createService(manifest, namespace) {
        try {
            await this.k8sApi.createNamespacedService(namespace, manifest);
            logger_1.logger.info(`Service ${manifest.metadata.name} created in ${namespace}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to create service ${manifest.metadata.name}:`, error);
            throw error;
        }
    }
    async deleteService(name, namespace) {
        try {
            await this.k8sApi.deleteNamespacedService(name, namespace);
            logger_1.logger.info(`Service ${name} deleted from ${namespace}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to delete service ${name}:`, error);
            throw error;
        }
    }
    async createIngress(manifest, namespace) {
        try {
            await this.networkingV1Api.createNamespacedIngress(namespace, manifest);
            logger_1.logger.info(`Ingress ${manifest.metadata.name} created in ${namespace}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to create ingress ${manifest.metadata.name}:`, error);
            throw error;
        }
    }
    async deleteIngress(name, namespace) {
        try {
            await this.networkingV1Api.deleteNamespacedIngress(name, namespace);
            logger_1.logger.info(`Ingress ${name} deleted from ${namespace}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to delete ingress ${name}:`, error);
            throw error;
        }
    }
    async getPods(namespace, labelSelector) {
        try {
            const selector = labelSelector ?
                Object.entries(labelSelector).map(([key, value]) => `${key}=${value}`).join(',') :
                undefined;
            const response = await this.k8sApi.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, selector);
            return response.body.items;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get pods in ${namespace}:`, error);
            return [];
        }
    }
    async getPodLogs(podName, namespace) {
        try {
            const response = await this.k8sApi.readNamespacedPodLog(podName, namespace);
            return response.body;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get logs for pod ${podName}:`, error);
            return '';
        }
    }
    async getPodMetrics(podName, namespace) {
        try {
            const response = await this.metricsApi.readNamespacedPodMetrics(podName, namespace);
            const metrics = response.body.containers?.[0];
            return {
                cpu: this.parseCpuUsage(metrics?.usage?.cpu || '0'),
                memory: this.parseMemoryUsage(metrics?.usage?.memory || '0'),
                networkIn: 0,
                networkOut: 0
            };
        }
        catch (error) {
            logger_1.logger.error(`Failed to get metrics for pod ${podName}:`, error);
            return {
                cpu: 0,
                memory: 0,
                networkIn: 0,
                networkOut: 0
            };
        }
    }
    parseCpuUsage(cpuStr) {
        if (cpuStr.endsWith('n')) {
            return parseInt(cpuStr.replace('n', '')) / 1000000;
        }
        else if (cpuStr.endsWith('u')) {
            return parseInt(cpuStr.replace('u', '')) / 1000;
        }
        else if (cpuStr.endsWith('m')) {
            return parseInt(cpuStr.replace('m', ''));
        }
        else {
            return parseInt(cpuStr) * 1000;
        }
    }
    parseMemoryUsage(memoryStr) {
        if (memoryStr.endsWith('Ki')) {
            return parseInt(memoryStr.replace('Ki', '')) * 1024;
        }
        else if (memoryStr.endsWith('Mi')) {
            return parseInt(memoryStr.replace('Mi', '')) * 1024 * 1024;
        }
        else if (memoryStr.endsWith('Gi')) {
            return parseInt(memoryStr.replace('Gi', '')) * 1024 * 1024 * 1024;
        }
        else {
            return parseInt(memoryStr);
        }
    }
}
exports.K8sClient = K8sClient;
//# sourceMappingURL=k8sClient.js.map