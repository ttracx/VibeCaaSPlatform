import { createClient } from 'redis'
import { logger } from '../utils/logger'

let redisClient: ReturnType<typeof createClient>

export async function connectRedis() {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    })
    
    redisClient.on('error', (error) => {
      logger.error('Redis client error:', error)
    })
    
    redisClient.on('connect', () => {
      logger.info('✅ Connected to Redis')
    })
    
    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...')
    })
    
    redisClient.on('ready', () => {
      logger.info('Redis ready')
    })
    
    await redisClient.connect()
    
  } catch (error) {
    logger.error('Failed to connect to Redis:', error)
    throw error
  }
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized')
  }
  return redisClient
}