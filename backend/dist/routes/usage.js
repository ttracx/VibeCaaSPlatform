"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const App_1 = require("../models/App");
const BillingService_1 = require("../services/BillingService");
const router = express_1.default.Router();
router.get('/', async (req, res, next) => {
    try {
        const apps = await App_1.AppModel.find({ userId: req.user.id });
        const totalApps = apps.length;
        const runningApps = apps.filter(app => app.status === 'running').length;
        let totalCpu = 0;
        let totalMemory = 0;
        let totalGpu = 0;
        apps.forEach(app => {
            const cpuValue = parseFloat(app.resources.cpu.replace('m', '')) / 1000;
            totalCpu += cpuValue;
            const memoryValue = parseInt(app.resources.memory.replace(/[^0-9]/g, ''));
            totalMemory += memoryValue;
            if (app.resources.gpu) {
                const gpuValue = parseInt(app.resources.gpu.replace(/[^0-9]/g, ''));
                totalGpu += gpuValue;
            }
        });
        const formatCpu = (cpu) => {
            if (cpu < 1) {
                return `${Math.round(cpu * 1000)}m`;
            }
            return `${cpu.toFixed(1)}`;
        };
        const formatMemory = (memory) => {
            if (memory < 1024) {
                return `${memory}Mi`;
            }
            return `${(memory / 1024).toFixed(1)}Gi`;
        };
        const formatGpu = (gpu) => {
            return `${gpu}`;
        };
        const monthlyCost = await BillingService_1.BillingService.calculateMonthlyCost(req.user.id);
        const dailyCost = monthlyCost / 30;
        const usage = {
            totalApps,
            runningApps,
            totalCpu: formatCpu(totalCpu),
            totalMemory: formatMemory(totalMemory),
            totalGpu: totalGpu > 0 ? formatGpu(totalGpu) : undefined,
            monthlyCost,
            dailyCost
        };
        res.json(usage);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=usage.js.map