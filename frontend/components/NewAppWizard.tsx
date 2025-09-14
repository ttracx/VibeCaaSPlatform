'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  Square, 
  Eye, 
  Code, 
  Server, 
  Brain, 
  Bug, 
  Sparkles as Magic,
  Plug,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Settings
} from 'lucide-react';

interface RuntimeTemplate {
  runtime: string;
  name: string;
  description: string;
  default_cpu_cores: number;
  default_memory_mb: number;
  default_storage_gb: number;
  default_build_command?: string;
  default_start_command: string;
  icon: string;
  color: string;
}

interface Region {
  id: string;
  name: string;
  available: boolean;
  latency_ms?: number;
}

interface MicroVMCreate {
  name: string;
  description?: string;
  runtime: string;
  region: string;
  cpu_cores: number;
  memory_mb: number;
  storage_gb: number;
  repo_url?: string;
  branch: string;
  build_command?: string;
  start_command?: string;
  environment_variables?: Record<string, string>;
  gpu_enabled: boolean;
  auto_scale: boolean;
}

interface MicroVMCreateResponse {
  id: number;
  vm_id: string;
  status: string;
  dev_url?: string;
  message: string;
}

interface MicroVMStatus {
  id: number;
  vm_id: string;
  status: string;
  vm_control_status?: string;
  dev_url?: string;
  internal_ip?: string;
  external_ip?: string;
  cpu_usage_percent: number;
  memory_usage_mb: number;
  storage_usage_gb: number;
  created_at: string;
  updated_at?: string;
}

const NewAppWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [createdMicroVM, setCreatedMicroVM] = useState<MicroVMCreateResponse | null>(null);
  const [microvmStatus, setMicrovmStatus] = useState<MicroVMStatus | null>(null);
  const [templates, setTemplates] = useState<RuntimeTemplate[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [formData, setFormData] = useState<MicroVMCreate>({
    name: '',
    description: '',
    runtime: 'node',
    region: 'us-east-1',
    cpu_cores: 2,
    memory_mb: 2048,
    storage_gb: 10,
    repo_url: '',
    branch: 'main',
    build_command: '',
    start_command: '',
    environment_variables: {},
    gpu_enabled: false,
    auto_scale: false
  });

  useEffect(() => {
    loadTemplatesAndRegions();
  }, []);

  useEffect(() => {
    if (createdMicroVM && createdMicroVM.status === 'creating') {
      pollMicroVMStatus(createdMicroVM.id);
    }
  }, [createdMicroVM]);

  const loadTemplatesAndRegions = async () => {
    try {
      // Load runtime templates
      const templatesResponse = await fetch('/api/v1/microvms/templates/runtimes');
      const templatesData = await templatesResponse.json();
      setTemplates(templatesData);

      // Load regions
      const regionsResponse = await fetch('/api/v1/microvms/templates/regions');
      const regionsData = await regionsResponse.json();
      setRegions(regionsData);

      // Set default region
      if (regionsData.length > 0) {
        setFormData(prev => ({ ...prev, region: regionsData[0].id }));
      }
    } catch (error) {
      console.error('Failed to load templates and regions:', error);
    }
  };

  const pollMicroVMStatus = async (microvmId: number) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/microvms/${microvmId}/status`);
        const status = await response.json();
        setMicrovmStatus(status);

        if (status.status === 'running' || status.status === 'failed') {
          clearInterval(pollInterval);
          setIsCreating(false);
        }
      } catch (error) {
        console.error('Failed to poll MicroVM status:', error);
        clearInterval(pollInterval);
        setIsCreating(false);
      }
    }, 2000);

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsCreating(false);
    }, 120000);
  };

  const handleCreateMicroVM = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/v1/microvms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create MicroVM');
      }

      const result = await response.json();
      setCreatedMicroVM(result);
    } catch (error) {
      console.error('Failed to create MicroVM:', error);
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = (template: RuntimeTemplate) => {
    setFormData(prev => ({
      ...prev,
      runtime: template.runtime,
      cpu_cores: template.default_cpu_cores,
      memory_mb: template.default_memory_mb,
      storage_gb: template.default_storage_gb,
      build_command: template.default_build_command || '',
      start_command: template.default_start_command
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'creating': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'running': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'creating': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRuntimeIcon = (runtime: string) => {
    switch (runtime) {
      case 'node': return <Code className="w-5 h-5" />;
      case 'python': return <Code className="w-5 h-5" />;
      case 'go': return <Code className="w-5 h-5" />;
      case 'rust': return <Code className="w-5 h-5" />;
      case 'java': return <Code className="w-5 h-5" />;
      case 'dotnet': return <Code className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
  };

  if (createdMicroVM) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                {getStatusIcon(createdMicroVM.status)}
                <span className="ml-2">Creating MicroVM</span>
              </CardTitle>
              <Badge className={getStatusColor(createdMicroVM.status)}>
                {createdMicroVM.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{createdMicroVM.message}</h3>
                <p className="text-gray-600">VM ID: {createdMicroVM.vm_id}</p>
              </div>

              {microvmStatus && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {microvmStatus.cpu_usage_percent}%
                      </div>
                      <div className="text-sm text-gray-600">CPU Usage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(microvmStatus.memory_usage_mb / 1024)} GB
                      </div>
                      <div className="text-sm text-gray-600">Memory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {microvmStatus.storage_usage_gb} GB
                      </div>
                      <div className="text-sm text-gray-600">Storage</div>
                    </div>
                  </div>

                  {microvmStatus.dev_url && (
                    <div className="text-center">
                      <Button
                        onClick={() => window.open(microvmStatus.dev_url, '_blank')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Dev URL
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center">
                <Button
                  onClick={() => {
                    setCreatedMicroVM(null);
                    setMicrovmStatus(null);
                    setCurrentStep(1);
                  }}
                  variant="outline"
                >
                  Create Another MicroVM
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-6 h-6 mr-2 text-purple-600" />
            Create New MicroVM App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep.toString()} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="1">Template</TabsTrigger>
              <TabsTrigger value="2">Configuration</TabsTrigger>
              <TabsTrigger value="3">Resources</TabsTrigger>
              <TabsTrigger value="4">Review</TabsTrigger>
            </TabsList>

            {/* Step 1: Template Selection */}
            <TabsContent value="1" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose Runtime Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.runtime}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        formData.runtime === template.runtime ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-lg bg-${template.color}-100`}>
                            {getRuntimeIcon(template.runtime)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-gray-600">{template.description}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {template.default_cpu_cores} CPU • {template.default_memory_mb}MB RAM • {template.default_storage_gb}GB Storage
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)}>
                  Next: Configuration
                </Button>
              </div>
            </TabsContent>

            {/* Step 2: Configuration */}
            <TabsContent value="2" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">App Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="my-awesome-app"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {regions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name} {region.latency_ms && `(${region.latency_ms}ms)`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      placeholder="Describe your application..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repository URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.repo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, repo_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://github.com/username/repo.git"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Next: Resources
                </Button>
              </div>
            </TabsContent>

            {/* Step 3: Resources */}
            <TabsContent value="3" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Resource Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPU Cores
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={formData.cpu_cores}
                      onChange={(e) => setFormData(prev => ({ ...prev, cpu_cores: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Memory (MB)
                    </label>
                    <input
                      type="number"
                      min="512"
                      max="32768"
                      step="512"
                      value={formData.memory_mb}
                      onChange={(e) => setFormData(prev => ({ ...prev, memory_mb: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storage (GB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.storage_gb}
                      onChange={(e) => setFormData(prev => ({ ...prev, storage_gb: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="gpu_enabled"
                      checked={formData.gpu_enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, gpu_enabled: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="gpu_enabled" className="text-sm font-medium text-gray-700">
                      Enable GPU acceleration
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_scale"
                      checked={formData.auto_scale}
                      onChange={(e) => setFormData(prev => ({ ...prev, auto_scale: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="auto_scale" className="text-sm font-medium text-gray-700">
                      Enable auto-scaling
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(4)}>
                  Next: Review
                </Button>
              </div>
            </TabsContent>

            {/* Step 4: Review */}
            <TabsContent value="4" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Review Configuration</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Runtime:</span>
                    <span className="capitalize">{formData.runtime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Region:</span>
                    <span>{regions.find(r => r.id === formData.region)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">CPU Cores:</span>
                    <span>{formData.cpu_cores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Memory:</span>
                    <span>{formData.memory_mb} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Storage:</span>
                    <span>{formData.storage_gb} GB</span>
                  </div>
                  {formData.repo_url && (
                    <div className="flex justify-between">
                      <span className="font-medium">Repository:</span>
                      <span className="text-sm text-blue-600 truncate max-w-xs">{formData.repo_url}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">GPU Enabled:</span>
                    <span>{formData.gpu_enabled ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Auto-scaling:</span>
                    <span>{formData.auto_scale ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button 
                  onClick={handleCreateMicroVM}
                  disabled={isCreating || !formData.name}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create MicroVM'
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAppWizard;