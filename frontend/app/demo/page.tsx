'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  ArrowRight
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
}

const DemoPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const agentData: Agent[] = [
    {
      id: 'planning',
      name: 'Planning Agent',
      type: 'planning',
      status: 'idle',
      current_task: 'Waiting to start...',
      progress: 0,
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'frontend',
      name: 'Frontend Agent',
      type: 'frontend',
      status: 'idle',
      current_task: 'Waiting for planning...',
      progress: 0,
      icon: <Code className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'backend',
      name: 'Backend Agent',
      type: 'backend',
      status: 'idle',
      current_task: 'Waiting for planning...',
      progress: 0,
      icon: <Server className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'testing',
      name: 'Testing Agent',
      type: 'testing',
      status: 'idle',
      current_task: 'Waiting for code...',
      progress: 0,
      icon: <Bug className="w-5 h-5" />,
      color: 'bg-red-500'
    },
    {
      id: 'integration',
      name: 'Integration Agent',
      type: 'integration',
      status: 'idle',
      current_task: 'Waiting for components...',
      progress: 0,
      icon: <Plug className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'ai-feature',
      name: 'AI Feature Agent',
      type: 'ai-feature',
      status: 'idle',
      current_task: 'Waiting for integration...',
      progress: 0,
      icon: <Magic className="w-5 h-5" />,
      color: 'bg-indigo-500'
    }
  ];

  const demoSteps = [
    {
      phase: 'Planning',
      description: 'Analyzing requirements and creating task breakdown',
      duration: 3000,
      agent: 'planning',
      tasks: [
        'Analyzing project requirements',
        'Creating task breakdown',
        'Assigning tasks to agents',
        'Setting up project structure'
      ]
    },
    {
      phase: 'Frontend Development',
      description: 'Building React components and UI',
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
      description: 'Implementing FastAPI endpoints and database',
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
      phase: 'Integration',
      description: 'Connecting frontend and backend',
      duration: 2500,
      agent: 'integration',
      tasks: [
        'Connecting frontend to APIs',
        'Setting up WebSocket connections',
        'Configuring deployment',
        'Testing integration points'
      ]
    },
    {
      phase: 'Testing',
      description: 'Running comprehensive tests',
      duration: 2000,
      agent: 'testing',
      tasks: [
        'Running unit tests',
        'Executing integration tests',
        'Performing end-to-end tests',
        'Generating test reports'
      ]
    },
    {
      phase: 'AI Features',
      description: 'Adding intelligent features',
      duration: 3000,
      agent: 'ai-feature',
      tasks: [
        'Adding smart suggestions',
        'Implementing auto-completion',
        'Creating intelligent debugging',
        'Optimizing performance'
      ]
    }
  ];

  useEffect(() => {
    setAgents(agentData);
  }, []);

  const startDemo = () => {
    setIsRunning(true);
    setCurrentStep(0);
    runDemoStep(0);
  };

  const stopDemo = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setAgents(agentData);
  };

  const runDemoStep = (stepIndex: number) => {
    if (stepIndex >= demoSteps.length) {
      setIsRunning(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">🎵 VibeCaaS Demo</h1>
              <Badge variant="secondary" className="ml-3">Live AI Agent Simulation</Badge>
            </div>
            <div className="flex items-center space-x-4">
              {!isRunning ? (
                <Button onClick={startDemo} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Demo
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
        {/* Current Phase */}
        {isRunning && currentStep < demoSteps.length && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
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

        {/* Agent Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${agent.color} text-white`}>
                      {agent.icon}
                    </div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
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

        {/* Code Editor Simulation */}
        <Card className="mb-8">
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
                <span>Dashboard.jsx</span>
              </div>
              <pre className="whitespace-pre-wrap">
{`import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects from API
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/v1/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Projects
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <Button>Open Project</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;`}
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

        {/* Platform Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Platform Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Development</h3>
                <p className="text-gray-600 mb-4">
                  Watch AI agents plan, code, and test your applications in real-time using Claude 4, Gemini 2.5 Pro, and GPT-4o.
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>Try it now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Firecracker MicroVMs</h3>
                <p className="text-gray-600 mb-4">
                  Lightning-fast isolated microVMs that boot in under 45 seconds with custom runtimes and instant dev URLs.
                </p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <span>Create MicroVM</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Domain Management</h3>
                <p className="text-gray-600 mb-4">
                  Search, purchase, and connect custom domains with Name.com integration and automatic SSL.
                </p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  <span>Search domains</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Preview</h3>
                <p className="text-gray-600 mb-4">
                  Real-time preview with custom subdomains and automatic SSL certificate management.
                </p>
                <div className="flex items-center text-orange-600 text-sm font-medium">
                  <span>Preview app</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Usage-Based Billing</h3>
                <p className="text-gray-600 mb-4">
                  Transparent pricing with Stripe integration. Pay only for what you use.
                </p>
                <div className="flex items-center text-yellow-600 text-sm font-medium">
                  <span>View pricing</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                <p className="text-gray-600 mb-4">
                  Multi-tenant RBAC, secrets vault, audit logging, and per-tenant isolation.
                </p>
                <div className="flex items-center text-red-600 text-sm font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Observability</h3>
                <p className="text-gray-600 mb-4">
                  Prometheus, Grafana, OpenTelemetry, and centralized logging with Loki.
                </p>
                <div className="flex items-center text-indigo-600 text-sm font-medium">
                  <span>View metrics</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoPage;