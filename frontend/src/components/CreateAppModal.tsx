'use client'

import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon, CodeBracketIcon, CloudIcon } from '@heroicons/react/24/outline'
import { demoApiService } from '@/services/demoApi'
import { githubApiService } from '@/services/githubApi'
import { CreateAppRequest, GitHubRepository, RepositoryAnalysis } from '@/types/app'
import { toast } from 'react-hot-toast'
import { GitHubAuth } from './GitHubAuth'
import { GitHubRepositorySelector } from './GitHubRepositorySelector'


interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const templates = [
  {
    id: 'react',
    name: 'React App',
    description: 'Create React application with TypeScript',
    image: 'node:18-alpine',
    port: 3000,
    resources: { cpu: '500m', memory: '512Mi' },
    environment: { NODE_ENV: 'production' } as Record<string, string>
  },
  {
    id: 'nextjs',
    name: 'Next.js App',
    description: 'Create Next.js application with TypeScript',
    image: 'node:18-alpine',
    port: 3000,
    resources: { cpu: '500m', memory: '512Mi' },
    environment: { NODE_ENV: 'production' } as Record<string, string>
  },
  {
    id: 'python',
    name: 'Python Flask',
    description: 'Create Python Flask web application',
    image: 'python:3.11-slim',
    port: 5000,
    resources: { cpu: '500m', memory: '512Mi' },
    environment: { FLASK_ENV: 'production' } as Record<string, string>
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    description: 'Create FastAPI Python application',
    image: 'python:3.11-slim',
    port: 8000,
    resources: { cpu: '500m', memory: '512Mi' },
    environment: { PYTHONPATH: '/app' } as Record<string, string>
  },
  {
    id: 'golang',
    name: 'Go Web Server',
    description: 'Create Go web server application',
    image: 'golang:1.21-alpine',
    port: 8080,
    resources: { cpu: '500m', memory: '512Mi' },
    environment: { CGO_ENABLED: '0' } as Record<string, string>
  },
  {
    id: 'rust',
    name: 'Rust Web Server',
    description: 'Create Rust web server with Actix',
    image: 'rust:1.75-alpine',
    port: 8080,
    resources: { cpu: '500m', memory: '512Mi' },
    environment: { RUST_LOG: 'info' } as Record<string, string>
  }
]

