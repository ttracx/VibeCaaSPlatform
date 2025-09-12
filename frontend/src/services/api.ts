import axios from 'axios'
import { App, CreateAppRequest, ResourceUsage } from '@/types/app'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  // Apps
  getApps: async (): Promise<App[]> => {
    const response = await api.get('/apps')
    return response.data
  },

  getApp: async (id: string): Promise<App> => {
    const response = await api.get(`/apps/${id}`)
    return response.data
  },

  createApp: async (app: CreateAppRequest): Promise<App> => {
    const response = await api.post('/apps', app)
    return response.data
  },

  updateApp: async (id: string, app: Partial<CreateAppRequest>): Promise<App> => {
    const response = await api.put(`/apps/${id}`, app)
    return response.data
  },

  deleteApp: async (id: string): Promise<void> => {
    await api.delete(`/apps/${id}`)
  },

  startApp: async (id: string): Promise<void> => {
    await api.post(`/apps/${id}/start`)
  },

  stopApp: async (id: string): Promise<void> => {
    await api.post(`/apps/${id}/stop`)
  },

  restartApp: async (id: string): Promise<void> => {
    await api.post(`/apps/${id}/restart`)
  },

  getAppLogs: async (id: string): Promise<string[]> => {
    const response = await api.get(`/apps/${id}/logs`)
    return response.data
  },

  getAppMetrics: async (id: string): Promise<App['metrics']> => {
    const response = await api.get(`/apps/${id}/metrics`)
    return response.data
  },

  // Resource Usage
  getResourceUsage: async (): Promise<ResourceUsage> => {
    const response = await api.get('/usage')
    return response.data
  },

  // Templates
  getTemplates: async (): Promise<Template[]> => {
    const response = await api.get('/templates')
    return response.data
  },

  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData: RegisterRequest): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

// Additional types
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
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}