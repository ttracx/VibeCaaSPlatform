export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface App {
  id: string;
  name: string;
  description: string;
  language: string;
  framework: string;
  status: 'building' | 'running' | 'stopped' | 'error';
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
}

export interface DeploymentLog {
  id: string;
  appId: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp: string;
}

export interface ResourceUsage {
  appId: string;
  cpu: {
    usage: number;
    limit: number;
  };
  memory: {
    usage: number;
    limit: number;
  };
  network: {
    rx: number;
    tx: number;
  };
  timestamp: string;
}

export interface CreateAppRequest {
  name: string;
  description: string;
  language: string;
  framework: string;
  template?: string;
  resources?: {
    cpu: string;
    memory: string;
    storage: string;
  };
}