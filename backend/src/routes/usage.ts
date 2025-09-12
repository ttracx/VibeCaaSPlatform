import express from 'express'
import { AppModel } from '../models/App'
import { BillingService } from '../services/BillingService'

const router = express.Router()

// Get resource usage for user
router.get('/', async (req: any, res, next) => {
  try {
    const apps = await AppModel.find({ userId: req.user.id })
    
    const totalApps = apps.length
    const runningApps = apps.filter(app => app.status === 'running').length
    
    // Calculate total resources
    let totalCpu = 0
    let totalMemory = 0
    let totalGpu = 0
    
    apps.forEach(app => {
      // Parse CPU (e.g., "500m" = 0.5)
      const cpuValue = parseFloat(app.resources.cpu.replace('m', '')) / 1000
      totalCpu += cpuValue
      
      // Parse Memory (e.g., "512Mi" = 512)
      const memoryValue = parseInt(app.resources.memory.replace(/[^0-9]/g, ''))
      totalMemory += memoryValue
      
      // Parse GPU if available
      if (app.resources.gpu) {
        const gpuValue = parseInt(app.resources.gpu.replace(/[^0-9]/g, ''))
        totalGpu += gpuValue
      }
    })
    
    // Format resources
    const formatCpu = (cpu: number) => {
      if (cpu < 1) {
        return `${Math.round(cpu * 1000)}m`
      }
      return `${cpu.toFixed(1)}`
    }
    
    const formatMemory = (memory: number) => {
      if (memory < 1024) {
        return `${memory}Mi`
      }
      return `${(memory / 1024).toFixed(1)}Gi`
    }
    
    const formatGpu = (gpu: number) => {
      return `${gpu}`
    }
    
    // Calculate costs
    const monthlyCost = await BillingService.calculateMonthlyCost(req.user.id)
    const dailyCost = monthlyCost / 30
    
    const usage = {
      totalApps,
      runningApps,
      totalCpu: formatCpu(totalCpu),
      totalMemory: formatMemory(totalMemory),
      totalGpu: totalGpu > 0 ? formatGpu(totalGpu) : undefined,
      monthlyCost,
      dailyCost
    }
    
    res.json(usage)
  } catch (error) {
    next(error)
  }
})

export default router