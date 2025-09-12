import { Octokit } from '@octokit/rest'
import { createOAuthAppAuth } from '@octokit/auth-oauth-app'
import { logger } from '../utils/logger'

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

export class GitHubService {
  private static octokit: Octokit

  static initialize() {
    const githubAppId = process.env.GITHUB_APP_ID
    const githubClientId = process.env.GITHUB_CLIENT_ID
    const githubClientSecret = process.env.GITHUB_CLIENT_SECRET
    const githubPrivateKey = process.env.GITHUB_PRIVATE_KEY

    if (!githubClientId || !githubClientSecret) {
      logger.warn('GitHub OAuth credentials not configured')
      return
    }

    this.octokit = new Octokit({
      authStrategy: createOAuthAppAuth,
      auth: {
        clientType: 'oauth-app',
        clientId: githubClientId,
        clientSecret: githubClientSecret,
      },
    })
  }

  static async getUserRepositories(accessToken: string): Promise<GitHubRepository[]> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      })

      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: 100,
        sort: 'updated',
        type: 'all',
      })

      return repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        private: repo.private,
        htmlUrl: repo.html_url,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
        language: repo.language,
        updatedAt: repo.updated_at || new Date().toISOString(),
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
      }))
    } catch (error) {
      logger.error('Failed to fetch user repositories:', error)
      throw new Error('Failed to fetch repositories')
    }
  }

  static async getRepositoryDetails(accessToken: string, owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      })

      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      })

      return {
        id: data.id,
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        private: data.private,
        htmlUrl: data.html_url,
        cloneUrl: data.clone_url,
        defaultBranch: data.default_branch,
        language: data.language,
        updatedAt: data.updated_at,
        stargazersCount: data.stargazers_count,
        forksCount: data.forks_count,
      }
    } catch (error) {
      logger.error(`Failed to fetch repository details for ${owner}/${repo}:`, error)
      throw new Error('Failed to fetch repository details')
    }
  }

  static async analyzeRepository(accessToken: string, owner: string, repo: string, branch?: string): Promise<RepositoryAnalysis> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      })

      const defaultBranch = branch || (await this.getRepositoryDetails(accessToken, owner, repo)).defaultBranch

      // Check for Dockerfile
      let hasDockerfile = false
      let dockerfilePath = 'Dockerfile'
      let dockerfileContent = ''

      try {
        const { data: dockerfileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: 'Dockerfile',
          ref: defaultBranch,
        })

        if (dockerfileData && 'content' in dockerfileData) {
          hasDockerfile = true
          dockerfileContent = Buffer.from(dockerfileData.content, 'base64').toString()
        }
      } catch (error) {
        // Dockerfile not found, check for other common names
        const dockerfileNames = ['Dockerfile.dev', 'Dockerfile.prod', 'docker/Dockerfile']
        
        for (const dockerfileName of dockerfileNames) {
          try {
            const { data: dockerfileData } = await octokit.rest.repos.getContent({
              owner,
              repo,
              path: dockerfileName,
              ref: defaultBranch,
            })

            if (dockerfileData && 'content' in dockerfileData) {
              hasDockerfile = true
              dockerfilePath = dockerfileName
              dockerfileContent = Buffer.from(dockerfileData.content, 'base64').toString()
              break
            }
          } catch (e) {
            // Continue to next name
          }
        }
      }

      // Get package.json or other config files to detect language and commands
      let detectedLanguage: string | null = null
      let buildCommand: string | undefined
      let startCommand: string | undefined
      const environmentVariables: Record<string, string> = {}

      try {
        // Check for package.json (Node.js)
        const { data: packageJsonData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: 'package.json',
          ref: defaultBranch,
        })

        if (packageJsonData && 'content' in packageJsonData) {
          const packageJson = JSON.parse(Buffer.from(packageJsonData.content, 'base64').toString())
          detectedLanguage = 'JavaScript'
          
          if (packageJson.scripts) {
            buildCommand = packageJson.scripts.build
            startCommand = packageJson.scripts.start
          }

          if (packageJson.engines?.node) {
            environmentVariables.NODE_VERSION = packageJson.engines.node
          }
        }
      } catch (error) {
        // Not a Node.js project
      }

      try {
        // Check for requirements.txt (Python)
        const { data: requirementsData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: 'requirements.txt',
          ref: defaultBranch,
        })

        if (requirementsData && 'content' in requirementsData) {
          detectedLanguage = 'Python'
          environmentVariables.PYTHON_VERSION = '3.11'
        }
      } catch (error) {
        // Not a Python project
      }

      try {
        // Check for go.mod (Go)
        const { data: goModData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: 'go.mod',
          ref: defaultBranch,
        })

        if (goModData && 'content' in goModData) {
          detectedLanguage = 'Go'
          environmentVariables.GO_VERSION = '1.21'
        }
      } catch (error) {
        // Not a Go project
      }

      // Determine suggested port and resources based on language
      let suggestedPort = 3000
      let suggestedResources = { cpu: '500m', memory: '512Mi' }

      if (detectedLanguage === 'Python') {
        suggestedPort = 8000
        suggestedResources = { cpu: '500m', memory: '512Mi' }
      } else if (detectedLanguage === 'Go') {
        suggestedPort = 8080
        suggestedResources = { cpu: '250m', memory: '256Mi' }
      } else if (detectedLanguage === 'JavaScript') {
        suggestedPort = 3000
        suggestedResources = { cpu: '500m', memory: '512Mi' }
      }

      return {
        hasDockerfile,
        dockerfilePath,
        dockerfileContent,
        detectedLanguage,
        suggestedPort,
        suggestedResources,
        buildCommand,
        startCommand,
        environmentVariables,
      }
    } catch (error) {
      logger.error(`Failed to analyze repository ${owner}/${repo}:`, error)
      throw new Error('Failed to analyze repository')
    }
  }

  static async getOAuthUrl(): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID
    const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/auth/github/callback'
    
    if (!clientId) {
      throw new Error('GitHub OAuth not configured')
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo,read:user',
      state: Math.random().toString(36).substring(7),
    })

    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      })

      const data = await response.json() as any

      if (data.error) {
        throw new Error(data.error_description || data.error)
      }

      return data.access_token
    } catch (error) {
      logger.error('Failed to exchange code for token:', error)
      throw new Error('Failed to authenticate with GitHub')
    }
  }
}