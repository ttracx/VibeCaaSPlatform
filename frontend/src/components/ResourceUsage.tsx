'use client'

import { 
  CpuChipIcon, 
  CircleStackIcon, 
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { ResourceUsage as ResourceUsageType } from '@/types/app'

interface ResourceUsageProps {
  usage: ResourceUsageType
}

export function ResourceUsage({ usage }: ResourceUsageProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatResource = (resource: string) => {
    if (resource.includes('Gi')) {
      return resource
    }
    if (resource.includes('Mi')) {
      const value = parseInt(resource.replace('Mi', ''))
      return value >= 1024 ? `${(value / 1024).toFixed(1)}Gi` : resource
    }
    return resource
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Resource Usage Overview
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Apps */}
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Apps</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {usage.totalApps}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {usage.runningApps} running
            </p>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CPU</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatResource(usage.totalCpu)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total allocated
            </p>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <CircleStackIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Memory</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatResource(usage.totalMemory)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total allocated
            </p>
          </div>
        </div>

        {/* Cost */}
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Cost</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(usage.monthlyCost)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatCurrency(usage.dailyCost)}/day
            </p>
          </div>
        </div>
      </div>

      {/* GPU Usage (if available) */}
      {usage.totalGpu && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-nvidia-100 dark:bg-nvidia-900/20 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="h-6 w-6 text-nvidia-600 dark:text-nvidia-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">GPU</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {usage.totalGpu}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                NVIDIA GPU resources
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}