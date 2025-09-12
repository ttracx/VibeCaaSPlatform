'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PlusIcon, RocketLaunchIcon, ChartBarIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import type { App } from '../../types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [apps, setApps] = useState<App[]>([]);
  const [stats, setStats] = useState({
    totalApps: 0,
    runningApps: 0,
    totalDeployments: 0,
    cpuUsage: 0,
  });

  useEffect(() => {
    // Mock data for now
    setApps([
      {
        id: '1',
        name: 'My React App',
        description: 'A modern React application',
        language: 'JavaScript',
        framework: 'React',
        status: 'running',
        url: 'https://my-react-app.vibecaas.com',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        userId: user?.id || '',
        resources: {
          cpu: '0.5 vCPU',
          memory: '1GB',
          storage: '5GB',
        },
        environment: {},
      },
      {
        id: '2',
        name: 'ML Model API',
        description: 'Machine learning model inference API',
        language: 'Python',
        framework: 'FastAPI',
        status: 'building',
        createdAt: '2024-01-14T14:30:00Z',
        updatedAt: '2024-01-14T14:30:00Z',
        userId: user?.id || '',
        resources: {
          cpu: '2 vCPU',
          memory: '4GB',
          storage: '10GB',
        },
        environment: {},
      },
    ]);

    setStats({
      totalApps: 2,
      runningApps: 1,
      totalDeployments: 15,
      cpuUsage: 65,
    });
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100';
      case 'building':
        return 'text-yellow-600 bg-yellow-100';
      case 'stopped':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome back, {user?.name}!
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your applications and monitor resources
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New App
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <RocketLaunchIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Apps</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalApps}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Running Apps</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.runningApps}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CpuChipIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">CPU Usage</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.cpuUsage}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <RocketLaunchIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Deployments</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalDeployments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Apps */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Apps</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your latest deployed applications
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {apps.map((app) => (
              <li key={app.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                          <RocketLaunchIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{app.name}</p>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{app.description}</p>
                        <p className="text-xs text-gray-400">
                          {app.language} • {app.framework} • {app.resources.cpu} • {app.resources.memory}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {app.url && (
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                        >
                          Visit
                        </a>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="sr-only">Options</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {apps.length === 0 && (
            <div className="text-center py-12">
              <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No apps yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first app.</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New App
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}