"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../utils/logger");
const App_1 = require("../models/App");
const router = express_1.default.Router();
router.post('/kubernetes/pod-status', async (req, res) => {
    try {
        const { podName, namespace, status, reason, message } = req.body;
        logger_1.logger.info(`Pod status update: ${podName} in ${namespace} - ${status}`);
        const app = await App_1.AppModel.findOne({
            $or: [
                { 'kubernetesConfig.podName': podName },
                { namespace: namespace }
            ]
        });
        if (!app) {
            logger_1.logger.warn(`No app found for pod ${podName} in namespace ${namespace}`);
            return res.status(404).json({ error: 'App not found' });
        }
        switch (status) {
            case 'Running':
                app.status = 'running';
                break;
            case 'Pending':
                app.status = 'creating';
                break;
            case 'Failed':
            case 'CrashLoopBackOff':
                app.status = 'terminated';
                break;
            case 'Succeeded':
                app.status = 'stopped';
                break;
            default:
                logger_1.logger.warn(`Unknown pod status: ${status}`);
        }
        await app.save();
        const io = req.app.get('io');
        if (io) {
            io.to(`app-${app.id}`).emit('app-status-update', {
                appId: app.id,
                status: app.status,
                message
            });
        }
        res.json({ message: 'Status updated successfully' });
    }
    catch (error) {
        logger_1.logger.error('Pod status webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/kubernetes/metrics', async (req, res) => {
    try {
        const { podName, namespace, metrics } = req.body;
        const app = await App_1.AppModel.findOne({
            $or: [
                { 'kubernetesConfig.podName': podName },
                { namespace: namespace }
            ]
        });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        app.metrics = {
            cpu: metrics.cpu || 0,
            memory: metrics.memory || 0,
            networkIn: metrics.networkIn || 0,
            networkOut: metrics.networkOut || 0
        };
        await app.save();
        const io = req.app.get('io');
        if (io) {
            io.to(`app-${app.id}`).emit('app-metrics-update', {
                appId: app.id,
                metrics: app.metrics
            });
        }
        res.json({ message: 'Metrics updated successfully' });
    }
    catch (error) {
        logger_1.logger.error('Metrics webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/kubernetes/logs', async (req, res) => {
    try {
        const { podName, namespace, logs } = req.body;
        const app = await App_1.AppModel.findOne({
            $or: [
                { 'kubernetesConfig.podName': podName },
                { namespace: namespace }
            ]
        });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        const newLogs = [...(app.logs || []), ...logs].slice(-1000);
        app.logs = newLogs;
        await app.save();
        const io = req.app.get('io');
        if (io) {
            io.to(`app-${app.id}`).emit('app-logs-update', {
                appId: app.id,
                logs: logs
            });
        }
        res.json({ message: 'Logs updated successfully' });
    }
    catch (error) {
        logger_1.logger.error('Logs webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=webhooks.js.map