export function CreateAppModal({ isOpen, onClose, onSuccess }: CreateAppModalProps) {
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [deploymentType, setDeploymentType] = useState<'template' | 'github'>('template')
  const [formData, setFormData] = useState<CreateAppRequest>({
    name: '',
    description: '',
    image: '',
    port: 3000,
    resources: {
      cpu: '500m',
      memory: '512Mi'
    },
    environment: {},
    volumes: []
  })
  const [isLoading, setIsLoading] = useState(false)
  
  // GitHub integration state
  const [githubAccessToken, setGithubAccessToken] = useState<string | null>(null)
  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null)
  const [repositoryAnalysis, setRepositoryAnalysis] = useState<RepositoryAnalysis | null>(null)
  const [showGitHubAuth, setShowGitHubAuth] = useState(false)
  const [showRepositorySelector, setShowRepositorySelector] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setFormData({
        ...formData,
        image: template.image,
        port: template.port,
        resources: template.resources,
        environment: template.environment
      })
    }
  }

  const handleGitHubAuthenticated = (accessToken: string) => {
    setGithubAccessToken(accessToken)
    setShowGitHubAuth(false)
    setShowRepositorySelector(true)
  }

  const handleRepositorySelected = async (repository: GitHubRepository, analysis: RepositoryAnalysis) => {
    setSelectedRepository(repository)
    setShowRepositorySelector(false)
    
    // Analyze the repository
    if (githubAccessToken) {
      setIsAnalyzing(true)
      try {
        const analysis = await githubApiService.analyzeRepository(
          githubAccessToken,
          repository.fullName.split('/')[0],
          repository.fullName.split('/')[1],
          repository.defaultBranch
        )
        setRepositoryAnalysis(analysis)
        
        // Auto-populate form data based on analysis
        setFormData({
          name: repository.name,
          description: repository.description || '',
          image: analysis.hasDockerfile ? `ghcr.io/${repository.fullName}:latest` : getDefaultImage(analysis.detectedLanguage),
          port: analysis.suggestedPort,
          resources: analysis.suggestedResources,
          environment: analysis.environmentVariables,
          volumes: []
        })
        
        toast.success('Repository analyzed successfully!')
      } catch (error) {
        console.error('Repository analysis failed:', error)
        toast.error('Failed to analyze repository')
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const getDefaultImage = (language: string | null): string => {
    switch (language) {
      case 'JavaScript':
      case 'TypeScript':
        return 'node:18-alpine'
      case 'Python':
        return 'python:3.11-slim'
      case 'Go':
        return 'golang:1.21-alpine'
      case 'Rust':
        return 'rust:1.75-alpine'
      default:
        return 'node:18-alpine'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await demoApiService.createApp(formData)
      toast.success('Application created successfully!')
      onSuccess()
      resetForm()
    } catch (error) {
      toast.error('Failed to create application. Please try again.')
      console.error('Create app error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedTemplate(null)
    setDeploymentType('template')
    setFormData({
      name: '',
      description: '',
      image: '',
      port: 3000,
      resources: {
        cpu: '500m',
        memory: '512Mi'
      },
      environment: {},
      volumes: []
    })
    setGithubAccessToken(null)
    setSelectedRepository(null)
    setRepositoryAnalysis(null)
    setShowGitHubAuth(false)
    setShowRepositorySelector(false)
    setIsAnalyzing(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create New Application
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center mb-8">
                  <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      1
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {deploymentType === 'github' ? 'Repository' : 'Template'}
                    </span>
                  </div>
                  <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      2
                    </div>
                    <span className="ml-2 text-sm font-medium">Configuration</span>
                  </div>
                </div>

                {step === 1 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                      Choose deployment method
                    </h4>
                    
                    {/* Deployment Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div
                        onClick={() => setDeploymentType('template')}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          deploymentType === 'template'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <CloudIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            Use Template
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Start with a pre-configured template for common application types
                        </p>
                      </div>
                      
                      <div
                        onClick={() => setDeploymentType('github')}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          deploymentType === 'github'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <CodeBracketIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            Deploy from GitHub
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Deploy directly from your GitHub repository with automatic configuration
                        </p>
                      </div>
                    </div>

                    {/* Template Selection */}
                    {deploymentType === 'template' && (
                      <>
                        <h5 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                          Choose a template
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {templates.map((template) => (
                            <div
                              key={template.id}
                              onClick={() => handleTemplateSelect(template.id)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedTemplate === template.id
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <h6 className="font-medium text-gray-900 dark:text-white">
                                {template.name}
                              </h6>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {template.description}
                              </p>
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Port: {template.port} • {template.resources.cpu} CPU • {template.resources.memory} RAM
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* GitHub Repository Selection */}
                    {deploymentType === 'github' && (
                      <div className="space-y-4">
                        {!githubAccessToken ? (
                          <div className="text-center py-8">
                            <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              Connect to GitHub
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Authenticate with GitHub to access your repositories
                            </p>
                            <button
                              onClick={() => setShowGitHubAuth(true)}
                              className="btn-primary"
                            >
                              Connect GitHub Account
                            </button>
                          </div>
                        ) : selectedRepository ? (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <CodeBracketIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <h5 className="font-medium text-green-900 dark:text-green-100">
                                {selectedRepository.name}
                              </h5>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                              {selectedRepository.description}
                            </p>
                            {repositoryAnalysis && (
                              <div className="text-xs text-green-600 dark:text-green-400">
                                {repositoryAnalysis.detectedLanguage && (
                                  <span className="mr-3">Language: {repositoryAnalysis.detectedLanguage}</span>
                                )}
                                {repositoryAnalysis.hasDockerfile && (
                                  <span className="mr-3">✓ Dockerfile detected</span>
                                )}
                                <span>Port: {repositoryAnalysis.suggestedPort}</span>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setSelectedRepository(null)
                                setRepositoryAnalysis(null)
                                setShowRepositorySelector(true)
                              }}
                              className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline"
                            >
                              Choose different repository
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">
                              {isAnalyzing ? 'Analyzing repository...' : 'Loading repositories...'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => setStep(2)}
                        disabled={
                          (deploymentType === 'template' && !selectedTemplate) ||
                          (deploymentType === 'github' && !selectedRepository)
                        }
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next: Configuration
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmit}>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Configure your application
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Application Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="my-awesome-app"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Port
                        </label>
                        <input
                          type="number"
                          value={formData.port}
                          onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Brief description of your application"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Docker Image
                        </label>
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="node:18-alpine"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CPU Resources
                        </label>
                        <select
                          value={formData.resources.cpu}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            resources: { ...formData.resources, cpu: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="100m">100m (0.1 CPU)</option>
                          <option value="250m">250m (0.25 CPU)</option>
                          <option value="500m">500m (0.5 CPU)</option>
                          <option value="1000m">1000m (1 CPU)</option>
                          <option value="2000m">2000m (2 CPU)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Memory Resources
                        </label>
                        <select
                          value={formData.resources.memory}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            resources: { ...formData.resources, memory: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="128Mi">128 MiB</option>
                          <option value="256Mi">256 MiB</option>
                          <option value="512Mi">512 MiB</option>
                          <option value="1Gi">1 GiB</option>
                          <option value="2Gi">2 GiB</option>
                          <option value="4Gi">4 GiB</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !formData.name || !formData.image}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Creating...' : 'Create Application'}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>

      {/* GitHub Authentication Modal */}
      <Transition appear show={showGitHubAuth} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowGitHubAuth(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <GitHubAuth
                    isOpen={showGitHubAuth}
                    onAuthenticated={handleGitHubAuthenticated}
                    onClose={() => setShowGitHubAuth(false)}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* GitHub Repository Selector Modal */}
      <Transition appear show={showRepositorySelector} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowRepositorySelector(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <GitHubRepositorySelector
                    isOpen={showRepositorySelector}
                    accessToken={githubAccessToken!}
                    onSelect={handleRepositorySelected}
                    onClose={() => setShowRepositorySelector(false)}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Transition>
  )
}