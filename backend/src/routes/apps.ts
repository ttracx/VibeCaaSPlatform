import express from 'express'
import Joi from 'joi'
import { AppModel } from '../models/App'
import { ProvisioningService } from '../services/ProvisioningService'
import { AppManagementService } from '../services/AppManagementService'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Validation schemas
const createAppSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200),
  image: Joi.string().required(),
  port: Joi.number().min(1).max(65535).required(),
  resources: Joi.object({
    cpu: Joi.string().required(),
    memory: Joi.string().required(),
    gpu: Joi.string()
  }).required(),
  environment: Joi.object().pattern(Joi.string(), Joi.string()),
  volumes: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    mountPath: Joi.string().required(),
    size: Joi.string().required()
  }))
})

const updateAppSchema = createAppSchema.fork(['name', 'image', 'port', 'resources'], (schema) => schema.optional())

// Get all apps for user
router.get('/', async (req: any, res, next) => {
  try {
    const apps = await AppModel.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json(apps)
  } catch (error) {
    next(error)
  }
})

// Get single app
router.get('/:id', async (req: any, res, next) => {
  try {
    const app = await AppModel.findOne({ id: req.params.id, userId: req.user.id })
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }
    res.json(app)
  } catch (error) {
    next(error)
  }
})

// Create new app
router.post('/', async (req: any, res, next) => {
  try {
    const { error, value } = createAppSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const appId = uuidv4()
    const namespace = `user-${req.user.id}-${appId.slice(0, 8)}`

    // Create app record
    const app = new AppModel({
      id: appId,
      userId: req.user.id,
      namespace,
      ...value,
      status: 'creating'
    })

    await app.save()

    // Start provisioning process
    try {
      await ProvisioningService.provisionApp(app)
      logger.info(`App ${appId} provisioning started`)
    } catch (provisionError) {
      logger.error(`Failed to provision app ${appId}:`, provisionError)
      app.status = 'terminated'
      await app.save()
      throw provisionError
    }

    res.status(201).json(app)
  } catch (error) {
    next(error)
  }
})

// Update app
router.put('/:id', async (req: any, res, next) => {
  try {
    const { error, value } = updateAppSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const app = await AppModel.findOne({ id: req.params.id, userId: req.user.id })
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }

    // Update app
    Object.assign(app, value)
    await app.save()

    // Update Kubernetes resources if needed
    if (app.status === 'running') {
      await AppManagementService.updateApp(app)
    }

    res.json(app)
  } catch (error) {
    next(error)
  }
})

// Delete app
router.delete('/:id', async (req: any, res, next) => {
  try {
    const app = await AppModel.findOne({ id: req.params.id, userId: req.user.id })
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }

    // Terminate Kubernetes resources
    await ProvisioningService.terminateApp(app)
    
    // Delete from database
    await AppModel.deleteOne({ id: req.params.id })

    logger.info(`App ${req.params.id} deleted`)

    res.json({ message: 'App deleted successfully' })
  } catch (error) {
    next(error)
  }
})

// Start app
router.post('/:id/start', async (req: any, res, next) => {
  try {
    const app = await AppModel.findOne({ id: req.params.id, userId: req.user.id })
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }

    if (app.status !== 'stopped') {
      return res.status(400).json({ error: 'App is not in stopped state' })
    }

    await AppManagementService.startApp(app)
    app.status = 'running'
    await app.save()

    res.json({ message: 'App started successfully' })
  } catch (error) {
    next(error)
  }
})

// Stop app
router.post('/:id/stop', async (req: any, res, next) => {
  try {
    const app = await AppModel.findOne({ id: req.params.id, userId: req.user.id })
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }

    if (app.status !== 'running') {
      return res.status(400).json({ error: 'App is not running' })
    }

    await AppManagementService.stopApp(app)
    app.status = 'stopped'
    await app.save()

    res.json({ message: 'App stopped successfully' })
  } catch (error) {
    next(error)
  }
})

// Restart app
router.post('/:id/restart', async (req: any, res, next) => {
  try {
    const app = await AppModel.findOne({ id: req.params.id, userId: req.user.id })
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }

    await AppManagementService.restartApp(app)
    app.status = 'running'
    await app.save()

    res.json({ message: 'App restarted successfully' })
  } catch (error) {
    next(error)
  }
})

// Get app logs
router.get('/:id/logs', async (req: any, res, next) => {
  try {
    const app = await AppModel.findOne({ id: req.params.id, userId: req.user.id })
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }

    const logs = await AppManagementService.getAppLogs(app)
    res.json(logs)
  } catch (error) {
    next(error)
  }
})

// Get app metrics
router.get('/:id/metrics', async (req: any, res, next) => {
  try {
    const app = await AppModel.findOne({ id: req.params.id, userId: req.user.id })
    if (!app) {
      return res.status(404).json({ error: 'App not found' })
    }

    const metrics = await AppManagementService.getAppMetrics(app)
    res.json(metrics)
  } catch (error) {
    next(error)
  }
})

export default router