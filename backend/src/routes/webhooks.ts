import express from 'express'
import { logger } from '../utils/logger'
import { AppModel } from '../models/App'
import { AppManagementService } from '../services/AppManagementService'

const router = express.Router()

// Kubernetes webhook for pod status updates
router.post('/kubernetes/pod-status', async (req, res) => {
  try {
    const { podName, namespace, status, reason, message } = req.body
    
    logger.info(`Pod status update: ${podName} in ${namespace} - ${status}`)
    
    // Find app by pod name or namespace
    const app = await AppModel.findOne({
      $or: [
        { 'kubernetesConfig.podName': podName },
        { namespace: namespace }
      ]
    })
    
    if (!app) {
      logger.warn(`No app found for pod ${podName} in namespace ${namespace}`)
      return res.status(404).json({ error: 'App not found' })
    }
    
    // Update app status based on pod status
    switch (status) {
      case 'Running':
        app.status = 'running'
        break
      case 'Pending':
        app.status = 'creating'
        break
      case 'Failed':
      case 'CrashLoopBackOff':
        app.status = 'terminated'
        break
      case 'Succeeded':
        app.status = 'stopped'
        break
      default:
        logger.warn(`Unknown pod status: ${status}`)
    }
    
    await app.save()
    
    // Emit real-time update
    const io = req.app.get('io')
    if (io) {
      io.to(`app-${app.id}`).emit('app-status-update', {
        appId: app.id,
        status: app.status,
        message
      })
    }
    
    res.json({ message: 'Status updated successfully' })
  } catch (error) {
    logger.error('Pod status webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Resource usage webhook
router.post('/kubernetes/metrics', async (req, res) => {
  try {
    const { podName, namespace, metrics } = req.body
    
    const app = await AppModel.findOne({
      $or: [
        { 'kubernetesConfig.podName': podName },
        { namespace: namespace }
      ]
    })
    
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }
    
    // Update metrics
    app.metrics = {
      cpu: metrics.cpu || 0,
      memory: metrics.memory || 0,
      networkIn: metrics.networkIn || 0,
      networkOut: metrics.networkOut || 0
    }
    
    await app.save()
    
    // Emit real-time update
    const io = req.app.get('io')
    if (io) {
      io.to(`app-${app.id}`).emit('app-metrics-update', {
        appId: app.id,
        metrics: app.metrics
      })
    }
    
    res.json({ message: 'Metrics updated successfully' })
  } catch (error) {
    logger.error('Metrics webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Logs webhook
router.post('/kubernetes/logs', async (req, res) => {
  try {
    const { podName, namespace, logs } = req.body
    
    const app = await AppModel.findOne({
      $or: [
        { 'kubernetesConfig.podName': podName },
        { namespace: namespace }
      ]
    })
    
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }
    
    // Update logs (keep last 1000 lines)
    const newLogs = [...(app.logs || []), ...logs].slice(-1000)
    app.logs = newLogs
    
    await app.save()
    
    // Emit real-time update
    const io = req.app.get('io')
    if (io) {
      io.to(`app-${app.id}`).emit('app-logs-update', {
        appId: app.id,
        logs: logs
      })
    }
    
    res.json({ message: 'Logs updated successfully' })
  } catch (error) {
    logger.error('Logs webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check webhook
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  })
})

export default router