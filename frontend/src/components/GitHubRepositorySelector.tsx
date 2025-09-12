'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, CodeBracketIcon, StarIcon } from '@heroicons/react/24/outline'
import { githubApiService } from '@/services/githubApi'
import { GitHubRepository } from '@/types/app'
import { toast } from 'react-hot-toast'

interface GitHubRepositorySelectorProps {
  accessToken: string
  onRepositorySelect: (repository: GitHubRepository) => void
  onClose: () => void
}

export function GitHubRepositorySelector({ 
  accessToken, 
  onRepositorySelect, 
  onClose 
}: GitHubRepositorySelectorProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepository[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null)

  useEffect(() => {
    loadRepositories()
  }, [accessToken])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRepos(filtered)
    } else {
      setFilteredRepos(repositories)
    }
  }, [searchQuery, repositories])

  const loadRepositories = async () => {
    try {
      setIsLoading(true)
      const repos = await githubApiService.getRepositories(accessToken)
      setRepositories(repos)
      setFilteredRepos(repos)
    } catch (error) {
      console.error('Failed to load repositories:', error)
      toast.error('Failed to load repositories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepositorySelect = (repository: GitHubRepository) => {
    setSelectedRepo(repository)
  }

  const handleConfirmSelection = () => {
    if (selectedRepo) {
      onRepositorySelect(selectedRepo)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
          <CodeBracketIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Select Repository
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose a repository to deploy from your GitHub account
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
        />
      </div>

      {/* Repository List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-8">
            <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No repositories found matching your search' : 'No repositories found'}
            </p>
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => handleRepositorySelect(repo)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedRepo?.id === repo.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {repo.name}
                    </h4>
                    {repo.private && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        Private
                      </span>
                    )}
                  </div>
                  
                  {repo.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <StarIcon className="h-3 w-3" />
                      {repo.stargazersCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {repo.forksCount}
                    </span>
                    <span>Updated {formatDate(repo.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="flex-1 btn-secondary text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmSelection}
          disabled={!selectedRepo}
          className="flex-1 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Select Repository
        </button>
      </div>
    </div>
  )
}