'use client'

import { useState, useEffect } from 'react'
import { 
  PlayIcon, 
  StopIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClockIcon,
  ServerIcon,
  CloudIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { App } from '@/types/app'

interface DeploymentSimulatorProps {
  isOpen: boolean
  onClose: () => void
  app: Partial<App>
  onComplete: (app: App) => void
}

interface DeploymentStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration: number
  logs: string[]
}

const deploymentSteps: Omit<DeploymentStep, 'status' | 'logs'>[] = [
  { id: 'validate', name: 'Validating Configuration', duration: 2000 },
  { id: 'clone', name: 'Cloning Repository', duration: 3000 },
  { id: 'build', name: 'Building Container Image', duration: 8000 },
  { id: 'test', name: 'Running Tests', duration: 4000 },
  { id: 'push', name: 'Pushing to Registry', duration: 2000 },
  { id: 'deploy', name: 'Deploying to Kubernetes', duration: 5000 },
  { id: 'service', name: 'Creating Service', duration: 2000 },
  { id: 'ingress', name: 'Configuring Ingress', duration: 3000 },
  { id: 'health', name: 'Health Check', duration: 2000 },
  { id: 'complete', name: 'Deployment Complete', duration: 1000 }
]

const generateLogs = (stepId: string, app: Partial<App>): string[] => {
  const logs: { [key: string]: string[] } = {
    validate: [
      '✓ Validating application configuration',
      '✓ Checking resource requirements',
      '✓ Verifying environment variables',
      '✓ Validating port configuration'
    ],
    clone: [
      '📦 Cloning repository...',
      '✓ Repository cloned successfully',
      '📋 Analyzing project structure',
      '🔍 Detecting build configuration'
    ],
    build: [
      '🐳 Building Docker image...',
      '📦 Installing dependencies...',
      '⚙️ Compiling application...',
      '🔧 Optimizing build artifacts...',
      '✓ Container image built successfully',
      `📏 Image size: ${Math.floor(Math.random() * 500) + 200}MB`
    ],
    test: [
      '🧪 Running test suite...',
      '✓ Unit tests passed (12/12)',
      '✓ Integration tests passed (5/5)',
      '✓ Security scan completed',
      '✓ Performance tests passed'
    ],
    push: [
      '📤 Pushing to container registry...',
      '✓ Image pushed successfully',
      '🏷️ Tagged as latest',
      '🔐 Image signed and verified'
    ],
    deploy: [
      '🚀 Deploying to Kubernetes cluster...',
      '📋 Creating deployment manifest',
      '⚙️ Configuring resource limits',
      '🌐 Creating pods...',
      '✓ Pods created successfully',
      '⏳ Waiting for pods to be ready...'
    ],
    service: [
      '🔗 Creating Kubernetes service...',
      '📡 Configuring service endpoints',
      '🔒 Setting up network policies',
      '✓ Service created successfully'
    ],
    ingress: [
      '🌐 Configuring ingress controller...',
      '🔐 Setting up SSL certificates',
      '📋 Creating routing rules',
      '✓ Ingress configured successfully'
    ],
    health: [
      '🏥 Running health checks...',
      '✓ Application is responding',
      '📊 Checking resource usage',
      '✅ Health check passed'
    ],
    complete: [
      '🎉 Deployment completed successfully!',
      `🌐 Application available at: https://${app.name?.toLowerCase().replace(/\s+/g, '-')}.vibecaas.com`,
      '📊 Monitoring enabled',
      '🔔 Notifications sent'
    ]
  }
  
  return logs[stepId] || ['Processing...']
}

