'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Code, 
  Server, 
  Bug, 
  Magic, 
  Plug, 
  Play, 
  Square, 
  Eye,
  Activity,
  Zap,
  Globe,
  Search,
  Link,
  Shield,
  DollarSign,
  BarChart3,
  ArrowRight,
  Terminal,
  Database,
  Cpu,
  MemoryStick,
  Network,
  Settings,
  Users,
  Lock,
  CheckCircle,
  Clock,
  AlertCircle,
  Rocket,
  GitBranch,
  Cloud,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  current_task: string;
  progress: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface MicroVM {
  id: string;
  name: string;
  status: 'creating' | 'running' | 'stopped' | 'error';
  runtime: string;
  cpu: number;
  memory: number;
  region: string;
  devUrl: string;
  createdAt: string;
}

interface Domain {
  id: string;
  name: string;
  status: 'available' | 'purchased' | 'connected' | 'active';
  price: number;
  currency: string;
  expiresAt?: string;
  appId?: string;
}

const ComprehensiveDemo: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [microvms, setMicroVMs] = useState<MicroVM[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('agents');
  const [demoMode, setDemoMode] = useState<'overview' | 'interactive' | 'live'>('overview');

  const agentData: Agent[] = [
    {
      id: 'planning',
      name: 'Planning Agent',
      type: 'planning',
      status: 'idle',
      current_task: 'Waiting to start...',
      progress: 0,
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-blue-500',
      description: 'Analyzes requirements and creates comprehensive task breakdowns'
    },
    {
      id: 'frontend',
      name: 'Frontend Agent',
      type: 'frontend',
      status: 'idle',
      current_task: 'Waiting for planning...',
      progress: 0,
      icon: <Code className="w-5 h-5" />,
      color: 'bg-green-500',
      description: 'Builds React/Next.js components with TypeScript and Tailwind CSS'
    },
    {
      id: 'backend',
      name: 'Backend Agent',
      type: 'backend',
      status: 'idle',
      current_task: 'Waiting for planning...',
      progress: 0,
      icon: <Server className="w-5 h-5" />,
      color: 'bg-purple-500',
      description: 'Develops FastAPI endpoints with PostgreSQL and Redis integration'
    },
    {
      id: 'testing',
      name: 'Testing Agent',
      type: 'testing',
      status: 'idle',
      current_task: 'Waiting for code...',
      progress: 0,
      icon: <Bug className="w-5 h-5" />,
      color: 'bg-red-500',
      description: 'Runs comprehensive unit, integration, and E2E tests'
    },
    {
      id: 'integration',
      name: 'Integration Agent',
      type: 'integration',
      status: 'idle',
      current_task: 'Waiting for components...',
      progress: 0,
      icon: <Plug className="w-5 h-5" />,
      color: 'bg-orange-500',
      description: 'Connects systems and handles deployment orchestration'
    },
    {
      id: 'ai-feature',
      name: 'AI Feature Agent',
      type: 'ai-feature',
      status: 'idle',
      current_task: 'Waiting for integration...',
      progress: 0,
      icon: <Magic className="w-5 h-5" />,
      color: 'bg-indigo-500',
      description: 'Implements intelligent features using Claude 4, Gemini 2.5 Pro, and GPT-4o'
    }
  ];

  const demoSteps = [
    {
      phase: 'Project Initialization',
      description: 'Setting up project structure and environment',
      duration: 2000,
      agent: 'planning',
      tasks: [
        'Analyzing project requirements',
        'Creating project structure',
        'Setting up development environment',
        'Configuring CI/CD pipeline'
      ]
    },
    {
      phase: 'Frontend Development',
      description: 'Building modern React application with Next.js',
      duration: 4000,
      agent: 'frontend',
      tasks: [
        'Creating React components',
        'Implementing responsive design',
        'Adding state management',
        'Integrating with backend APIs'
      ]
    },
    {
      phase: 'Backend Development',
      description: 'Implementing FastAPI microservices',
      duration: 3500,
      agent: 'backend',
      tasks: [
        'Creating FastAPI endpoints',
        'Setting up database models',
        'Implementing authentication',
        'Adding API documentation'
      ]
    },
    {
      phase: 'MicroVM Provisioning',
      description: 'Creating isolated Firecracker microVMs',
      duration: 3000,
      agent: 'integration',
      tasks: [
        'Provisioning microVM resources',
        'Configuring runtime environment',
        'Setting up networking',
        'Generating dev URLs'
      ]
    },
    {
      phase: 'Domain Management',
      description: 'Searching and connecting custom domains',
      duration: 2500,
      agent: 'integration',
      tasks: [
        'Searching available domains',
        'Processing domain purchase',
        'Configuring DNS records',
        'Setting up SSL certificates'
      ]
    },
    {
      phase: 'Integration & Testing',
      description: 'Connecting all systems and running tests',
      duration: 3000,
      agent: 'testing',
      tasks: [
        'Running unit tests',
        'Executing integration tests',
        'Performing end-to-end tests',
        'Generating test reports'
      ]
    },
    {
      phase: 'AI Enhancement',
      description: 'Adding intelligent features and optimizations',
      duration: 2500,
      agent: 'ai-feature',
      tasks: [
        'Adding smart suggestions',
        'Implementing auto-completion',
        'Creating intelligent debugging',
        'Optimizing performance'
      ]
    },
    {
      phase: 'Deployment',
      description: 'Deploying to production with monitoring',
      duration: 2000,
      agent: 'integration',
      tasks: [
        'Building production images',
        'Deploying to Kubernetes',
        'Configuring monitoring',
        'Setting up alerts'
      ]
    }
  ];

  useEffect(() => {
    setAgents(agentData);
    initializeDemoData();
  }, []);

  const initializeDemoData = () => {
    // Initialize MicroVMs
    setMicroVMs([
      {
        id: 'vm-1',
        name: 'React Dashboard',
        status: 'running',
        runtime: 'Node.js 18',
        cpu: 2,
        memory: 4096,
        region: 'us-east-1',
        devUrl: 'https://react-dashboard-abc123.vibecaas.com',
        createdAt: '2025-01-14T10:30:00Z'
      },
      {
        id: 'vm-2',
        name: 'API Service',
        status: 'running',
        runtime: 'Python 3.11',
        cpu: 1,
        memory: 2048,
        region: 'us-west-2',
        devUrl: 'https://api-service-xyz789.vibecaas.com',
        createdAt: '2025-01-14T11:15:00Z'
      },
      {
        id: 'vm-3',
        name: 'ML Model Server',
        status: 'creating',
        runtime: 'Python 3.11 + CUDA',
        cpu: 4,
        memory: 8192,
        region: 'us-east-1',
        devUrl: 'https://ml-server-def456.vibecaas.com',
        createdAt: '2025-01-14T12:00:00Z'
      }
    ]);

    // Initialize Domains
    setDomains([
      {
        id: 'domain-1',
        name: 'myapp.ai',
        status: 'active',
        price: 5999,
        currency: 'USD',
        expiresAt: '2026-01-14T00:00:00Z',
        appId: 'vm-1'
      },
      {
        id: 'domain-2',
        name: 'apiserver.dev',
        status: 'connected',
        price: 1299,
        currency: 'USD',
        expiresAt: '2026-01-14T00:00:00Z',
        appId: 'vm-2'
      },
      {
        id: 'domain-3',
        name: 'mlplatform.com',
        status: 'available',
        price: 8999,
        currency: 'USD'
      }
    ]);
  };

  const startDemo = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setDemoMode('interactive');
    runDemoStep(0);
  };

  const stopDemo = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setAgents(agentData);
    setDemoMode('overview');
  };

  const runDemoStep = (stepIndex: number) => {
    if (stepIndex >= demoSteps.length) {
      setIsRunning(false);
      setDemoMode('live');
      return;
    }

    const step = demoSteps[stepIndex];
    setCurrentStep(stepIndex);

    // Update the active agent
    setAgents(prev => prev.map(agent => {
      if (agent.id === step.agent) {
        return {
          ...agent,
          status: 'working',
          current_task: step.tasks[0],
          progress: 0
        };
      }
      return agent;
    }));

    // Simulate progress
    let progress = 0;
    let taskIndex = 0;
    const progressInterval = setInterval(() => {
      progress += 2;
      
      setAgents(prev => prev.map(agent => {
        if (agent.id === step.agent) {
          const newProgress = Math.min(progress, 100);
          const newTaskIndex = Math.floor((progress / 100) * step.tasks.length);
          
          return {
            ...agent,
            progress: newProgress,
            current_task: step.tasks[Math.min(newTaskIndex, step.tasks.length - 1)],
            status: newProgress >= 100 ? 'completed' : 'working'
          };
        }
        return agent;
      }));

      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          runDemoStep(stepIndex + 1);
        }, 1000);
      }
    }, step.duration / 50);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'idle': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getVMStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500 bg-green-100';
      case 'creating': return 'text-blue-500 bg-blue-100';
      case 'stopped': return 'text-gray-500 bg-gray-100';
      case 'error': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getDomainStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-100';
      case 'connected': return 'text-blue-500 bg-blue-100';
      case 'purchased': return 'text-yellow-500 bg-yellow-100';
      case 'available': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">🎵 VibeCaaS Comprehensive Demo</h1>
              <Badge variant="secondary" className="ml-3">
                {demoMode === 'overview' && 'Overview Mode'}
                {demoMode === 'interactive' && 'Interactive Demo'}
                {demoMode === 'live' && 'Live Platform'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              {!isRunning ? (
                <Button onClick={startDemo} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Interactive Demo
                </Button>
              ) : (
                <Button onClick={stopDemo} variant="outline">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Demo
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="microvms">MicroVMs</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="platform">Platform</TabsTrigger>
          </TabsList>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            {/* Current Phase */}
            {isRunning && currentStep < demoSteps.length && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-900">
                        Phase {currentStep + 1}: {demoSteps[currentStep].phase}
                      </h2>
                      <p className="text-blue-700 mt-1">{demoSteps[currentStep].description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-600">Progress</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {Math.round((currentStep / demoSteps.length) * 100)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agent Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${agent.color} text-white`}>
                          {agent.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <p className="text-sm text-gray-600">{agent.description}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={agent.status === 'working' ? 'default' : 'secondary'}
                        className={getStatusColor(agent.status)}
                      >
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

          {/* MicroVMs Tab */}
          <TabsContent value="microvms" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Firecracker MicroVMs</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Zap className="w-4 h-4 mr-2" />
                Create New MicroVM
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {microvms.map((vm) => (
                <Card key={vm.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{vm.name}</CardTitle>
                      <Badge className={getVMStatusColor(vm.status)}>
                        {vm.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Runtime</p>
                          <p className="font-medium">{vm.runtime}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Region</p>
                          <p className="font-medium">{vm.region}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">CPU</p>
                          <p className="font-medium">{vm.cpu} cores</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Memory</p>
                          <p className="font-medium">{vm.memory}MB</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Dev URL</p>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                            {vm.devUrl}
                          </code>
                          <Button size="sm" variant="outline">
                            <Link className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Domains Tab */}
          <TabsContent value="domains" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Domain Management</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Search className="w-4 h-4 mr-2" />
                Search Domains
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {domains.map((domain) => (
                <Card key={domain.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{domain.name}</CardTitle>
                      <Badge className={getDomainStatusColor(domain.status)}>
                        {domain.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Price</span>
                        <span className="font-bold">
                          ${(domain.price / 100).toFixed(2)} {domain.currency}
                        </span>
                      </div>
                      
                      {domain.expiresAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Expires</span>
                          <span className="text-sm">
                            {new Date(domain.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {domain.appId && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Connected to</span>
                          <span className="text-sm font-medium">{domain.appId}</span>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Globe className="w-3 h-3 mr-1" />
                          Manage
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Platform Tab */}
          <TabsContent value="platform" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
            
            {/* Platform Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI Agent Orchestration</CardTitle>
                      <p className="text-sm text-gray-600">Multi-agent system with specialized agents</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>6 specialized agents</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Real-time collaboration</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Claude 4, Gemini 2.5 Pro, GPT-4o</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Firecracker MicroVMs</CardTitle>
                      <p className="text-sm text-gray-600">Lightning-fast isolated containers</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>&lt; 45 second boot time</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Custom runtimes</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Instant dev URLs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Domain Management</CardTitle>
                      <p className="text-sm text-gray-600">Name.com integration</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Search & purchase domains</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Automatic SSL</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>DNS management</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Live Preview</CardTitle>
                      <p className="text-sm text-gray-600">Real-time development</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Custom subdomains</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Hot reload</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Multi-device testing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Usage-Based Billing</CardTitle>
                      <p className="text-sm text-gray-600">Stripe integration</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Transparent pricing</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Pay per use</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Real-time usage tracking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Enterprise Security</CardTitle>
                      <p className="text-sm text-gray-600">Multi-tenant RBAC</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Per-tenant isolation</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Secrets vault</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Audit logging</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Code Editor Simulation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Live Code Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-2 mr-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span>VibeCaaSDashboard.tsx</span>
                  </div>
                  <pre className="whitespace-pre-wrap">
{`import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Zap, Globe, Brain, Code, Server, Bug, Magic, Plug } from 'lucide-react';

const VibeCaaSDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [microvms, setMicroVMs] = useState([]);
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    // Fetch data from APIs
    fetchProjects();
    fetchMicroVMs();
    fetchDomains();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/v1/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchMicroVMs = async () => {
    try {
      const response = await fetch('/api/v1/microvms');
      const data = await response.json();
      setMicroVMs(data);
    } catch (error) {
      console.error('Error fetching microVMs:', error);
    }
  };

  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/v1/domains');
      const data = await response.json();
      setDomains(data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VibeCaaS Dashboard
          </h1>
          <p className="text-gray-600">
            Multi-agent AI development platform with MicroVMs and Domain management
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="microvms">MicroVMs</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects">
            {/* Projects content */}
          </TabsContent>
          
          <TabsContent value="microvms">
            {/* MicroVMs content */}
          </TabsContent>
          
          <TabsContent value="domains">
            {/* Domains content */}
          </TabsContent>
          
          <TabsContent value="agents">
            {/* AI Agents content */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VibeCaaSDashboard;`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <Activity className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-medium">Live Preview</p>
                    <p className="text-sm">Your application will appear here in real-time</p>
                  </div>
                  {isRunning && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Building preview...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveDemo;