'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Play, 
  Square, 
  Settings, 
  Eye, 
  Code, 
  Server, 
  Brain, 
  Bug, 
  Magic,
  Plug,
  Activity,
  DollarSign,
  Users,
  Folder,
  Zap
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'creating' | 'running' | 'stopped' | 'failed' | 'deploying';
  framework: string;
  preview_url?: string;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  type: 'planning' | 'frontend' | 'backend' | 'integration' | 'testing' | 'ai-feature';
  status: 'idle' | 'working' | 'completed' | 'error';
  current_task: string;
  progress: number;
}

interface UsageStats {
  total_projects: number;
  running_containers: number;
  cpu_usage_percent: number;
  memory_usage_gb: number;
  storage_usage_gb: number;
}

const VibeCaaSDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Simulate real-time updates
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls
      setProjects([
        {
          id: 1,
          name: 'React Dashboard',
          description: 'Modern React dashboard with real-time updates',
          status: 'running',
          framework: 'React',
          preview_url: 'https://react-dashboard.vibecaas.com',
          created_at: '2025-01-27T10:00:00Z'
        },
        {
          id: 2,
          name: 'E-commerce API',
          description: 'FastAPI backend for e-commerce platform',
          status: 'deploying',
          framework: 'FastAPI',
          created_at: '2025-01-27T09:30:00Z'
        },
        {
          id: 3,
          name: 'Vue.js Portfolio',
          description: 'Personal portfolio website',
          status: 'stopped',
          framework: 'Vue.js',
          created_at: '2025-01-27T08:15:00Z'
        }
      ]);

      setAgents([
        {
          id: 'planning-1',
          name: 'Planning Agent',
          type: 'planning',
          status: 'working',
          current_task: 'Analyzing project requirements',
          progress: 75
        },
        {
          id: 'frontend-1',
          name: 'Frontend Agent',
          type: 'frontend',
          status: 'working',
          current_task: 'Creating responsive components',
          progress: 60
        },
        {
          id: 'backend-1',
          name: 'Backend Agent',
          type: 'backend',
          status: 'working',
          current_task: 'Implementing API endpoints',
          progress: 45
        },
        {
          id: 'testing-1',
          name: 'Testing Agent',
          type: 'testing',
          status: 'completed',
          current_task: 'All tests passed successfully',
          progress: 100
        },
        {
          id: 'integration-1',
          name: 'Integration Agent',
          type: 'integration',
          status: 'idle',
          current_task: 'Waiting for components',
          progress: 0
        },
        {
          id: 'ai-feature-1',
          name: 'AI Feature Agent',
          type: 'ai-feature',
          status: 'working',
          current_task: 'Adding smart suggestions',
          progress: 30
        }
      ]);

      setUsageStats({
        total_projects: 3,
        running_containers: 1,
        cpu_usage_percent: 45.2,
        memory_usage_gb: 2.1,
        storage_usage_gb: 8.5
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'deploying': return 'bg-blue-500';
      case 'stopped': return 'bg-gray-500';
      case 'failed': return 'bg-red-500';
      case 'creating': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'planning': return <Brain className="w-5 h-5" />;
      case 'frontend': return <Code className="w-5 h-5" />;
      case 'backend': return <Server className="w-5 h-5" />;
      case 'integration': return <Plug className="w-5 h-5" />;
      case 'testing': return <Bug className="w-5 h-5" />;
      case 'ai-feature': return <Magic className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'idle': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VibeCaaS Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">🎵 VibeCaaS</h1>
              <Badge variant="secondary" className="ml-3">Multi-Agent AI Platform</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Folder className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{usageStats?.total_projects || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Running Containers</p>
                  <p className="text-2xl font-bold text-gray-900">{usageStats?.running_containers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{usageStats?.cpu_usage_percent || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Server className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{usageStats?.memory_usage_gb || 0} GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="microvms">MicroVMs</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                    </div>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Framework:</span>
                        <Badge variant="outline">{project.framework}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <Badge variant={project.status === 'running' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      
                      {project.preview_url && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Preview:</span>
                          <a 
                            href={project.preview_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </a>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </Button>
                        {project.status === 'running' ? (
                          <Button size="sm" variant="outline">
                            <Square className="w-4 h-4 mr-1" />
                            Stop
                          </Button>
                        ) : (
                          <Button size="sm">
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* MicroVMs Tab */}
          <TabsContent value="microvms" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">MicroVMs</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Zap className="w-4 h-4 mr-2" />
                Create MicroVM
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center text-gray-500">
                <Zap className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg font-semibold mb-2">Firecracker MicroVMs</h3>
                <p className="text-sm mb-6">
                  Create isolated microVMs with custom runtimes and instant dev URLs
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Lightning Fast</h4>
                      <p className="text-sm text-gray-600">Boot in under 45 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Server className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Isolated</h4>
                      <p className="text-sm text-gray-600">Secure Firecracker microVMs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Instant URLs</h4>
                      <p className="text-sm text-gray-600">Get dev URLs immediately</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Domains Tab */}
          <TabsContent value="domains" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Domains</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Globe className="w-4 h-4 mr-2" />
                Search Domains
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center text-gray-500">
                <Globe className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg font-semibold mb-2">Domain Management</h3>
                <p className="text-sm mb-6">
                  Search, purchase, and connect custom domains to your VibeCaaS apps
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Search className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Search & Purchase</h4>
                      <p className="text-sm text-gray-600">Find available domains with real-time pricing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Link className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Easy Connect</h4>
                      <p className="text-sm text-gray-600">Connect domains to apps with one click</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Auto SSL</h4>
                      <p className="text-sm text-gray-600">Automatic SSL certificate management</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">AI Agents</h2>
              <Badge variant="outline">6 Active Agents</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getAgentStatusColor(agent.status)}`}>
                          {getAgentIcon(agent.type)}
                        </div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                      </div>
                      <Badge variant={agent.status === 'working' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Current Task:</p>
                        <p className="text-sm font-medium">{agent.current_task}</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-900">{agent.progress}%</span>
                        </div>
                        <Progress value={agent.progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Resource Usage</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>CPU Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Usage</span>
                      <span className="text-sm font-medium">{usageStats?.cpu_usage_percent || 0}%</span>
                    </div>
                    <Progress value={usageStats?.cpu_usage_percent || 0} className="h-3" />
                    <div className="text-xs text-gray-500">
                      Limit: 4 cores (Pro Plan)
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Usage</span>
                      <span className="text-sm font-medium">{usageStats?.memory_usage_gb || 0} GB</span>
                    </div>
                    <Progress value={(usageStats?.memory_usage_gb || 0) / 8 * 100} className="h-3" />
                    <div className="text-xs text-gray-500">
                      Limit: 8 GB (Pro Plan)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Billing & Usage</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">Pro</div>
                    <div className="text-sm text-gray-600 mb-4">$29/month</div>
                    <Button variant="outline" size="sm">Upgrade Plan</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>This Month's Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Compute Hours</span>
                      <span className="text-sm font-medium">45.2 / 200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Storage</span>
                      <span className="text-sm font-medium">8.5 / 50 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">API Calls</span>
                      <span className="text-sm font-medium">12,450 / 100,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Next Billing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">Feb 27, 2025</div>
                    <div className="text-sm text-gray-600 mb-4">$29.00</div>
                    <Button variant="outline" size="sm">View Invoice</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VibeCaaSDashboard;