export function DeploymentSimulator({ 
  isOpen, 
  onClose, 
  app, 
  onComplete 
}: DeploymentSimulatorProps) {
  const [steps, setSteps] = useState<DeploymentStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (isOpen) {
      initializeSteps()
    }
  }, [isOpen])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isDeploying && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isDeploying, isPaused, startTime])

  const initializeSteps = () => {
    const initializedSteps = deploymentSteps.map(step => ({
      ...step,
      status: 'pending' as const,
      logs: []
    }))
    setSteps(initializedSteps)
    setCurrentStepIndex(0)
    setDeploymentLogs([])
    setElapsedTime(0)
  }

  const startDeployment = async () => {
    setIsDeploying(true)
    setStartTime(Date.now())
    setCurrentStepIndex(0)
    setDeploymentLogs([])

    for (let i = 0; i < deploymentSteps.length; i++) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPaused = setInterval(() => {
            if (!isPaused) {
              clearInterval(checkPaused)
              resolve(void 0)
            }
          }, 100)
        })
      }

      // Update current step to running
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'running' }
          : step
      ))

      // Generate logs for this step
      const stepLogs = generateLogs(deploymentSteps[i].id, app)
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, logs: stepLogs }
          : step
      ))

      // Add logs to deployment logs
      setDeploymentLogs(prev => [...prev, ...stepLogs])

      // Simulate step duration
      await new Promise(resolve => setTimeout(resolve, deploymentSteps[i].duration))

      // Mark step as completed
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'completed' }
          : step
      ))

      setCurrentStepIndex(i + 1)
    }

    // Create the deployed app
    const deployedApp: App = {
      id: Date.now().toString(),
      name: app.name || 'Deployed App',
      description: app.description || 'Application deployed from GitHub',
      image: app.image || 'node:18-alpine',
      port: app.port || 3000,
      status: 'running',
      url: `https://${(app.name || 'deployed-app').toLowerCase().replace(/\s+/g, '-')}.vibecaas.com`,
      resources: app.resources || { cpu: '0.5', memory: '512Mi', gpu: '0' },
      environment: app.environment || {},
      volumes: app.volumes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setIsDeploying(false)
    onComplete(deployedApp)
  }

  const pauseDeployment = () => {
    setIsPaused(true)
  }

  const resumeDeployment = () => {
    setIsPaused(false)
  }

  const stopDeployment = () => {
    setIsDeploying(false)
    setIsPaused(false)
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))
    setCurrentStepIndex(0)
    setDeploymentLogs([])
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ServerIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Deploying {app.name || 'Application'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Deploying your application to VibeCaaS infrastructure
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatTime(elapsedTime)}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Steps Panel */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Deployment Steps</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border transition-all ${
                      step.status === 'completed'
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : step.status === 'running'
                        ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20'
                        : step.status === 'failed'
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {step.status === 'completed' ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : step.status === 'running' ? (
                          <ArrowPathIcon className="h-5 w-5 text-purple-500 animate-spin" />
                        ) : step.status === 'failed' ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {step.name}
                        </div>
                        {step.logs.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {step.logs.slice(0, 2).map((log, logIndex) => (
                              <div key={logIndex} className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                {log}
                              </div>
                            ))}
                            {step.logs.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                +{step.logs.length - 2} more...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logs Panel */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Deployment Logs</h3>
                <div className="flex items-center space-x-2">
                  {isDeploying && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {deploymentLogs.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <CloudIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Deployment logs will appear here</p>
                    <p className="text-sm mt-2">Click "Start Deployment" to begin</p>
                  </div>
                ) : (
                  deploymentLogs.map((log, index) => (
                    <div
                      key={index}
                      className="text-sm font-mono p-2 bg-gray-100 dark:bg-gray-700 rounded"
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {!isDeploying ? (
                <button
                  onClick={startDeployment}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>Start Deployment</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  {isPaused ? (
                    <button
                      onClick={resumeDeployment}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <PlayIcon className="h-4 w-4" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseDeployment}
                      className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                    >
                      <StopIcon className="h-4 w-4" />
                      <span>Pause</span>
                    </button>
                  )}
                  <button
                    onClick={stopDeployment}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <StopIcon className="h-4 w-4" />
                    <span>Stop</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}