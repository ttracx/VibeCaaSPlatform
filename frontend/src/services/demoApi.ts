import { App } from '@/types/app'

// Mock data for demonstration
const mockApps: App[] = [
  {
    id: '1',
    name: 'React Dashboard',
    description: 'A modern React dashboard with TypeScript and Tailwind CSS',
    image: 'node:18-alpine',
    port: 3000,
    status: 'running',
    url: 'https://react-dashboard-demo.vercel.app',
    resources: {
      cpu: '0.5',
      memory: '512Mi',
      gpu: '0'
    },
    environment: { NODE_ENV: 'production' },
    volumes: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '2',
    name: 'Python API',
    description: 'FastAPI backend with PostgreSQL database',
    image: 'python:3.11-slim',
    port: 8000,
    status: 'stopped',
    url: undefined,
    resources: {
      cpu: '1.0',
      memory: '1Gi',
      gpu: '0'
    },
    environment: { PYTHONPATH: '/app' },
    volumes: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: '3',
    name: 'ML Model Server',
    description: 'TensorFlow serving with GPU acceleration',
    image: 'tensorflow/serving:latest-gpu',
    port: 8501,
    status: 'creating',
    url: undefined,
    resources: {
      cpu: '2.0',
      memory: '4Gi',
      gpu: '1'
    },
    environment: { TENSORFLOW_INTER_OP_PARALLELISM_THREADS: '4' },
    volumes: [],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: '4',
    name: 'Vue.js SPA',
    description: 'Single Page Application built with Vue 3 and Vite',
    image: 'node:18-alpine',
    port: 5173,
    status: 'running',
    url: 'https://vue-spa-demo.netlify.app',
    resources: {
      cpu: '0.25',
      memory: '256Mi',
      gpu: '0'
    },
    environment: { NODE_ENV: 'production' },
    volumes: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
  },
  {
    id: '5',
    name: 'Database Admin',
    description: 'pgAdmin interface for database management',
    image: 'dpage/pgadmin4:latest',
    port: 80,
    status: 'terminated',
    url: undefined,
    resources: {
      cpu: '0.5',
      memory: '512Mi',
      gpu: '0'
    },
    environment: { PGADMIN_DEFAULT_EMAIL: 'admin@example.com' },
    volumes: [],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: '6',
    name: 'Monitoring Dashboard',
    description: 'Grafana dashboard for system monitoring',
    image: 'grafana/grafana:latest',
    port: 3000,
    status: 'building',
    url: undefined,
    resources: {
      cpu: '1.0',
      memory: '1Gi',
      gpu: '0'
    },
    environment: { GF_SECURITY_ADMIN_PASSWORD: 'admin' },
    volumes: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  }
]

const mockUsage = {
  totalApps: 6,
  runningApps: 2,
  totalCpu: '8.0',
  totalMemory: '16.0',
  totalGpu: '2',
  monthlyCost: 245.50,
  dailyCost: 8.18,
  cpu: {
    used: 3.25,
    total: 8.0,
    percentage: 40.6
  },
  memory: {
    used: 6.5,
    total: 16.0,
    percentage: 40.6
  },
  gpu: {
    used: 1,
    total: 2,
    percentage: 50.0
  },
  storage: {
    used: 45.2,
    total: 100.0,
    percentage: 45.2
  }
}

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const demoApiService = {
  async getApps(): Promise<App[]> {
    await delay(500) // Simulate network delay
    return [...mockApps]
  },

  async getResourceUsage() {
    await delay(300)
    return mockUsage
  },

  async createApp(appData: Partial<App>): Promise<App> {
    await delay(1000) // Simulate creation time
    const newApp: App = {
      id: Date.now().toString(),
      name: appData.name || 'New App',
      description: appData.description || '',
      image: appData.image || 'node:18-alpine',
      port: appData.port || 3000,
      status: 'creating',
      url: undefined,
      resources: appData.resources || { cpu: '0.5', memory: '512Mi', gpu: '0' },
      environment: appData.environment || {},
      volumes: appData.volumes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockApps.push(newApp)
    return newApp
  },

  async startApp(appId: string): Promise<void> {
    await delay(800)
    const app = mockApps.find(a => a.id === appId)
    if (app) {
      app.status = 'running'
      app.url = `https://${app.name.toLowerCase().replace(/\s+/g, '-')}.demo.vibecaas.com`
      app.updatedAt = new Date().toISOString()
    }
  },

  async stopApp(appId: string): Promise<void> {
    await delay(500)
    const app = mockApps.find(a => a.id === appId)
    if (app) {
      app.status = 'stopped'
      app.url = undefined
      app.updatedAt = new Date().toISOString()
    }
  },

  async deleteApp(appId: string): Promise<void> {
    await delay(300)
    const index = mockApps.findIndex(a => a.id === appId)
    if (index > -1) {
      mockApps.splice(index, 1)
    }
  }
}