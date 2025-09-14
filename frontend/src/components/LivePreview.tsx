'use client'

import { useState, useEffect } from 'react'
import { 
  EyeIcon, 
  ArrowTopRightOnSquareIcon, 
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface LivePreviewProps {
  isOpen: boolean
  onClose: () => void
  app: {
    name: string
    url?: string
    port: number
    status: string
  }
}

export function LivePreview({ isOpen, onClose, app }: LivePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setHasError(false)
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false)
        // Simulate occasional errors for demo purposes
        if (Math.random() < 0.1) {
          setHasError(true)
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, refreshKey])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setIsLoading(true)
    setHasError(false)
  }

  const handleOpenInNewTab = () => {
    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Live Preview: {app.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {app.url || `http://localhost:${app.port}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            {app.url && (
              <button
                onClick={handleOpenInNewTab}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading application preview...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  This may take a few moments
                </p>
              </div>
            </div>
          ) : hasError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Failed to load application preview
                </p>
                <button
                  onClick={handleRefresh}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {/* Simulated Application Preview */}
              <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="h-full flex items-center justify-center p-8">
                  <div className="max-w-2xl w-full">
                    {/* Simulated App Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                          🚀 {app.name}
                        </h1>
                        <p className="text-blue-100">
                          Your application is running successfully!
                        </p>
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Application Status: <strong className="text-green-600">Running</strong>
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Port: <strong>{app.port}</strong>
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              Health Check: <strong className="text-green-600">Passed</strong>
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Demo Application Features
                          </h3>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p>• Real-time status monitoring</p>
                            <p>• Automatic health checks</p>
                            <p>• Resource usage tracking</p>
                            <p>• Log aggregation and analysis</p>
                            <p>• Auto-scaling capabilities</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">99.9%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">45ms</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Response Time</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">1.2k</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Requests/min</div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <button
                            onClick={handleOpenInNewTab}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                            <span>Open in New Tab</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Status: {app.status}</span>
              <span>•</span>
              <span>Port: {app.port}</span>
              {app.url && (
                <>
                  <span>•</span>
                  <span>URL: {app.url}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}