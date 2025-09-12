import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import { connectDatabase } from './config/database'
import { connectRedis } from './config/redis'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'
import { GitHubService } from './services/GitHubService'

// Routes
import authRoutes from './routes/auth'
import appRoutes from './routes/apps'
import usageRoutes from './routes/usage'
import templateRoutes from './routes/templates'
import webhookRoutes from './routes/webhooks'
import githubRoutes from './routes/github'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 8000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression
app.use(compression())

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API Routes
app.use('/auth', authRoutes)
app.use('/apps', authMiddleware, appRoutes)
app.use('/usage', authMiddleware, usageRoutes)
app.use('/templates', templateRoutes)
app.use('/webhooks', webhookRoutes)
app.use('/github', githubRoutes)

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)
  
  socket.on('join-app', (appId: string) => {
    socket.join(`app-${appId}`)
    logger.info(`Client ${socket.id} joined app ${appId}`)
  })
  
  socket.on('leave-app', (appId: string) => {
    socket.leave(`app-${appId}`)
    logger.info(`Client ${socket.id} left app ${appId}`)
  })
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Make io available to routes
app.set('io', io)

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
async function startServer() {
  try {
    // Connect to databases
    await connectDatabase()
    await connectRedis()
    
    // Initialize GitHub service
    GitHubService.initialize()
    
    server.listen(PORT, () => {
      logger.info(`🚀 VibeCaaS Backend running on port ${PORT}`)
      logger.info(`📊 Health check: http://localhost:${PORT}/health`)
      logger.info(`🔗 API Documentation: http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

startServer()