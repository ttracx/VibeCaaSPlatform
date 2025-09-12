"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const App_1 = require("../models/App");
const logger_1 = require("../utils/logger");
class BillingService {
    static async calculateMonthlyCost(userId) {
        try {
            const apps = await App_1.AppModel.find({ userId });
            let totalCost = 0;
            for (const app of apps) {
                if (app.status === 'running') {
                    const hourlyCost = this.calculateAppHourlyCost(app);
                    const monthlyCost = hourlyCost * 24 * 30;
                    totalCost += monthlyCost;
                }
            }
            return Math.round(totalCost * 100) / 100;
        }
        catch (error) {
            logger_1.logger.error('Failed to calculate monthly cost:', error);
            return 0;
        }
    }
    static async calculateDailyCost(userId) {
        try {
            const monthlyCost = await this.calculateMonthlyCost(userId);
            return Math.round((monthlyCost / 30) * 100) / 100;
        }
        catch (error) {
            logger_1.logger.error('Failed to calculate daily cost:', error);
            return 0;
        }
    }
    static calculateAppHourlyCost(app) {
        let cost = 0;
        const cpuCost = this.PRICING.cpu[app.resources.cpu] || 0;
        cost += cpuCost;
        const memoryCost = this.PRICING.memory[app.resources.memory] || 0;
        cost += memoryCost;
        if (app.resources.gpu) {
            const gpuCost = this.PRICING.gpu[app.resources.gpu] || 0;
            cost += gpuCost;
        }
        return cost;
    }
    static async getUsageReport(userId, startDate, endDate) {
        try {
            const apps = await App_1.AppModel.find({
                userId,
                createdAt: { $gte: startDate, $lte: endDate }
            });
            const report = {
                totalApps: apps.length,
                runningApps: apps.filter(app => app.status === 'running').length,
                totalCost: 0,
                apps: []
            };
            for (const app of apps) {
                const hourlyCost = this.calculateAppHourlyCost(app);
                const dailyCost = hourlyCost * 24;
                const totalCost = dailyCost * Math.ceil((endDate.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                report.totalCost += totalCost;
                report.apps.push({
                    id: app.id,
                    name: app.name,
                    status: app.status,
                    hourlyCost,
                    dailyCost,
                    totalCost
                });
            }
            return report;
        }
        catch (error) {
            logger_1.logger.error('Failed to generate usage report:', error);
            throw error;
        }
    }
    static async getBillingHistory(userId, limit = 10) {
        try {
            return [
                {
                    id: 'bill-1',
                    date: new Date('2024-01-01'),
                    amount: 25.50,
                    status: 'paid',
                    description: 'Monthly usage - January 2024'
                },
                {
                    id: 'bill-2',
                    date: new Date('2023-12-01'),
                    amount: 18.75,
                    status: 'paid',
                    description: 'Monthly usage - December 2023'
                }
            ];
        }
        catch (error) {
            logger_1.logger.error('Failed to get billing history:', error);
            return [];
        }
    }
    static async createInvoice(userId, month, year) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            const report = await this.getUsageReport(userId, startDate, endDate);
            const invoice = {
                id: `inv-${year}-${month.toString().padStart(2, '0')}-${userId.slice(0, 8)}`,
                userId,
                month,
                year,
                amount: report.totalCost,
                status: 'pending',
                items: report.apps,
                createdAt: new Date(),
                dueDate: new Date(year, month, 15)
            };
            logger_1.logger.info(`Invoice created for user ${userId}: $${invoice.amount}`);
            return invoice;
        }
        catch (error) {
            logger_1.logger.error('Failed to create invoice:', error);
            throw error;
        }
    }
}
exports.BillingService = BillingService;
BillingService.PRICING = {
    cpu: {
        '100m': 0.01,
        '250m': 0.025,
        '500m': 0.05,
        '1000m': 0.10,
        '2000m': 0.20
    },
    memory: {
        '128Mi': 0.005,
        '256Mi': 0.01,
        '512Mi': 0.02,
        '1Gi': 0.04,
        '2Gi': 0.08,
        '4Gi': 0.16
    },
    gpu: {
        '1': 1.00,
        '2': 2.00,
        '4': 4.00
    }
};
//# sourceMappingURL=BillingService.js.map