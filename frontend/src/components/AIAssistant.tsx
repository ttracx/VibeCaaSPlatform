'use client'

import { useState } from 'react'
import { 
  SparklesIcon, 
  XMarkIcon, 
  ArrowRightIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ServerIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { OpenAIService, AppSuggestion, DeploymentRequest } from '@/services/openaiService'
import { motion, AnimatePresence } from 'framer-motion'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  onDeploy: (suggestion: AppSuggestion) => void
}

export function AIAssistant({ isOpen, onClose, onDeploy }: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AppSuggestion[]>([])
  const [request, setRequest] = useState<DeploymentRequest>({
    description: '',
    requirements: [],
    preferredLanguage: '',
    framework: '',
    database: ''
  })

  const handleGenerateSuggestions = async () => {
    if (!request.description.trim()) return

    setIsLoading(true)
    try {
      const newSuggestions = await OpenAIService.generateAppSuggestions(request)
      setSuggestions(newSuggestions)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeploySuggestion = (suggestion: AppSuggestion) => {
    onDeploy(suggestion)
    onClose()
  }

  const addRequirement = () => {
    setRequest(prev => ({
      ...prev,
      requirements: [...(prev.requirements || []), '']
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    setRequest(prev => ({
      ...prev,
      requirements: prev.requirements?.map((req, i) => i === index ? value : req) || []
    }))
  }

  const removeRequirement = (index: number) => {
    setRequest(prev => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI App Deployment Assistant</h2>
                      <p className="text-purple-100 text-sm">Powered by OpenAI GPT-4</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {suggestions.length === 0 ? (
                  /* Configuration Form */
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Describe your application
                      </label>
                      <textarea
                        value={request.description}
                        onChange={(e) => setRequest(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., A React dashboard for monitoring server metrics with real-time updates..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Preferred Language
                        </label>
                        <select
                          value={request.preferredLanguage}
                          onChange={(e) => setRequest(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Select language</option>
                          <option value="javascript">JavaScript/TypeScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="go">Go</option>
                          <option value="rust">Rust</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Framework
                        </label>
                        <input
                          type="text"
                          value={request.framework}
                          onChange={(e) => setRequest(prev => ({ ...prev, framework: e.target.value }))}
                          placeholder="e.g., React, Express, Flask, Spring Boot"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Database
                      </label>
                      <select
                        value={request.database}
                        onChange={(e) => setRequest(prev => ({ ...prev, database: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">No database</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                        <option value="mongodb">MongoDB</option>
                        <option value="redis">Redis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Requirements
                      </label>
                      <div className="space-y-2">
                        {request.requirements?.map((req, index) => (
                          <div key={index} className="flex space-x-2">
                            <input
                              type="text"
                              value={req}
                              onChange={(e) => updateRequirement(index, e.target.value)}
                              placeholder="e.g., Authentication, Real-time updates, File upload"
                              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            <button
                              onClick={() => removeRequirement(index)}
                              className="px-3 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addRequirement}
                          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
                        >
                          + Add requirement
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateSuggestions}
                      disabled={!request.description.trim() || isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Generating suggestions...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-5 w-5" />
                          <span>Generate AI Suggestions</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Suggestions Display */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        AI-Generated Deployment Suggestions
                      </h3>
                      <button
                        onClick={() => setSuggestions([])}
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
                      >
                        ← Back to configuration
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {suggestion.name}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {suggestion.description}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeploySuggestion(suggestion)}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
                            >
                              <span>Deploy</span>
                              <ArrowRightIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <ServerIcon className="h-4 w-4" />
                              <span>{suggestion.image}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <CodeBracketIcon className="h-4 w-4" />
                              <span>Port {suggestion.port}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <CpuChipIcon className="h-4 w-4" />
                              <span>{suggestion.resources.cpu} CPU, {suggestion.resources.memory} RAM</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              AI Reasoning:
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {suggestion.reasoning}
                            </p>
                          </div>

                          {suggestion.dockerfile && (
                            <details className="mt-4">
                              <summary className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                                View Dockerfile
                              </summary>
                              <pre className="mt-2 bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                                {suggestion.dockerfile}
                              </pre>
                            </details>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}