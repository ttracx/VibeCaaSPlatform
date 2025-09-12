export interface App {
  id: string
  name: string
  description?: string
  status: 'creating' | 'building' | 'running' | 'stopped' | 'terminated'
  image: string
  port: number
  url?: string
  createdAt: string
  updatedAt: string
  resources: {
    cpu: string
    memory: string
    gpu?: string
  }
  environment: Record<string, string>
  volumes: Array<{
    name: string
    mountPath: string
    size: string
  }>
  logs?: string[]
  metrics?: {
    cpu: number
    memory: number
    networkIn: number
    networkOut: number
  }
}

export interface CreateAppRequest {
  name: string
  description?: string
  image: string
  port: number
  resources: {
    cpu: string
    memory: string
    gpu?: string
  }
  environment: Record<string, string>
  volumes: Array<{
    name: string
    mountPath: string
    size: string
  }>
}

export interface ResourceUsage {
  totalApps: number
  runningApps: number
  totalCpu: string
  totalMemory: string
  totalGpu: string
  monthlyCost: number
  dailyCost: number
}