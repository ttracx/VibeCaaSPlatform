'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  PlusIcon,
  RocketLaunchIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import type { App } from '../../types';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function AppsPage() {
  const { user } = useAuthStore();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await api.get('/apps');
      setApps(response.data);
    } catch (error) {
      toast.error('Failed to fetch apps');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = () => {
    setShowCreateModal(true);
  };

  const handleAppAction = async (appId: string, action: string) => {
    try {
      await api.post(`/apps/${appId}/${action}`);
      toast.success(`App ${action} initiated`);
      fetchApps(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to ${action} app`);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (confirm('Are you sure you want to delete this app?')) {
      try {
        await api.delete(`/apps/${appId}`);
        toast.success('App deleted successfully');
        fetchApps();
      } catch (error) {
        toast.error('Failed to delete app');
      }
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="h-2 w-2 bg-green-400 rounded-full"></div>;
      case 'building':
        return <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>;
      case 'stopped':
        return <div className="h-2 w-2 bg-gray-400 rounded-full"></div>;
      case 'error':
        return <div className="h-2 w-2 bg-red-400 rounded-full"></div>;
      default:
        return <div className="h-2 w-2 bg-gray-400 rounded-full"></div>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Applications
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your deployed applications
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleCreateApp}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Create New App
            </button>
          </div>
        </div>

        {/* Apps Grid */}
        {apps.length === 0 ? (
          <div className="text-center py-12">
            <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first app.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateApp}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create New App
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <RocketLaunchIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{app.name}</h3>
                        <p className="text-sm text-gray-500">{app.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(app.status)}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{app.language}</span>
                      <span className="mx-2">•</span>
                      <span>{app.framework}</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>{app.resources.cpu}</span>
                      <span className="mx-2">•</span>
                      <span>{app.resources.memory}</span>
                      <span className="mx-2">•</span>
                      <span>{app.resources.storage}</span>
                    </div>
                  </div>

                  {app.url && (
                    <div className="mt-4">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        Visit App →
                      </a>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex space-x-2">
                      {app.status === 'stopped' ? (
                        <button
                          onClick={() => handleAppAction(app.id, 'start')}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <PlayIcon className="h-3 w-3 mr-1" />
                          Start
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAppAction(app.id, 'stop')}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <StopIcon className="h-3 w-3 mr-1" />
                          Stop
                        </button>
                      )}
                      <button
                        onClick={() => handleAppAction(app.id, 'restart')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <CogIcon className="h-3 w-3 mr-1" />
                        Restart
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create App Modal */}
      {showCreateModal && (
        <CreateAppModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchApps();
          }}
        />
      )}
    </DashboardLayout>
  );
}

// Create App Modal Component
function CreateAppModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'javascript',
    framework: 'react',
    template: 'blank',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/apps', formData);
      toast.success('App created successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create app');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New App</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">App Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="java">Java</option>
                <option value="rust">Rust</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Framework</label>
              <select
                value={formData.framework}
                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="react">React</option>
                <option value="nextjs">Next.js</option>
                <option value="vue">Vue.js</option>
                <option value="express">Express</option>
                <option value="fastapi">FastAPI</option>
                <option value="django">Django</option>
                <option value="flask">Flask</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create App'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}