'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface URLForwarding {
  id: string;
  domain_id: string;
  subdomain: string;
  destination_url: string;
  type: 'permanent' | 'temporary';
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  updated_at: string;
}

interface URLForwardingProps {
  domainId: string;
  domainName: string;
}

const URLForwarding: React.FC<URLForwardingProps> = ({ domainId, domainName }) => {
  const [forwardings, setForwardings] = useState<URLForwarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingForwarding, setEditingForwarding] = useState<URLForwarding | null>(null);
  const [newForwarding, setNewForwarding] = useState<Partial<URLForwarding>>({
    subdomain: '',
    destination_url: '',
    type: 'permanent'
  });

  useEffect(() => {
    fetchURLForwardings();
  }, [domainId]);

  const fetchURLForwardings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/domains/${domainId}/forwarding`);
      const data = await response.json();
      
      if (data.ok) {
        setForwardings(data.data || []);
      } else {
        console.error('Error fetching URL forwardings:', data.error);
      }
    } catch (error) {
      console.error('Error fetching URL forwardings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddForwarding = async () => {
    try {
      const response = await fetch(`/api/v1/domains/${domainId}/forwarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newForwarding),
      });

      const data = await response.json();
      
      if (data.ok) {
        setForwardings([...forwardings, data.data]);
        setNewForwarding({
          subdomain: '',
          destination_url: '',
          type: 'permanent'
        });
        setShowAddForm(false);
      } else {
        console.error('Error adding URL forwarding:', data.error);
      }
    } catch (error) {
      console.error('Error adding URL forwarding:', error);
    }
  };

  const handleUpdateForwarding = async (forwardingId: string, updatedForwarding: Partial<URLForwarding>) => {
    try {
      const response = await fetch(`/api/v1/domains/${domainId}/forwarding/${forwardingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedForwarding),
      });

      const data = await response.json();
      
      if (data.ok) {
        setForwardings(forwardings.map(forwarding => 
          forwarding.id === forwardingId ? { ...forwarding, ...updatedForwarding } : forwarding
        ));
        setEditingForwarding(null);
      } else {
        console.error('Error updating URL forwarding:', data.error);
      }
    } catch (error) {
      console.error('Error updating URL forwarding:', error);
    }
  };

  const handleDeleteForwarding = async (forwardingId: string) => {
    try {
      const response = await fetch(`/api/v1/domains/${domainId}/forwarding/${forwardingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.ok) {
        setForwardings(forwardings.filter(forwarding => forwarding.id !== forwardingId));
      } else {
        console.error('Error deleting URL forwarding:', data.error);
      }
    } catch (error) {
      console.error('Error deleting URL forwarding:', error);
    }
  };

  const handleToggleStatus = async (forwardingId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await handleUpdateForwarding(forwardingId, { status: newStatus });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'permanent':
        return 'bg-blue-100 text-blue-600';
      case 'temporary':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading URL forwardings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">URL Forwarding</h2>
          <p className="text-gray-600">Manage URL forwarding rules for {domainName}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={fetchURLForwardings}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Forwarding
          </Button>
        </div>
      </div>

      {/* Add Forwarding Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add URL Forwarding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subdomain
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newForwarding.subdomain}
                    onChange={(e) => setNewForwarding({ ...newForwarding, subdomain: e.target.value })}
                    placeholder="www"
                    className="flex-1 p-2 border border-gray-300 rounded-l-md"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                    .{domainName}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  value={newForwarding.destination_url}
                  onChange={(e) => setNewForwarding({ ...newForwarding, destination_url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newForwarding.type}
                  onChange={(e) => setNewForwarding({ ...newForwarding, type: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="permanent">Permanent (301)</option>
                  <option value="temporary">Temporary (302)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleAddForwarding}>
                Add Forwarding
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* URL Forwardings List */}
      <Card>
        <CardHeader>
          <CardTitle>Forwarding Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {forwardings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ExternalLink className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No URL forwardings found</p>
              <p className="text-sm">Add your first forwarding rule to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {forwardings.map((forwarding) => (
                <div
                  key={forwarding.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(forwarding.status)}
                      <Badge className={getStatusColor(forwarding.status)}>
                        {forwarding.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {forwarding.subdomain}.{domainName}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {forwarding.destination_url}
                      </span>
                    </div>
                    <Badge className={getTypeColor(forwarding.type)}>
                      {forwarding.type === 'permanent' ? '301' : '302'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleToggleStatus(forwarding.id, forwarding.status)}
                      size="sm"
                      variant="outline"
                    >
                      {forwarding.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      onClick={() => setEditingForwarding(forwarding)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteForwarding(forwarding.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Forwarding Modal */}
      {editingForwarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit URL Forwarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subdomain
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editingForwarding.subdomain}
                      onChange={(e) => setEditingForwarding({ ...editingForwarding, subdomain: e.target.value })}
                      className="flex-1 p-2 border border-gray-300 rounded-l-md"
                    />
                    <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                      .{domainName}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    value={editingForwarding.destination_url}
                    onChange={(e) => setEditingForwarding({ ...editingForwarding, destination_url: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editingForwarding.type}
                    onChange={(e) => setEditingForwarding({ ...editingForwarding, type: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="permanent">Permanent (301)</option>
                    <option value="temporary">Temporary (302)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  onClick={() => setEditingForwarding(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateForwarding(editingForwarding.id, editingForwarding)}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default URLForwarding;
