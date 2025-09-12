'use client'

import { useState } from 'react'
import { useQuery } from 'react-query'
import { PlusIcon, PlayIcon, StopIcon, TrashIcon } from '@heroicons/react/24/outline'
import { AppCard } from '@/components/AppCard'
import { CreateAppModal } from '@/components/CreateAppModal'
import { DashboardHeader } from '@/components/DashboardHeader'
import { ResourceUsage } from '@/components/ResourceUsage'
import { apiService } from '@/services/api'
import { App } from '@/types/app'

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data: apps, isLoading, refetch } = useQuery<App[]>(
    'apps',
    apiService.getApps,
    {
      refetchInterval: 5000, // Refetch every 5 seconds
    }
  )

  const { data: usage } = useQuery(
    'usage',
    apiService.getResourceUsage,
    {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  )

  const handleAppAction = async (appId: string, action: 'start' | 'stop' | 'delete') => {
    try {
      switch (action) {
        case 'start':
          await apiService.startApp(appId)
          break
        case 'stop':
          await apiService.stopApp(appId)
          break
        case 'delete':
          await apiService.deleteApp(appId)
          break
      }
      refetch()
    } catch (error) {
      console.error(`Failed to ${action} app:`, error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Manage your containerized applications
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create New App
            </button>
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
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 btn-primary"
              >
                Create Your First App
              </button>
            </div>
          )}
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
    </div>
  )
}