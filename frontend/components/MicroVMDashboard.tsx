'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Play, 
  Square, 
  Eye, 
  Code, 
  Server, 
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Settings,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface MicroVM {
  id: number;
  vm_id: string;
  name: string;
  description?: string;
  owner_id: number;
  tenant_id: number;
  runtime: string;
  region: string;
  cpu_cores: number;
  memory_mb: number;
  storage_gb: number;
  status: string;
  dev_url?: string;
  internal_ip?: string;
  external_ip?: string;
  repo_url?: string;
  branch: string;
  build_command?: string;
  start_command?: string;
  environment_variables?: Record<string, string>;
  vm_control_id?: string;
  vm_control_region?: string;
  vm_control_status?: string;
  created_at: string;
  updated_at?: string;
  started_at?: string;
  stopped_at?: string;
  cpu_usage_percent: number;
  memory_usage_mb: number;
  storage_usage_gb: number;
  is_active: boolean;
  auto_scale: boolean;
  gpu_enabled: boolean;
}

interface MicroVMListResponse {
  microvms: MicroVM[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const MicroVMDashboard: React.FC = () => {
  const [microvms, setMicrovms] = useState<MicroVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadMicroVMs();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadMicroVMs, 10000);
    return () => clearInterval(interval);
  }, [page, selectedStatus]);

  const loadMicroVMs = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20'
      });
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`/api/v1/microvms?${params}`);
      const data: MicroVMListResponse = await response.json();
      
      setMicrovms(data.microvms);
      setTotalPages(data.total_pages);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load MicroVMs:', error);
      setLoading(false);
    }
  };

  const handleStartMicroVM = async (microvmId: number) => {
    try {
      const response = await fetch(`/api/v1/microvms/${microvmId}/start`, {
        method: 'POST'
      });
      
      if (response.ok) {
        loadMicroVMs();
      }
    } catch (error) {
      console.error('Failed to start MicroVM:', error);
    }
  };

  const handleStopMicroVM = async (microvmId: number) => {
    try {
      const response = await fetch(`/api/v1/microvms/${microvmId}/stop`, {
        method: 'POST'
      });
      
      if (response.ok) {
        loadMicroVMs();
      }
    } catch (error) {
      console.error('Failed to stop MicroVM:', error);
    }
  };

  const handleDeleteMicroVM = async (microvmId: number) => {
    if (!confirm('Are you sure you want to delete this MicroVM? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/microvms/${microvmId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadMicroVMs();
      }
    } catch (error) {
      console.error('Failed to delete MicroVM:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'creating': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'running': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'stopped': return <Square className="w-4 h-4 text-gray-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'destroying': return <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />;
      case 'destroyed': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'creating': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'destroying': return 'bg-orange-100 text-orange-800';
      case 'destroyed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRuntimeIcon = (runtime: string) => {
    switch (runtime) {
      case 'node': return <Code className="w-4 h-4 text-green-500" />;
      case 'python': return <Code className="w-4 h-4 text-blue-500" />;
      case 'go': return <Code className="w-4 h-4 text-cyan-500" />;
      case 'rust': return <Code className="w-4 h-4 text-orange-500" />;
      case 'java': return <Code className="w-4 h-4 text-red-500" />;
      case 'dotnet': return <Code className="w-4 h-4 text-purple-500" />;
      default: return <Code className="w-4 h-4 text-gray-500" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MicroVMs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">MicroVMs</h2>
          <p className="text-gray-600">Manage your Firecracker microVMs</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="creating">Creating</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="failed">Failed</option>
          </select>
          <Button
            onClick={loadMicroVMs}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total MicroVMs</p>
                <p className="text-2xl font-bold text-gray-900">{microvms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-bold text-gray-900">
                  {microvms.filter(vm => vm.status === 'running').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {microvms.length > 0 
                    ? Math.round(microvms.reduce((sum, vm) => sum + vm.cpu_usage_percent, 0) / microvms.length)
                    : 0}%
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(microvms.reduce((sum, vm) => sum + vm.memory_usage_mb, 0) / 1024)} GB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MicroVMs List */}
      {microvms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No MicroVMs Found</h3>
            <p className="text-gray-600 mb-6">Create your first MicroVM to get started</p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Zap className="w-4 h-4 mr-2" />
              Create MicroVM
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {microvms.map((microvm) => (
            <Card key={microvm.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRuntimeIcon(microvm.runtime)}
                    <div>
                      <CardTitle className="text-lg">{microvm.name}</CardTitle>
                      <p className="text-sm text-gray-600">{microvm.vm_id}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(microvm.status)}>
                    {getStatusIcon(microvm.status)}
                    <span className="ml-1">{microvm.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Description */}
                  {microvm.description && (
                    <p className="text-sm text-gray-600">{microvm.description}</p>
                  )}

                  {/* Resource Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>{microvm.cpu_usage_percent}%</span>
                    </div>
                    <Progress value={microvm.cpu_usage_percent} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Memory</span>
                      <span>{Math.round(microvm.memory_usage_mb / 1024)} GB</span>
                    </div>
                    <Progress value={(microvm.memory_usage_mb / microvm.memory_mb) * 100} className="h-2" />
                  </div>

                  {/* Configuration */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Region: {microvm.region}</div>
                    <div>CPU: {microvm.cpu_cores} cores</div>
                    <div>Memory: {microvm.memory_mb} MB</div>
                    <div>Storage: {microvm.storage_gb} GB</div>
                    {microvm.gpu_enabled && <div className="text-purple-600">GPU Enabled</div>}
                    {microvm.auto_scale && <div className="text-blue-600">Auto-scale Enabled</div>}
                  </div>

                  {/* Dev URL */}
                  {microvm.dev_url && (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(microvm.dev_url, '_blank')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open Dev URL
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(microvm.dev_url!)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    {microvm.status === 'running' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStopMicroVM(microvm.id)}
                      >
                        <Square className="w-3 h-3 mr-1" />
                        Stop
                      </Button>
                    ) : microvm.status === 'stopped' ? (
                      <Button
                        size="sm"
                        onClick={() => handleStartMicroVM(microvm.id)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    ) : null}
                    
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Settings
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMicroVM(microvm.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default MicroVMDashboard;