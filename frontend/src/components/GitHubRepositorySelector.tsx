'use client'

import { useState, useEffect } from 'react'
import { 
  CodeBracketIcon, 
  StarIcon, 
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { GitHubRepository, RepositoryAnalysis } from '@/types/app'
import { githubApiService } from '@/services/githubApi'
import { toast } from 'react-hot-toast'

interface GitHubRepositorySelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (repo: GitHubRepository, analysis: RepositoryAnalysis) => void
  accessToken: string
}

const mockRepositories: GitHubRepository[] = [
  {
    id: 1,
    name: 'react-dashboard',
    fullName: 'user/react-dashboard',
    description: 'A modern React dashboard with TypeScript and Tailwind CSS',
    private: false,
    htmlUrl: 'https://github.com/user/react-dashboard',
    cloneUrl: 'https://github.com/user/react-dashboard.git',
    defaultBranch: 'main',
    language: 'TypeScript',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    stargazersCount: 42,
    forksCount: 8
  },
  {
    id: 2,
    name: 'fastapi-backend',
    fullName: 'user/fastapi-backend',
    description: 'High-performance FastAPI backend with PostgreSQL and Redis',
    private: false,
    htmlUrl: 'https://github.com/user/fastapi-backend',
    cloneUrl: 'https://github.com/user/fastapi-backend.git',
    defaultBranch: 'main',
    language: 'Python',
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    stargazersCount: 28,
    forksCount: 12
  },
  {
    id: 3,
    name: 'go-microservice',
    fullName: 'user/go-microservice',
    description: 'Microservice architecture in Go with gRPC and Docker',
    private: false,
    htmlUrl: 'https://github.com/user/go-microservice',
    cloneUrl: 'https://github.com/user/go-microservice.git',
    defaultBranch: 'main',
    language: 'Go',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    stargazersCount: 67,
    forksCount: 15
  },
  {
    id: 4,
    name: 'nextjs-blog',
    fullName: 'user/nextjs-blog',
    description: 'Personal blog built with Next.js 14 and MDX',
    private: false,
    htmlUrl: 'https://github.com/user/nextjs-blog',
    cloneUrl: 'https://github.com/user/nextjs-blog.git',
    defaultBranch: 'main',
    language: 'TypeScript',
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    stargazersCount: 15,
    forksCount: 3
  },
  {
    id: 5,
    name: 'ml-pipeline',
    fullName: 'user/ml-pipeline',
    description: 'Machine learning pipeline with TensorFlow and Kubernetes',
    private: true,
    htmlUrl: 'https://github.com/user/ml-pipeline',
    cloneUrl: 'https://github.com/user/ml-pipeline.git',
    defaultBranch: 'main',
    language: 'Python',
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    stargazersCount: 89,
    forksCount: 23
  },
  {
    id: 6,
    name: 'rust-api',
    fullName: 'user/rust-api',
    description: 'High-performance REST API built with Rust and Actix Web',
    private: false,
    htmlUrl: 'https://github.com/user/rust-api',
    cloneUrl: 'https://github.com/user/rust-api.git',
    defaultBranch: 'main',
    language: 'Rust',
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    stargazersCount: 156,
    forksCount: 34
  }
]

