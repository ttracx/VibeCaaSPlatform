'use client'

import { useState, useEffect } from 'react'
import { 
  PlayIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon,
  SparklesIcon,
  CodeBracketIcon,
  ServerIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface TutorialStep {
  id: string
  title: string
  description: string
  content: React.ReactNode
  action?: {
    text: string
    onClick: () => void
  }
}

interface InteractiveTutorialProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function InteractiveTutorial({ isOpen, onClose, onComplete }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)

  const steps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to VibeCaaS!',
      description: 'Let\'s explore the platform together',
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <SparklesIcon className="h-10 w-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to VibeCaaS!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This interactive tutorial will guide you through the key features of our container platform.
              You'll learn how to deploy applications, manage resources, and use AI assistance.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              💡 <strong>Tip:</strong> You can skip this tutorial anytime by clicking the "Skip Tutorial" button.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Understanding the main interface',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Key Areas</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm">Resource Monitoring</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">CPU, Memory, GPU usage</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <ServerIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">Application Grid</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Your deployed apps</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <SparklesIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">AI Assistant</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Smart deployment help</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
              <div className="space-y-2">
                <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="font-medium text-sm">Create New App</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Deploy from templates or GitHub</div>
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="font-medium text-sm">AI Assistant</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Get deployment suggestions</div>
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="font-medium text-sm">Live Code Editor</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Edit and test code</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'deployment',
      title: 'Deploying Applications',
      description: 'Learn how to deploy your first app',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Deployment Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <CodeBracketIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">From GitHub</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect your GitHub account and deploy directly from your repositories
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Cog6ToothIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium">From Templates</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose from pre-built templates for popular frameworks
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Deployment Process</h4>
            <div className="space-y-3">
              {[
                'Select your source (GitHub or template)',
                'Configure application settings',
                'Set resource requirements',
                'Deploy with one click',
                'Monitor deployment progress',
                'Access your running application'
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-assistant',
      title: 'AI-Powered Assistance',
      description: 'Discover the power of AI in deployment',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Assistant Features
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI assistant helps you deploy applications with natural language descriptions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 dark:text-white">What you can ask:</h5>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    "Deploy a React app with TypeScript"
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    "Create a Python API with FastAPI"
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    "Deploy a Go microservice with 2GB RAM"
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 dark:text-white">AI will help with:</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Resource optimization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Port configuration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Environment variables</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Docker configuration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'monitoring',
      title: 'Resource Monitoring',
      description: 'Track your application performance',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Real-time Monitoring
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor CPU, memory, GPU, and storage usage across all your applications
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'CPU Usage', value: '45%', color: 'text-blue-600' },
              { name: 'Memory', value: '2.1GB', color: 'text-green-600' },
              { name: 'GPU', value: '1/2', color: 'text-purple-600' },
              { name: 'Storage', value: '15GB', color: 'text-orange-600' }
            ].map((metric, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</div>
              </div>
            ))}
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-yellow-600 dark:text-yellow-400">💡</div>
              <div>
                <div className="font-medium text-yellow-800 dark:text-yellow-200">Pro Tip</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Set up alerts to get notified when resource usage exceeds your thresholds
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'code-editor',
      title: 'Live Code Editor',
      description: 'Edit and test your code in real-time',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4">
              <CodeBracketIcon className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Live Code Editor
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Write, edit, and test your code with our integrated Monaco editor
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 dark:text-white">Supported Languages:</h5>
              <div className="space-y-2">
                {['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java'].map((lang, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 dark:text-white">Features:</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Syntax highlighting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Auto-completion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Error detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Live deployment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Ready to start deploying applications',
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <CheckCircleIcon className="h-10 w-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You've completed the VibeCaaS tutorial. You now know how to:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Deploy applications from GitHub',
              'Use AI assistant for smart deployment',
              'Monitor resource usage',
              'Edit code with live editor',
              'Manage multiple applications',
              'Scale resources automatically'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Ready to get started?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Click "Start Deploying" to create your first application, or explore the platform at your own pace.
            </p>
          </div>
        </div>
      ),
      action: {
        text: 'Start Deploying',
        onClick: () => {
          onComplete()
          onClose()
        }
      }
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set(Array.from(prev).concat([currentStep])))
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete()
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const currentStepData = steps[currentStep]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Interactive Tutorial
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {currentStepData.description}
            </p>
            <div className="space-y-4">
              {currentStepData.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep
                    ? 'bg-purple-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Skip Tutorial
            </button>
            
            <div className="flex items-center space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
              
              <button
                onClick={currentStepData.action?.onClick || handleNext}
                className="btn-primary flex items-center space-x-2"
              >
                <span>{currentStepData.action?.text || (currentStep === steps.length - 1 ? 'Complete' : 'Next')}</span>
                {!currentStepData.action && (
                  <ArrowRightIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}