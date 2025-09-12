'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Server, 
  Activity, 
  Settings, 
  CreditCard,
  LogOut,
  Play,
  Pause,
  Trash2,
  Terminal,
  Globe,
  Cpu,
  HardDrive,
  Zap,
  Clock,
  Users,
  Code,
  ChevronRight,
  Search,
  Bell,
  Menu,
  X,
  Copy,
  ExternalLink,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'

// Main Dashboard Component
const VibeCaaSDashboard = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    tier: 'Pro',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff'
  })

  const [apps, setApps] = useState([
    {
      id: '1',
      name: 'my-api-server',
      framework: 'Python',
      status: 'running',
      url: 'https://my-api-server.vibecaas.local',
      cpu: '0.5',
      memory: '512MB',
      created: '2024-01-15',
      lastDeployed: '2024-01-20',
      gpuEnabled: false
    },
    {
      id: '2',
      name: 'ml-training-app',
      framework: 'PyTorch',
      status: 'running',
      url: 'https://ml-training.vibecaas.local',
      cpu: '2.0',
      memory: '8GB',
      created: '2024-01-10',
      lastDeployed: '2024-01-18',
      gpuEnabled: true,
      gpuType: 'T4'
    },
    {
      id: '3',
      name: 'web-frontend',
      framework: 'Node.js',
      status: 'stopped',
      url: 'https://web-frontend.vibecaas.local',
      cpu: '1.0',
      memory: '2GB',
      created: '2024-01-05',
      lastDeployed: '2024-01-12',
      gpuEnabled: false
    }
  ])

  const [selectedApp, setSelectedApp] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const [newApp, setNewApp] = useState({
    name: '',
    framework: 'python',
    gpuEnabled: false,
    template: 'blank'
  })

  const [resources, setResources] = useState({
    cpu: { used: 3.5, limit: 8 },
    memory: { used: 10.5, limit: 32 },
    storage: { used: 15, limit: 100 },
    gpu: { used: 1, limit: 2 },
    apps: { used: 3, limit: 20 }
  })

  const [metrics, setMetrics] = useState({
    totalRequests: '1.2M',
    avgResponseTime: '45ms',
    uptime: '99.95%',
    activeUsers: '342'
  })

  const frameworks = [
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'nodejs', label: 'Node.js', icon: '📦' },
    { value: 'pytorch', label: 'PyTorch', icon: '🔥' },
    { value: 'tensorflow', label: 'TensorFlow', icon: '🧮' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'java', label: 'Java', icon: '☕' }
  ]

  const templates = [
    { value: 'blank', label: 'Blank Project', description: 'Start from scratch' },
    { value: 'api', label: 'REST API', description: 'FastAPI or Express starter' },
    { value: 'web', label: 'Web App', description: 'Full-stack web application' },
    { value: 'ml', label: 'ML Training', description: 'Machine learning template with GPU' },
    { value: 'bot', label: 'Discord Bot', description: 'Bot template with commands' },
    { value: 'cron', label: 'Cron Job', description: 'Scheduled task runner' }
  ]

  const handleCreateApp = () => {
    if (!newApp.name) {
      alert('Please enter an app name')
      return
    }

    const app = {
      id: Date.now().toString(),
      name: newApp.name,
      framework: frameworks.find(f => f.value === newApp.framework)?.label || 'Python',
      status: 'creating',
      url: `https://${newApp.name}.vibecaas.local`,
      cpu: newApp.gpuEnabled ? '2.0' : '0.5',
      memory: newApp.gpuEnabled ? '8GB' : '512MB',
      created: new Date().toISOString().split('T')[0],
      lastDeployed: new Date().toISOString().split('T')[0],
      gpuEnabled: newApp.gpuEnabled,
      gpuType: newApp.gpuEnabled ? 'T4' : undefined
    }

    setApps([...apps, app])
    setShowCreateModal(false)
    setNewApp({ name: '', framework: 'python', gpuEnabled: false, template: 'blank' })

    // Simulate app creation
    setTimeout(() => {
      setApps(prev => prev.map(a => 
        a.id === app.id ? { ...a, status: 'running' } : a
      ))
    }, 3000)
  }

  const handleAppAction = (appId: string, action: string) => {
    setApps(prev => prev.map(app => {
      if (app.id === appId) {
        switch (action) {
          case 'start':
            return { ...app, status: 'running' }
          case 'stop':
            return { ...app, status: 'stopped' }
          case 'restart':
            return { ...app, status: 'restarting' }
          case 'delete':
            return null
          default:
            return app
        }
      }
      return app
    }).filter(Boolean))

    if (action === 'restart') {
      setTimeout(() => {
        setApps(prev => prev.map(app => 
          app.id === appId ? { ...app, status: 'running' } : app
        ))
      }, 2000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500'
      case 'stopped': return 'text-gray-500'
      case 'creating': return 'text-blue-500'
      case 'restarting': return 'text-yellow-500'
      case 'failed': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100'
      case 'stopped': return 'bg-gray-100'
      case 'creating': return 'bg-blue-100'
      case 'restarting': return 'bg-yellow-100'
      case 'failed': return 'bg-red-100'
      default: return 'bg-gray-100'
    }
  }

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.framework.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                V
              </div>
              {sidebarOpen && (
                <span className="ml-3 text-xl font-bold text-gray-900">VibeCaaS</span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="space-y-2">
            <a href="#" className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Server size={20} />
              {sidebarOpen && <span className="ml-3">Apps</span>}
            </a>
            <a href="#" className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-700">
              <Activity size={20} />
              {sidebarOpen && <span className="ml-3">Resources</span>}
            </a>
            <a href="#" className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-700">
              <CreditCard size={20} />
              {sidebarOpen && <span className="ml-3">Billing</span>}
            </a>
            <a href="#" className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-700">
              <Settings size={20} />
              {sidebarOpen && <span className="ml-3">Settings</span>}
            </a>
          </nav>
        </div>

        {sidebarOpen && (
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.tier} Plan</p>
              </div>
            </div>
            <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm">
              <LogOut size={16} />
              <span className="ml-2">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="relative mr-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-96"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-50 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus size={20} />
                <span className="ml-2">New App</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Server className="text-indigo-600" size={24} />
                </div>
                <span className="text-sm text-green-500 font-medium">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{apps.length}</h3>
              <p className="text-sm text-gray-500">Active Apps</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="text-green-600" size={24} />
                </div>
                <span className="text-sm text-green-500 font-medium">+5%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{metrics.totalRequests}</h3>
              <p className="text-sm text-gray-500">Total Requests</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="text-purple-600" size={24} />
                </div>
                <span className="text-sm text-gray-500 font-medium">{metrics.avgResponseTime}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{metrics.uptime}</h3>
              <p className="text-sm text-gray-500">Uptime</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="text-orange-600" size={24} />
                </div>
                <span className="text-sm text-green-500 font-medium">+18%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</h3>
              <p className="text-sm text-gray-500">Active Users</p>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">CPU</span>
                  <span className="text-sm font-medium">{resources.cpu.used}/{resources.cpu.limit} cores</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(resources.cpu.used / resources.cpu.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Memory</span>
                  <span className="text-sm font-medium">{resources.memory.used}/{resources.memory.limit} GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(resources.memory.used / resources.memory.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="text-sm font-medium">{resources.storage.used}/{resources.storage.limit} GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(resources.storage.used / resources.storage.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">GPU</span>
                  <span className="text-sm font-medium">{resources.gpu.used}/{resources.gpu.limit} units</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${(resources.gpu.used / resources.gpu.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Apps</span>
                  <span className="text-sm font-medium">{resources.apps.used}/{resources.apps.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(resources.apps.used / resources.apps.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Apps List */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your Apps</h2>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-50 rounded-lg">
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredApps.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {app.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{app.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBg(app.status)} ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                          {app.gpuEnabled && (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-600 rounded-full">
                              GPU: {app.gpuType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Code size={14} className="mr-1" />
                            {app.framework}
                          </span>
                          <span className="flex items-center">
                            <Cpu size={14} className="mr-1" />
                            {app.cpu} cores
                          </span>
                          <span className="flex items-center">
                            <HardDrive size={14} className="mr-1" />
                            {app.memory}
                          </span>
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            Created {app.created}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <button
                        onClick={() => setShowTerminal(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                      >
                        <Terminal size={18} />
                      </button>
                      {app.status === 'running' ? (
                        <button
                          onClick={() => handleAppAction(app.id, 'stop')}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                          <Pause size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAppAction(app.id, 'start')}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                          <Play size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleAppAction(app.id, 'restart')}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${app.name}?`)) {
                            handleAppAction(app.id, 'delete')
                          }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Create App Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create New App</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  App Name
                </label>
                <input
                  type="text"
                  value={newApp.name}
                  onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                  placeholder="my-awesome-app"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL will be: {newApp.name || 'my-app'}.vibecaas.local
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Framework
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {frameworks.map((framework) => (
                    <button
                      key={framework.value}
                      onClick={() => setNewApp({ ...newApp, framework: framework.value })}
                      className={`p-3 border rounded-lg text-center hover:border-indigo-500 transition-colors ${
                        newApp.framework === framework.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{framework.icon}</div>
                      <div className="text-sm font-medium">{framework.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.value}
                      onClick={() => setNewApp({ ...newApp, template: template.value })}
                      className={`p-4 border rounded-lg text-left hover:border-indigo-500 transition-colors ${
                        newApp.template === template.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{template.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={newApp.gpuEnabled}
                    onChange={(e) => setNewApp({ ...newApp, gpuEnabled: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable GPU</span>
                </label>
                <p className="mt-1 ml-8 text-sm text-gray-500">
                  Enable GPU acceleration for ML/AI workloads (uses more resources)
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApp}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Modal */}
      {showTerminal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Terminal className="text-green-400" size={20} />
                <span className="text-white font-mono">Terminal - my-api-server</span>
              </div>
              <button
                onClick={() => setShowTerminal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4 font-mono text-sm text-green-400 bg-black rounded-b-xl overflow-auto">
              <div>$ npm start</div>
              <div className="text-gray-400">
                {"> my-api-server@1.0.0 start"}<br />
                {"> node server.js"}<br />
                <br />
                Server running on port 8000<br />
                Connected to database<br />
                Ready to accept connections<br />
                <br />
                [2024-01-20 10:23:45] GET / 200 45ms<br />
                [2024-01-20 10:23:46] GET /api/users 200 23ms<br />
                [2024-01-20 10:23:47] POST /api/data 201 67ms<br />
              </div>
              <div className="flex items-center mt-4">
                <span>$ </span>
                <input
                  type="text"
                  className="flex-1 ml-2 bg-transparent outline-none text-green-400"
                  placeholder="Type a command..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VibeCaaSDashboard