import { App } from '../types/app';
export declare class AppManagementService {
    private static k8sClient;
    static startApp(app: App): Promise<void>;
    static stopApp(app: App): Promise<void>;
    static restartApp(app: App): Promise<void>;
    static updateApp(app: App): Promise<void>;
    static getAppLogs(app: App): Promise<string[]>;
    static getAppMetrics(app: App): Promise<App['metrics']>;
    static getAppStatus(app: App): Promise<string>;
}
//# sourceMappingURL=AppManagementService.d.ts.map