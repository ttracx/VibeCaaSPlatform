'use client'

import { useState } from 'react'
import { CodeBracketIcon } from '@heroicons/react/24/outline'
import { githubApiService } from '@/services/githubApi'
import { toast } from 'react-hot-toast'

interface GitHubAuthProps {
  isOpen: boolean
  onAuthenticated: (accessToken: string) => void
  onClose: () => void
}

export function GitHubAuth({ isOpen, onAuthenticated, onClose }: GitHubAuthProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'auth' | 'callback'>('auth')
  const [authUrl, setAuthUrl] = useState<string>('')

  const handleGitHubAuth = async () => {
    try {
      setIsLoading(true)
      const { authUrl } = await githubApiService.getAuthUrl()
      setAuthUrl(authUrl)
      setStep('callback')
      
      // Open GitHub OAuth in a popup window
      const popup = window.open(
        authUrl,
        'github-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      // Listen for the popup to close or receive a message
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setIsLoading(false)
          setStep('auth')
        }
      }, 1000)

      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
          clearInterval(checkClosed)
          popup?.close()
          window.removeEventListener('message', messageHandler)
          onAuthenticated(event.data.accessToken)
          toast.success('Successfully authenticated with GitHub!')
        } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
          clearInterval(checkClosed)
          popup?.close()
          window.removeEventListener('message', messageHandler)
          toast.error('GitHub authentication failed')
          setIsLoading(false)
          setStep('auth')
        }
      }

      window.addEventListener('message', messageHandler)
    } catch (error) {
      console.error('GitHub auth error:', error)
      toast.error('Failed to initiate GitHub authentication')
      setIsLoading(false)
    }
  }

  const handleManualCallback = async (code: string) => {
    try {
      setIsLoading(true)
      const { accessToken } = await githubApiService.exchangeCodeForToken(code)
      onAuthenticated(accessToken)
      toast.success('Successfully authenticated with GitHub!')
    } catch (error) {
      console.error('GitHub callback error:', error)
      toast.error('Failed to authenticate with GitHub')
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <CodeBracketIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Connect to GitHub
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Authenticate with GitHub to access your repositories and deploy applications directly from your code.
        </p>
      </div>

      {step === 'auth' && (
        <div className="space-y-4">
          <button
            onClick={handleGitHubAuth}
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CodeBracketIcon className="h-5 w-5" />
            {isLoading ? 'Connecting...' : 'Connect with GitHub'}
          </button>
          
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'callback' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Manual Authentication
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              If the popup didn't work, you can manually complete the authentication:
            </p>
            <div className="space-y-2">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                1. Click the link below to open GitHub
              </p>
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {authUrl}
              </a>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                2. Authorize the application and copy the code from the URL
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                3. Paste the code below and click "Complete Authentication"
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Authorization Code
            </label>
            <input
              type="text"
              placeholder="Paste the code from GitHub here"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const code = e.currentTarget.value.trim()
                  if (code) {
                    handleManualCallback(code)
                  }
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('auth')}
              className="flex-1 btn-secondary text-sm"
            >
              Back
            </button>
            <button
              onClick={onClose}
              className="flex-1 btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  )
}