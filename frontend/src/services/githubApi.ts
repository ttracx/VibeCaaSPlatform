import axios from 'axios'
import { GitHubRepository, RepositoryAnalysis } from '@/types/app'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class GitHubApiService {
  private baseURL = `${API_BASE_URL}/github`

  async getAuthUrl(): Promise<{ authUrl: string }> {
    // For demo purposes, return a mock auth URL
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      return { authUrl: 'https://github.com/login/oauth/authorize?client_id=demo&redirect_uri=demo' }
    }
    const response = await axios.get(`${this.baseURL}/auth/url`)
    return response.data
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
    // For demo purposes, return a mock token
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      return { accessToken: 'demo-token-' + Date.now() }
    }
    const response = await axios.post(`${this.baseURL}/auth/callback`, { code })
    return response.data
  }

  async getRepositories(accessToken: string): Promise<GitHubRepository[]> {
    // For demo purposes, return mock repositories
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          id: 1,
          name: 'demo-app',
          fullName: 'user/demo-app',
          description: 'A demo application for VibeCaaS',
          private: false,
          htmlUrl: 'https://github.com/user/demo-app',
          cloneUrl: 'https://github.com/user/demo-app.git',
          defaultBranch: 'main',
          language: 'TypeScript',
          updatedAt: new Date().toISOString(),
          stargazersCount: 0,
          forksCount: 0
        },
        {
          id: 2,
          name: 'react-dashboard',
          fullName: 'user/react-dashboard',
          description: 'A React dashboard with TypeScript',
          private: false,
          htmlUrl: 'https://github.com/user/react-dashboard',
          cloneUrl: 'https://github.com/user/react-dashboard.git',
          defaultBranch: 'main',
          language: 'TypeScript',
          updatedAt: new Date().toISOString(),
          stargazersCount: 5,
          forksCount: 2
        }
      ]
    }
    const response = await axios.get(`${this.baseURL}/repositories`, {
      params: { accessToken }
    })
    return response.data
  }

  async getRepositoryDetails(accessToken: string, owner: string, repo: string): Promise<GitHubRepository> {
    // For demo purposes, return a mock repository
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      return {
        id: 1,
        name: repo,
        fullName: `${owner}/${repo}`,
        description: `A demo ${repo} application`,
        private: false,
        htmlUrl: `https://github.com/${owner}/${repo}`,
        cloneUrl: `https://github.com/${owner}/${repo}.git`,
        defaultBranch: 'main',
        language: 'TypeScript',
        updatedAt: new Date().toISOString(),
        stargazersCount: 0,
        forksCount: 0
      }
    }
    const response = await axios.get(`${this.baseURL}/repositories/${owner}/${repo}`, {
      params: { accessToken }
    })
    return response.data
  }

  async analyzeRepository(
    accessToken: string, 
    owner: string, 
    repo: string, 
    branch?: string
  ): Promise<RepositoryAnalysis> {
    // For demo purposes, return mock analysis
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL) {
      return {
        hasDockerfile: true,
        dockerfilePath: 'Dockerfile',
        detectedLanguage: 'TypeScript',
        suggestedPort: 3000,
        suggestedResources: {
          cpu: '500m',
          memory: '512Mi'
        },
        buildCommand: 'npm run build',
        startCommand: 'npm start',
        environmentVariables: {
          NODE_ENV: 'production',
          PORT: '3000'
        }
      }
    }
    const response = await axios.post(
      `${this.baseURL}/repositories/analyze`,
      { owner, repo, branch },
      { params: { accessToken } }
    )
    return response.data
  }
}

export const githubApiService = new GitHubApiService()