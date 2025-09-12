import axios from 'axios'
import { GitHubRepository, RepositoryAnalysis } from '@/types/app'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class GitHubApiService {
  private baseURL = `${API_BASE_URL}/github`

  async getAuthUrl(): Promise<{ authUrl: string }> {
    const response = await axios.get(`${this.baseURL}/auth/url`)
    return response.data
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
    const response = await axios.post(`${this.baseURL}/auth/callback`, { code })
    return response.data
  }

  async getRepositories(accessToken: string): Promise<GitHubRepository[]> {
    const response = await axios.get(`${this.baseURL}/repositories`, {
      params: { accessToken }
    })
    return response.data
  }

  async getRepositoryDetails(accessToken: string, owner: string, repo: string): Promise<GitHubRepository> {
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
    const response = await axios.post(
      `${this.baseURL}/repositories/analyze`,
      { owner, repo, branch },
      { params: { accessToken } }
    )
    return response.data
  }
}

export const githubApiService = new GitHubApiService()