import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get resource usage for user's apps
router.get('/usage', authenticateToken, (req: AuthenticatedRequest, res, next) => {
  try {
    // Mock resource usage data
    const usage = {
      cpu: {
        current: 65,
        limit: 100,
        unit: '%'
      },
      memory: {
        current: 2.3,
        limit: 4,
        unit: 'GB'
      },
      storage: {
        current: 15.7,
        limit: 50,
        unit: 'GB'
      },
      network: {
        rx: 1.2,
        tx: 0.8,
        unit: 'Mbps'
      },
      costs: {
        current: 23.45,
        projected: 31.20,
        currency: 'USD'
      }
    };

    res.json(usage);
  } catch (error) {
    next(error);
  }
});

// Get resource usage for specific app
router.get('/usage/:appId', authenticateToken, (req: AuthenticatedRequest, res, next) => {
  try {
    const appId = req.params.appId;
    
    // Mock app-specific resource usage
    const appUsage = {
      appId,
      metrics: [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          cpu: 45,
          memory: 1.2,
          network: { rx: 0.5, tx: 0.3 }
        },
        {
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          cpu: 52,
          memory: 1.4,
          network: { rx: 0.7, tx: 0.4 }
        },
        {
          timestamp: new Date().toISOString(),
          cpu: 65,
          memory: 1.6,
          network: { rx: 0.8, tx: 0.5 }
        }
      ]
    };

    res.json(appUsage);
  } catch (error) {
    next(error);
  }
});

// Get available NVIDIA GPU resources
router.get('/gpu', authenticateToken, (req: AuthenticatedRequest, res, next) => {
  try {
    const gpuResources = {
      available: [
        {
          id: 'gpu-1',
          type: 'NVIDIA RTX 4090',
          memory: '24GB',
          cores: 16384,
          status: 'available',
          region: 'us-west-1',
          pricePerHour: 2.50
        },
        {
          id: 'gpu-2',
          type: 'NVIDIA A100',
          memory: '40GB',
          cores: 6912,
          status: 'available',
          region: 'us-west-1',
          pricePerHour: 4.00
        },
        {
          id: 'gpu-3',
          type: 'NVIDIA H100',
          memory: '80GB',
          cores: 14592,
          status: 'available',
          region: 'us-east-1',
          pricePerHour: 8.00
        }
      ],
      allocated: [
        {
          id: 'gpu-4',
          type: 'NVIDIA RTX 4090',
          memory: '24GB',
          appId: 'app-123',
          allocatedAt: new Date().toISOString(),
          region: 'us-west-1'
        }
      ]
    };

    res.json(gpuResources);
  } catch (error) {
    next(error);
  }
});

export { router as resourcesRouter };