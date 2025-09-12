import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Mock apps database
const apps: Array<{
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  status: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  environment: Record<string, string>;
}> = [];

// Get all apps for user
router.get('/', authenticateToken, (req: AuthenticatedRequest, res, next) => {
  try {
    const userApps = apps.filter(app => app.userId === req.user!.id);
    res.json(userApps);
  } catch (error) {
    next(error);
  }
});

// Get specific app
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res, next) => {
  try {
    const app = apps.find(a => a.id === req.params.id && a.userId === req.user!.id);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    res.json(app);
  } catch (error) {
    next(error);
  }
});

// Create new app
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, language, framework, template, resources } = req.body;

    const newApp = {
      id: uuidv4(),
      name,
      description,
      language,
      framework,
      status: 'building',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: req.user!.id,
      resources: resources || {
        cpu: '0.5 vCPU',
        memory: '1GB',
        storage: '5GB',
      },
      environment: {},
    };

    apps.push(newApp);

    logger.info('New app created:', { appId: newApp.id, userId: req.user!.id });

    // Simulate deployment process
    setTimeout(() => {
      const app = apps.find(a => a.id === newApp.id);
      if (app) {
        app.status = 'running';
        app.url = `https://${name.toLowerCase().replace(/\s+/g, '-')}.vibecaas.com`;
        app.updatedAt = new Date().toISOString();
        logger.info('App deployment completed:', { appId: newApp.id });
      }
    }, 5000);

    res.status(201).json(newApp);
  } catch (error) {
    next(error);
  }
});

// Update app
router.put('/:id', authenticateToken, (req: AuthenticatedRequest, res, next) => {
  try {
    const appIndex = apps.findIndex(a => a.id === req.params.id && a.userId === req.user!.id);
    if (appIndex === -1) {
      return res.status(404).json({ message: 'App not found' });
    }

    const { name, description, environment } = req.body;
    const app = apps[appIndex];

    if (name) app.name = name;
    if (description) app.description = description;
    if (environment) app.environment = { ...app.environment, ...environment };
    app.updatedAt = new Date().toISOString();

    logger.info('App updated:', { appId: app.id, userId: req.user!.id });

    res.json(app);
  } catch (error) {
    next(error);
  }
});

// Delete app
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res, next) => {
  try {
    const appIndex = apps.findIndex(a => a.id === req.params.id && a.userId === req.user!.id);
    if (appIndex === -1) {
      return res.status(404).json({ message: 'App not found' });
    }

    const app = apps.splice(appIndex, 1)[0];
    logger.info('App deleted:', { appId: app.id, userId: req.user!.id });

    res.json({ message: 'App deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Start/Stop app
router.post('/:id/:action(start|stop|restart)', authenticateToken, (req: AuthenticatedRequest, res, next) => {
  try {
    const app = apps.find(a => a.id === req.params.id && a.userId === req.user!.id);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    const action = req.params.action;
    
    switch (action) {
      case 'start':
        app.status = 'running';
        break;
      case 'stop':
        app.status = 'stopped';
        break;
      case 'restart':
        app.status = 'building';
        setTimeout(() => {
          app.status = 'running';
          app.updatedAt = new Date().toISOString();
        }, 3000);
        break;
    }

    app.updatedAt = new Date().toISOString();
    logger.info(`App ${action}:`, { appId: app.id, userId: req.user!.id });

    res.json(app);
  } catch (error) {
    next(error);
  }
});

export { router as appsRouter };