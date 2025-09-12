export interface App {
  _id?: string
  id: string
  name: string
  description?: string
  status: 'creating' | 'building' | 'running' | 'stopped' | 'terminated'
  image: string
  port: number
  url?: string
  userId: string
  namespace: string
  createdAt: Date
  updatedAt: Date
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
  kubernetesConfig?: {
    deploymentName: string
    serviceName: string
    ingressName?: string
    podName?: string
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

export interface UpdateAppRequest extends Partial<CreateAppRequest> {
  status?: App['status']
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

export interface User {
  _id?: string
  id: string
  email: string
  name: string
  password: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface Template {
  id: string
  name: string
  description: string
  image: string
  port: number
  category: string
  tags: string[]
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

export interface KubernetesConfig {
  namespace: string
  deploymentName: string
  serviceName: string
  ingressName?: string
  labels: Record<string, string>
  annotations: Record<string, string>
}