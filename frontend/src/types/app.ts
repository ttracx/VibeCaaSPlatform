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

export interface GitHubRepository {
  id: number
  name: string
  fullName: string
  description: string | null
  private: boolean
  htmlUrl: string
  cloneUrl: string
  defaultBranch: string
  language: string | null
  updatedAt: string
  stargazersCount: number
  forksCount: number
}

export interface RepositoryAnalysis {
  hasDockerfile: boolean
  dockerfilePath?: string
  dockerfileContent?: string
  detectedLanguage: string | null
  suggestedPort: number
  suggestedResources: {
    cpu: string
    memory: string
  }
  buildCommand?: string
  startCommand?: string
  environmentVariables: Record<string, string>
}

export interface CreateAppFromGitHubRequest extends CreateAppRequest {
  githubRepository: {
    owner: string
    repo: string
    branch?: string
  }
}