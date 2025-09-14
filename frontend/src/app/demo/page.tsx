'use client'

import { useState } from 'react'
import { useQuery } from 'react-query'
import { PlusIcon, PlayIcon, StopIcon, TrashIcon, SparklesIcon, RocketLaunchIcon, CodeBracketIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { AppCard } from '@/components/AppCard'
import { CreateAppModal } from '@/components/CreateAppModal'
import { DashboardHeader } from '@/components/DashboardHeader'
import { ResourceUsage } from '@/components/ResourceUsage'
import { AIAssistant } from '@/components/AIAssistant'
import { CodeEditor } from '@/components/CodeEditor'
import { GitHubAuth } from '@/components/GitHubAuth'
import { GitHubRepositorySelector } from '@/components/GitHubRepositorySelector'
import { DeploymentSimulator } from '@/components/DeploymentSimulator'
import { InteractiveTutorial } from '@/components/InteractiveTutorial'
import { LivePreview } from '@/components/LivePreview'
import { demoApiService } from '@/services/demoApi'
import { App } from '@/types/app'
import { AppSuggestion } from '@/services/openaiService'
import { GitHubRepository, RepositoryAnalysis } from '@/types/app'
import { toast } from 'react-hot-toast'

export default function DemoDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [isGitHubAuthOpen, setIsGitHubAuthOpen] = useState(false)
  const [isGitHubRepoSelectorOpen, setIsGitHubRepoSelectorOpen] = useState(false)
  const [isDeploymentSimulatorOpen, setIsDeploymentSimulatorOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false)
  const [previewApp, setPreviewApp] = useState<App | null>(null)
  const [githubAccessToken, setGithubAccessToken] = useState<string>('')
  const [pendingDeployment, setPendingDeployment] = useState<Partial<App> | null>(null)

  const { data: apps, isLoading, refetch } = useQuery<App[]>(
    'apps',
    demoApiService.getApps,
    {
      refetchInterval: 5000, // Refetch every 5 seconds
    }
  )

  const { data: usage } = useQuery(
    'usage',
    demoApiService.getResourceUsage,
    {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  )

  const handleAppAction = async (appId: string, action: 'start' | 'stop' | 'delete') => {
    try {
      switch (action) {
        case 'start':
          await demoApiService.startApp(appId)
          break
        case 'stop':
          await demoApiService.stopApp(appId)
          break
        case 'delete':
          await demoApiService.deleteApp(appId)
          break
      }
      refetch()
    } catch (error) {
      console.error(`Failed to ${action} app:`, error)
    }
  }

  const handleAIDeploy = async (suggestion: AppSuggestion) => {
    // Convert AI suggestion to app format and deploy
    const nowIso = new Date().toISOString()
    const normalizedResources = {
      cpu: typeof suggestion.resources.cpu === 'number' ? suggestion.resources.cpu.toString() : String(suggestion.resources.cpu),
      memory: suggestion.resources.memory,
      gpu: typeof suggestion.resources.gpu === 'number' ? suggestion.resources.gpu.toString() : suggestion.resources.gpu !== undefined ? String(suggestion.resources.gpu) : undefined,
    }

    const newApp: App = {
      id: `ai-${Date.now()}`,
      name: suggestion.name,
      description: suggestion.description,
      image: suggestion.image,
      port: suggestion.port,
      status: 'creating',
      url: undefined,
      resources: normalizedResources,
      createdAt: nowIso,
      updatedAt: nowIso,
      environment: suggestion.environment,
      volumes: [],
    }
    
    // In a real implementation, this would call the API to create the app
    console.log('Deploying AI suggestion:', newApp)
    refetch()
  }

  const handleGitHubAuth = (accessToken: string) => {
    setGithubAccessToken(accessToken)
    setIsGitHubAuthOpen(false)
    setIsGitHubRepoSelectorOpen(true)
  }

  const handleGitHubRepoSelect = (repo: GitHubRepository, analysis: RepositoryAnalysis) => {
    const appData: Partial<App> = {
      name: repo.name,
      description: repo.description || undefined,
      image: analysis.hasDockerfile ? `${repo.name}:latest` : `base-${(repo.language || 'unknown').toLowerCase()}`,
      port: analysis.suggestedPort,
      resources: analysis.suggestedResources,
      environment: analysis.environmentVariables,
    }
    
    setPendingDeployment(appData)
    setIsGitHubRepoSelectorOpen(false)
    setIsDeploymentSimulatorOpen(true)
  }

  const handleDeploymentComplete = (app: App) => {
    // Add the deployed app to the list
    refetch()
    setIsDeploymentSimulatorOpen(false)
    setPendingDeployment(null)
    toast.success(`${app.name} deployed successfully!`)
  }

  const handleCodeDeploy = (code: string, language: string) => {
    const appData: Partial<App> = {
      name: `code-app-${Date.now()}`,
      description: `Application created from ${language} code`,
      image: `base-${language.toLowerCase()}`,
      port: language === 'python' ? 8000 : language === 'go' ? 8080 : 3000,
      resources: {
        cpu: '0.5',
        memory: '512Mi',
        gpu: '0'
      },
      environment: {
        NODE_ENV: 'production',
        PORT: language === 'python' ? '8000' : language === 'go' ? '8080' : '3000'
      }
    }
    
    setPendingDeployment(appData)
    setIsCodeEditorOpen(false)
    setIsDeploymentSimulatorOpen(true)
  }

  const handleTutorialComplete = () => {
    setIsTutorialOpen(false)
    toast.success('Tutorial completed! You\'re ready to start deploying.')
  }

  const handleLivePreview = (app: App) => {
    setPreviewApp(app)
    setIsLivePreviewOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <RocketLaunchIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">VibeCaaS Demo</h1>
                <p className="text-purple-100 text-lg">
                  Experience the future of containerized app deployment with AI-powered assistance
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-purple-100">Platform Online</span>
                  </div>
                  <div className="text-sm text-purple-200">
                    All data is simulated for demo purposes
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-sm text-purple-100 mb-2">AI Assistant</div>
                <div className="text-2xl font-bold mb-1">Ready</div>
                <div className="text-xs text-purple-200">Powered by GPT-4</div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Usage Overview */}
        {usage && <ResourceUsage usage={usage} />}

        {/* Apps Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Applications
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your containerized applications with AI-powered deployment
              </p>
            </div>
            <div className="flex items-center space-x-3 flex-wrap">
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <BookOpenIcon className="h-4 w-4" />
                Tutorial
              </button>
              <button
                onClick={() => setIsCodeEditorOpen(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <CodeBracketIcon className="h-4 w-4" />
                Code Editor
              </button>
              <button
                onClick={() => setIsGitHubAuthOpen(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <CodeBracketIcon className="h-4 w-4" />
                Deploy from GitHub
              </button>
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <SparklesIcon className="h-4 w-4" />
                AI Assistant
              </button>
              <button
                onClick={() => {
                  try {
                    setIsCreateModalOpen(true)
                  } catch (error) {
                    console.error('Error opening Create App modal:', error)
                    toast.error('Failed to open Create App modal. Please try again.')
                  }
                }}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Create New App
              </button>
            </div>
          </div>

          {/* Apps Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="card-body">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : apps && apps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onAction={handleAppAction}
                  onPreview={handleLivePreview}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No applications yet
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Get started by creating your first containerized application.
              </p>
              <button
                onClick={() => {
                  try {
                    setIsCreateModalOpen(true)
                  } catch (error) {
                    console.error('Error opening Create App modal:', error)
                    toast.error('Failed to open Create App modal. Please try again.')
                  }
                }}
                className="mt-4 btn-primary"
              >
                Create Your First App
              </button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="mx-auto h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  AI-Powered Deployment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get intelligent app deployment suggestions powered by OpenAI GPT-4.
                </p>
              </div>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Container Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Deploy and manage containerized applications with ease using Docker and Kubernetes.
                </p>
              </div>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Resource Monitoring
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Real-time monitoring of CPU, memory, GPU, and storage usage across all applications.
                </p>
              </div>
            </div>

            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="mx-auto h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Auto-scaling
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Automatic scaling based on resource usage and traffic patterns for optimal performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Deploy with AI?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Let our AI assistant help you create the perfect deployment configuration. 
              Just describe your application and get intelligent suggestions for optimal performance.
            </p>
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg"
            >
              <SparklesIcon className="h-6 w-6" />
              Try AI Assistant
            </button>
          </div>
        </div>
      </main>

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          refetch()
        }}
      />

      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onDeploy={handleAIDeploy}
      />

      <CodeEditor
        isOpen={isCodeEditorOpen}
        onClose={() => setIsCodeEditorOpen(false)}
        onDeploy={handleCodeDeploy}
      />

      <GitHubAuth
        isOpen={isGitHubAuthOpen}
        onClose={() => setIsGitHubAuthOpen(false)}
        onAuthenticated={handleGitHubAuth}
      />

      <GitHubRepositorySelector
        isOpen={isGitHubRepoSelectorOpen}
        onClose={() => setIsGitHubRepoSelectorOpen(false)}
        onSelect={handleGitHubRepoSelect}
        accessToken={githubAccessToken}
      />

      <DeploymentSimulator
        isOpen={isDeploymentSimulatorOpen}
        onClose={() => setIsDeploymentSimulatorOpen(false)}
        app={pendingDeployment || {}}
        onComplete={handleDeploymentComplete}
      />

      <InteractiveTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onComplete={handleTutorialComplete}
      />

      <LivePreview
        isOpen={isLivePreviewOpen}
        onClose={() => setIsLivePreviewOpen(false)}
        app={previewApp || { name: '', port: 3000, status: 'stopped' }}
      />

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/VibeCaaS.png" alt="VibeCaaS Logo" className="h-8 w-auto" />
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-right">
            © 2025 VibeCaaS.com, a division of NeuralQuantum.ai LLC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}