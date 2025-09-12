"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
const GitHubService_1 = require("./services/GitHubService");
const auth_2 = __importDefault(require("./routes/auth"));
const apps_1 = __importDefault(require("./routes/apps"));
const usage_1 = __importDefault(require("./routes/usage"));
const templates_1 = __importDefault(require("./routes/templates"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const github_1 = __importDefault(require("./routes/github"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 8000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined', { stream: { write: message => logger_1.logger.info(message.trim()) } }));
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.use('/auth', auth_2.default);
app.use('/apps', auth_1.authMiddleware, apps_1.default);
app.use('/usage', auth_1.authMiddleware, usage_1.default);
app.use('/templates', templates_1.default);
app.use('/webhooks', webhooks_1.default);
app.use('/github', github_1.default);
io.on('connection', (socket) => {
    logger_1.logger.info(`Client connected: ${socket.id}`);
    socket.on('join-app', (appId) => {
        socket.join(`app-${appId}`);
        logger_1.logger.info(`Client ${socket.id} joined app ${appId}`);
    });
    socket.on('leave-app', (appId) => {
        socket.leave(`app-${appId}`);
        logger_1.logger.info(`Client ${socket.id} left app ${appId}`);
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`Client disconnected: ${socket.id}`);
    });
});
app.set('io', io);
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
async function startServer() {
    try {
        await (0, database_1.connectDatabase)();
        await (0, redis_1.connectRedis)();
        GitHubService_1.GitHubService.initialize();
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 VibeCaaS Backend running on port ${PORT}`);
            logger_1.logger.info(`📊 Health check: http://localhost:${PORT}/health`);
            logger_1.logger.info(`🔗 API Documentation: http://localhost:${PORT}/api-docs`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=index.js.map