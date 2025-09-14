'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Globe, 
  Link, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Copy,
  Settings,
  Server,
  Zap
} from 'lucide-react';

interface App {
  id: number;
  name: string;
  project_id: string;
  status: string;
  dev_url?: string;
}

interface DomainInfo {
  id: number;
  domain: string;
  status: string;
  app_id?: number;
  dns_configured: boolean;
  tls_issued: boolean;
  deployment_bound: boolean;
}

interface DNSRecord {
  id: number;
  type: string;
  host: string;
  answer: string;
  ttl: number;
  created_at: string;
}

const DomainConnect: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [connectionMode, setConnectionMode] = useState<'CNAME' | 'A' | 'AAAA'>('CNAME');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);

  useEffect(() => {
    // Get domain from URL
    const pathParts = window.location.pathname.split('/');
    const domainFromPath = pathParts[pathParts.length - 1];
    setDomain(domainFromPath);
    
    if (domainFromPath) {
      fetchDomainInfo(domainFromPath);
      fetchUserApps();
    }
  }, []);

  const fetchDomainInfo = async (domainName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/domains/${domainName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDomainInfo(data);
        if (data.app_id) {
          setSelectedApp(data.app_id);
        }
        fetchDNSRecords(domainName);
      } else {
        setError('Domain not found or access denied');
      }
    } catch (err) {
      setError('Failed to fetch domain information');
      console.error('Domain fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApps = async () => {
    try {
      const response = await fetch('/api/v1/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApps(data.projects || []);
      }
    } catch (err) {
      console.error('Apps fetch error:', err);
    }
  };

  const fetchDNSRecords = async (domainName: string) => {
    try {
      const response = await fetch(`/api/v1/domains/${domainName}/dns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDnsRecords(data);
      }
    } catch (err) {
      console.error('DNS records fetch error:', err);
    }
  };

  const handleConnect = async () => {
    if (!selectedApp) {
      setError('Please select an app to connect');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const connectData = {
        app_id: selectedApp,
        mode: connectionMode
      };

      const response = await fetch(`/api/v1/domains/${domain}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(connectData)
      });

      const result = await response.json();

      if (result.ok) {
        setSuccess(true);
        // Refresh domain info and DNS records
        fetchDomainInfo(domain);
      } else {
        setError(result.error?.message || 'Connection failed');
      }
    } catch (err) {
      setError('Failed to connect domain');
      console.error('Connection error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'dns_configured': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'propagating': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'tls_issued': return <CheckCircle className="w-5 h-5 text-purple-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'dns_configured': return 'bg-yellow-100 text-yellow-800';
      case 'propagating': return 'bg-blue-100 text-blue-800';
      case 'tls_issued': return 'bg-purple-100 text-purple-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'dns_configured': return 'DNS Configured';
      case 'propagating': return 'Propagating';
      case 'tls_issued': return 'TLS Issued';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading domain information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!domainInfo) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Domain Not Found
            </h2>
            <p className="text-red-700 mb-6">
              The domain you're looking for is not available or you don't have permission to access it.
            </p>
            <Button
              onClick={() => window.location.href = '/domains'}
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Domains
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Domain Connected Successfully!
            </h2>
            <p className="text-green-700 mb-4">
              Your domain <strong>{domain}</strong> is being connected to your app.
            </p>
            <p className="text-sm text-green-600 mb-6">
              DNS records are being configured and SSL certificate will be issued automatically.
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => window.location.href = '/domains'}
                className="bg-green-600 hover:bg-green-700"
              >
                View All Domains
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => window.location.href = '/domains'}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connect Domain</h1>
          <p className="text-gray-600">Connect {domain} to your VibeCaaS app</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Domain Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Domain Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{domain}</span>
              <Badge className={getStatusColor(domainInfo.status)}>
                {getStatusIcon(domainInfo.status)}
                <span className="ml-1">{getStatusText(domainInfo.status)}</span>
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">DNS Configured</span>
                <span className={domainInfo.dns_configured ? 'text-green-600' : 'text-gray-400'}>
                  {domainInfo.dns_configured ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">TLS Certificate</span>
                <span className={domainInfo.tls_issued ? 'text-green-600' : 'text-gray-400'}>
                  {domainInfo.tls_issued ? 'Issued' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">App Connected</span>
                <span className={domainInfo.deployment_bound ? 'text-green-600' : 'text-gray-400'}>
                  {domainInfo.deployment_bound ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {domainInfo.app_id && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Connected to App:</strong> {apps.find(app => app.id === domainInfo.app_id)?.name || 'Unknown'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link className="w-5 h-5 mr-2" />
              Connection Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select App
              </label>
              <select
                value={selectedApp || ''}
                onChange={(e) => setSelectedApp(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose an app...</option>
                {apps.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.project_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connection Mode
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cname"
                    name="mode"
                    value="CNAME"
                    checked={connectionMode === 'CNAME'}
                    onChange={(e) => setConnectionMode(e.target.value as 'CNAME')}
                    className="text-purple-600"
                  />
                  <label htmlFor="cname" className="text-sm text-gray-700">
                    CNAME (Recommended) - Points to {selectedApp ? apps.find(app => app.id === selectedApp)?.project_id : 'app'}.apps.vibecaas.com
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="a"
                    name="mode"
                    value="A"
                    checked={connectionMode === 'A'}
                    onChange={(e) => setConnectionMode(e.target.value as 'A')}
                    className="text-purple-600"
                  />
                  <label htmlFor="a" className="text-sm text-gray-700">
                    A Record - Points directly to our IP address
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="aaaa"
                    name="mode"
                    value="AAAA"
                    checked={connectionMode === 'AAAA'}
                    onChange={(e) => setConnectionMode(e.target.value as 'AAAA')}
                    className="text-purple-600"
                  />
                  <label htmlFor="aaaa" className="text-sm text-gray-700">
                    AAAA Record - Points to our IPv6 address
                  </label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              disabled={connecting || !selectedApp}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {connecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Connect Domain
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DNS Records */}
      {dnsRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              DNS Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dnsRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{record.type}</Badge>
                    <span className="font-mono text-sm">{record.host}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-mono text-sm">{record.answer}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">TTL: {record.ttl}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(record.answer)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">DNS Configuration</h4>
                <p className="text-sm text-gray-600">
                  We'll create the necessary DNS records to point your domain to your app.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">DNS Propagation</h4>
                <p className="text-sm text-gray-600">
                  DNS changes will propagate worldwide (usually takes 5-60 minutes).
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">SSL Certificate</h4>
                <p className="text-sm text-gray-600">
                  We'll automatically issue and configure an SSL certificate for your domain.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">4</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Go Live</h4>
                <p className="text-sm text-gray-600">
                  Your domain will be live and accessible at https://{domain}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainConnect;