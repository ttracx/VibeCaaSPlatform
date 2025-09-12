"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppManagementService = void 0;
const k8sClient_1 = require("../utils/k8sClient");
const logger_1 = require("../utils/logger");
class AppManagementService {
    static async startApp(app) {
        try {
            if (!app.kubernetesConfig?.deploymentName) {
                throw new Error('App deployment not found');
            }
            await this.k8sClient.scaleDeployment(app.kubernetesConfig.deploymentName, app.namespace, 1);
            logger_1.logger.info(`App ${app.id} started`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to start app ${app.id}:`, error);
            throw error;
        }
    }
    static async stopApp(app) {
        try {
            if (!app.kubernetesConfig?.deploymentName) {
                throw new Error('App deployment not found');
            }
            await this.k8sClient.scaleDeployment(app.kubernetesConfig.deploymentName, app.namespace, 0);
            logger_1.logger.info(`App ${app.id} stopped`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to stop app ${app.id}:`, error);
            throw error;
        }
    }
    static async restartApp(app) {
        try {
            if (!app.kubernetesConfig?.deploymentName) {
                throw new Error('App deployment not found');
            }
            await this.k8sClient.restartDeployment(app.kubernetesConfig.deploymentName, app.namespace);
            logger_1.logger.info(`App ${app.id} restarted`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to restart app ${app.id}:`, error);
            throw error;
        }
    }
    static async updateApp(app) {
        try {
            if (!app.kubernetesConfig?.deploymentName) {
                throw new Error('App deployment not found');
            }
            const deploymentManifest = {
                spec: {
                    template: {
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
                                    }))
                                }]
                        }
                    }
                }
            };
            await this.k8sClient.updateDeployment(app.kubernetesConfig.deploymentName, app.namespace, deploymentManifest);
            logger_1.logger.info(`App ${app.id} updated`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to update app ${app.id}:`, error);
            throw error;
        }
    }
    static async getAppLogs(app) {
        try {
            if (!app.kubernetesConfig?.deploymentName) {
                throw new Error('App deployment not found');
            }
            const pods = await this.k8sClient.getPods(app.namespace, {
                'app-id': app.id
            });
            if (pods.length === 0) {
                return [];
            }
            const podName = pods[0].metadata?.name;
            if (!podName) {
                return [];
            }
            const logs = await this.k8sClient.getPodLogs(podName, app.namespace);
            app.logs = logs.split('\n').filter(line => line.trim());
            app.kubernetesConfig = {
                ...app.kubernetesConfig,
                podName
            };
            return app.logs;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get logs for app ${app.id}:`, error);
            return [];
        }
    }
    static async getAppMetrics(app) {
        try {
            if (!app.kubernetesConfig?.deploymentName) {
                throw new Error('App deployment not found');
            }
            const pods = await this.k8sClient.getPods(app.namespace, {
                'app-id': app.id
            });
            if (pods.length === 0) {
                return {
                    cpu: 0,
                    memory: 0,
                    networkIn: 0,
                    networkOut: 0
                };
            }
            const podName = pods[0].metadata?.name;
            if (!podName) {
                return {
                    cpu: 0,
                    memory: 0,
                    networkIn: 0,
                    networkOut: 0
                };
            }
            const metrics = await this.k8sClient.getPodMetrics(podName, app.namespace);
            app.metrics = metrics;
            app.kubernetesConfig = {
                ...app.kubernetesConfig,
                podName
            };
            return metrics;
        }
        catch (error) {
            logger_1.logger.error(`Failed to get metrics for app ${app.id}:`, error);
            return {
                cpu: 0,
                memory: 0,
                networkIn: 0,
                networkOut: 0
            };
        }
    }
    static async getAppStatus(app) {
        try {
            if (!app.kubernetesConfig?.deploymentName) {
                return 'unknown';
            }
            const deployment = await this.k8sClient.getDeployment(app.kubernetesConfig.deploymentName, app.namespace);
            if (!deployment) {
                return 'not-found';
            }
            const replicas = deployment.spec?.replicas || 0;
            const readyReplicas = deployment.status?.readyReplicas || 0;
            if (replicas === 0) {
                return 'stopped';
            }
            else if (readyReplicas === replicas) {
                return 'running';
            }
            else if (readyReplicas > 0) {
                return 'building';
            }
            else {
                return 'creating';
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to get status for app ${app.id}:`, error);
            return 'unknown';
        }
    }
}
exports.AppManagementService = AppManagementService;
AppManagementService.k8sClient = new k8sClient_1.K8sClient();
//# sourceMappingURL=AppManagementService.js.map