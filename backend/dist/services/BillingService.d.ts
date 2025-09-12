export declare class BillingService {
    private static readonly PRICING;
    static calculateMonthlyCost(userId: string): Promise<number>;
    static calculateDailyCost(userId: string): Promise<number>;
    static calculateAppHourlyCost(app: any): number;
    static getUsageReport(userId: string, startDate: Date, endDate: Date): Promise<any>;
    static getBillingHistory(userId: string, limit?: number): Promise<any[]>;
    static createInvoice(userId: string, month: number, year: number): Promise<any>;
}
//# sourceMappingURL=BillingService.d.ts.map