const getLanguageColor = (language: string) => {
  const colors: { [key: string]: string } = {
    'TypeScript': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'JavaScript': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Python': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Go': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'Rust': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Java': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return colors[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

export function GitHubRepositorySelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  accessToken 
}: GitHubRepositorySelectorProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<RepositoryAnalysis | null>(null)
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      loadRepositories()
    }
  }, [isOpen, accessToken])

  const loadRepositories = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRepositories(mockRepositories)
    } catch (error) {
      console.error('Failed to load repositories:', error)
      toast.error('Failed to load repositories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepoSelect = async (repo: GitHubRepository) => {
    setSelectedRepo(repo)
    setIsAnalyzing(true)
    setAnalysisLogs([])
    setAnalysis(null)

    // Simulate repository analysis
    const analysisSteps = [
      '🔍 Analyzing repository structure...',
      '📦 Checking for Dockerfile...',
      '📋 Reading package.json/requirements.txt...',
      '⚙️ Detecting build configuration...',
      '🌐 Analyzing port configuration...',
      '💾 Estimating resource requirements...',
      '✅ Analysis complete!'
    ]

    for (let i = 0; i < analysisSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600))
      setAnalysisLogs(prev => [...prev, analysisSteps[i]])
    }

    // Generate mock analysis based on repository
    const mockAnalysis: RepositoryAnalysis = {
      hasDockerfile: Math.random() > 0.5,
      dockerfilePath: 'Dockerfile',
      detectedLanguage: repo.language,
      suggestedPort: repo.language === 'Python' ? 8000 : repo.language === 'Go' ? 8080 : 3000,
      suggestedResources: {
        cpu: repo.language === 'Rust' ? '1000m' : repo.language === 'Go' ? '500m' : '250m',
        memory: repo.language === 'Python' ? '1Gi' : repo.language === 'Rust' ? '2Gi' : '512Mi'
      },
      buildCommand: repo.language === 'Python' ? 'pip install -r requirements.txt' : 
                   repo.language === 'Go' ? 'go build -o main .' : 
                   repo.language === 'Rust' ? 'cargo build --release' : 'npm run build',
      startCommand: repo.language === 'Python' ? 'python main.py' : 
                   repo.language === 'Go' ? './main' : 
                   repo.language === 'Rust' ? './target/release/app' : 'npm start',
      environmentVariables: {
        NODE_ENV: 'production',
        PORT: repo.language === 'Python' ? '8000' : repo.language === 'Go' ? '8080' : '3000'
      }
    }

    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
  }

  const handleDeploy = () => {
    if (selectedRepo && analysis) {
      onSelect(selectedRepo, analysis)
      toast.success(`Deploying ${selectedRepo.name}...`)
    }
  }

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <CodeBracketIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Select Repository
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a repository to deploy to VibeCaaS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Repository List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <CodeBracketIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredRepos.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => handleRepoSelect(repo)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRepo?.id === repo.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {repo.name}
                            </h3>
                            {repo.private && (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                Private
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {repo.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <StarIcon className="h-4 w-4" />
                              <span>{repo.stargazersCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CodeBracketIcon className="h-4 w-4" />
                              <span>{repo.forksCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getLanguageColor(repo.language || 'Unknown')}`}>
                            {repo.language || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="w-1/2 flex flex-col">
            {!selectedRepo ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <EyeIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a repository to analyze</p>
                  <p className="text-sm mt-2">Choose from the list to see deployment configuration</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedRepo.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedRepo.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${getLanguageColor(selectedRepo.language || 'Unknown')}`}>
                      {selectedRepo.language || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Stars:</span>
                      <span className="ml-2 font-medium">{selectedRepo.stargazersCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Forks:</span>
                      <span className="ml-2 font-medium">{selectedRepo.forksCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Branch:</span>
                      <span className="ml-2 font-medium">{selectedRepo.defaultBranch}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedRepo.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <ArrowPathIcon className="h-5 w-5 animate-spin text-purple-600" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Analyzing repository...
                        </span>
                      </div>
                      <div className="space-y-2">
                        {analysisLogs.map((log, index) => (
                          <div
                            key={index}
                            className="text-sm font-mono p-2 bg-gray-100 dark:bg-gray-700 rounded"
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Deployment Configuration
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Dockerfile</span>
                            <div className="flex items-center space-x-2">
                              {analysis.hasDockerfile ? (
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="text-sm font-medium">
                                {analysis.hasDockerfile ? 'Found' : 'Not found'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Port</span>
                            <span className="text-sm font-medium">{analysis.suggestedPort}</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-600 dark:text-gray-400">CPU</span>
                            <span className="text-sm font-medium">{analysis.suggestedResources.cpu}</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
                            <span className="text-sm font-medium">{analysis.suggestedResources.memory}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Build Commands
                        </h4>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Build</div>
                            <code className="text-sm font-mono">{analysis.buildCommand}</code>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start</div>
                            <code className="text-sm font-mono">{analysis.startCommand}</code>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Environment Variables
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(analysis.environmentVariables).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                              <span className="text-sm font-mono">{key}</span>
                              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {analysis && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleDeploy}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Deploy {selectedRepo.name}</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}