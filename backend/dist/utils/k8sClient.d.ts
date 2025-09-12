export declare class K8sClient {
    private kc;
    private k8sApi;
    private appsV1Api;
    private networkingV1Api;
    private metricsApi;
    constructor();
    createNamespace(manifest: any): Promise<void>;
    deleteNamespace(name: string): Promise<void>;
    createDeployment(manifest: any, namespace: string): Promise<void>;
    updateDeployment(name: string, namespace: string, manifest: any): Promise<void>;
    deleteDeployment(name: string, namespace: string): Promise<void>;
    getDeployment(name: string, namespace: string): Promise<any>;
    scaleDeployment(name: string, namespace: string, replicas: number): Promise<void>;
    restartDeployment(name: string, namespace: string): Promise<void>;
    createService(manifest: any, namespace: string): Promise<void>;
    deleteService(name: string, namespace: string): Promise<void>;
    createIngress(manifest: any, namespace: string): Promise<void>;
    deleteIngress(name: string, namespace: string): Promise<void>;
    getPods(namespace: string, labelSelector?: Record<string, string>): Promise<any[]>;
    getPodLogs(podName: string, namespace: string): Promise<string>;
    getPodMetrics(podName: string, namespace: string): Promise<any>;
    private parseCpuUsage;
    private parseMemoryUsage;
}
//# sourceMappingURL=k8sClient.d.ts.map