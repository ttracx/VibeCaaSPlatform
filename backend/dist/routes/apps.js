"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const App_1 = require("../models/App");
const ProvisioningService_1 = require("../services/ProvisioningService");
const AppManagementService_1 = require("../services/AppManagementService");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const createAppSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    description: joi_1.default.string().max(200),
    image: joi_1.default.string().required(),
    port: joi_1.default.number().min(1).max(65535).required(),
    resources: joi_1.default.object({
        cpu: joi_1.default.string().required(),
        memory: joi_1.default.string().required(),
        gpu: joi_1.default.string()
    }).required(),
    environment: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.string()),
    volumes: joi_1.default.array().items(joi_1.default.object({
        name: joi_1.default.string().required(),
        mountPath: joi_1.default.string().required(),
        size: joi_1.default.string().required()
    }))
});
const updateAppSchema = createAppSchema.fork(['name', 'image', 'port', 'resources'], (schema) => schema.optional());
router.get('/', async (req, res, next) => {
    try {
        const apps = await App_1.AppModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(apps);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const app = await App_1.AppModel.findOne({ id: req.params.id, userId: req.user.id });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        res.json(app);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { error, value } = createAppSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const appId = (0, uuid_1.v4)();
        const namespace = `user-${req.user.id}-${appId.slice(0, 8)}`;
        const app = new App_1.AppModel({
            id: appId,
            userId: req.user.id,
            namespace,
            ...value,
            status: 'creating'
        });
        await app.save();
        try {
            await ProvisioningService_1.ProvisioningService.provisionApp(app);
            logger_1.logger.info(`App ${appId} provisioning started`);
        }
        catch (provisionError) {
            logger_1.logger.error(`Failed to provision app ${appId}:`, provisionError);
            app.status = 'terminated';
            await app.save();
            throw provisionError;
        }
        res.status(201).json(app);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { error, value } = updateAppSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const app = await App_1.AppModel.findOne({ id: req.params.id, userId: req.user.id });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        Object.assign(app, value);
        await app.save();
        if (app.status === 'running') {
            await AppManagementService_1.AppManagementService.updateApp(app);
        }
        res.json(app);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const app = await App_1.AppModel.findOne({ id: req.params.id, userId: req.user.id });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        await ProvisioningService_1.ProvisioningService.terminateApp(app);
        await App_1.AppModel.deleteOne({ id: req.params.id });
        logger_1.logger.info(`App ${req.params.id} deleted`);
        res.json({ message: 'App deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.post('/:id/start', async (req, res, next) => {
    try {
        const app = await App_1.AppModel.findOne({ id: req.params.id, userId: req.user.id });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        if (app.status !== 'stopped') {
            return res.status(400).json({ error: 'App is not in stopped state' });
        }
        await AppManagementService_1.AppManagementService.startApp(app);
        app.status = 'running';
        await app.save();
        res.json({ message: 'App started successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.post('/:id/stop', async (req, res, next) => {
    try {
        const app = await App_1.AppModel.findOne({ id: req.params.id, userId: req.user.id });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        if (app.status !== 'running') {
            return res.status(400).json({ error: 'App is not running' });
        }
        await AppManagementService_1.AppManagementService.stopApp(app);
        app.status = 'stopped';
        await app.save();
        res.json({ message: 'App stopped successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.post('/:id/restart', async (req, res, next) => {
    try {
        const app = await App_1.AppModel.findOne({ id: req.params.id, userId: req.user.id });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        await AppManagementService_1.AppManagementService.restartApp(app);
        app.status = 'running';
        await app.save();
        res.json({ message: 'App restarted successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/logs', async (req, res, next) => {
    try {
        const app = await App_1.AppModel.findOne({ id: req.params.id, userId: req.user.id });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        const logs = await AppManagementService_1.AppManagementService.getAppLogs(app);
        res.json(logs);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/metrics', async (req, res, next) => {
    try {
        const app = await App_1.AppModel.findOne({ id: req.params.id, userId: req.user.id });
        if (!app) {
            return res.status(404).json({ error: 'App not found' });
        }
        const metrics = await AppManagementService_1.AppManagementService.getAppMetrics(app);
        res.json(metrics);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=apps.js.map