'use client'

import { useState } from 'react'
import { 
  PlayIcon, 
  StopIcon, 
  TrashIcon, 
  Cog6ToothIcon,
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { App } from '@/types/app'
import { formatDistanceToNow } from 'date-fns'

interface AppCardProps {
  app: App
  onAction: (appId: string, action: 'start' | 'stop' | 'delete') => void
}

export function AppCard({ app, onAction }: AppCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: 'start' | 'stop' | 'delete') => {
    setIsLoading(true)
    try {
      await onAction(app.id, action)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: App['status']) => {
    switch (status) {
      case 'running':
        return 'status-running'
      case 'creating':
      case 'building':
        return 'status-creating'
      case 'stopped':
        return 'status-stopped'
      case 'terminated':
        return 'status-terminated'
      default:
        return 'status-stopped'
    }
  }

  const getStatusIcon = (status: App['status']) => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      case 'creating':
      case 'building':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
      case 'stopped':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
      case 'terminated':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {app.name}
            </h3>
            {app.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {app.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {getStatusIcon(app.status)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
              {app.status}
            </span>
          </div>
        </div>

        {/* App Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Image:</span>
            <span className="text-gray-900 dark:text-white font-mono text-xs">
              {app.image}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Port:</span>
            <span className="text-gray-900 dark:text-white">
              {app.port}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Resources:</span>
            <span className="text-gray-900 dark:text-white">
              {app.resources.cpu} CPU, {app.resources.memory} RAM
              {app.resources.gpu && `, ${app.resources.gpu} GPU`}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="text-gray-900 dark:text-white">
              {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* URL */}
        {app.url && (
          <div className="mb-4">
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <ExternalLinkIcon className="h-4 w-4 mr-1" />
              Open App
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            {app.status === 'running' ? (
              <button
                onClick={() => handleAction('stop')}
                disabled={isLoading}
                className="btn-secondary flex items-center gap-1 text-sm"
              >
                <StopIcon className="h-4 w-4" />
                Stop
              </button>
            ) : app.status === 'stopped' ? (
              <button
                onClick={() => handleAction('start')}
                disabled={isLoading}
                className="btn-primary flex items-center gap-1 text-sm"
              >
                <PlayIcon className="h-4 w-4" />
                Start
              </button>
            ) : (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <ClockIcon className="h-4 w-4 mr-1" />
                {app.status === 'creating' ? 'Creating...' : 
                 app.status === 'building' ? 'Building...' : 
                 'Terminated'}
              </div>
            )}
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => {/* TODO: Open settings modal */}}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Settings"
            >
              <Cog6ToothIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleAction('delete')}
              disabled={isLoading || app.status === 'creating' || app.status === 'building'}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}