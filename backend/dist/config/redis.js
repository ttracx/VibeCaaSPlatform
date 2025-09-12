"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.getRedisClient = getRedisClient;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
let redisClient;
async function connectRedis() {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        redisClient = (0, redis_1.createClient)({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 50, 500)
            }
        });
        redisClient.on('error', (error) => {
            logger_1.logger.error('Redis client error:', error);
        });
        redisClient.on('connect', () => {
            logger_1.logger.info('✅ Connected to Redis');
        });
        redisClient.on('reconnecting', () => {
            logger_1.logger.info('Redis reconnecting...');
        });
        redisClient.on('ready', () => {
            logger_1.logger.info('Redis ready');
        });
        await redisClient.connect();
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to Redis:', error);
        throw error;
    }
}
function getRedisClient() {
    if (!redisClient) {
        throw new Error('Redis client not initialized');
    }
    return redisClient;
}
//# sourceMappingURL=redis.js.map