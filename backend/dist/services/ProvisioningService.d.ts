import { App } from '../types/app';
export declare class ProvisioningService {
    private static k8sClient;
    static provisionApp(app: App): Promise<void>;
    static terminateApp(app: App): Promise<void>;
    private static createNamespace;
    private static createDeployment;
    private static createService;
    private static createIngress;
}
//# sourceMappingURL=ProvisioningService.d.ts.map