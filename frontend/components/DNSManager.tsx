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
  Globe, 
  Server, 
  Mail, 
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface DNSRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  host: string;
  answer: string;
  ttl: number;
  record_id?: string;
  created_at: string;
  updated_at: string;
}

interface DNSManagerProps {
  domainId: string;
  domainName: string;
}

const DNSManager: React.FC<DNSManagerProps> = ({ domainId, domainName }) => {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<DNSRecord>>({
    type: 'A',
    host: '@',
    answer: '',
    ttl: 300
  });

  useEffect(() => {
    fetchDNSRecords();
  }, [domainId]);

  const fetchDNSRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/domains/${domainId}/dns`);
      const data = await response.json();
      
      if (data.ok) {
        setRecords(data.data || []);
      } else {
        console.error('Error fetching DNS records:', data.error);
      }
    } catch (error) {
      console.error('Error fetching DNS records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async () => {
    try {
      const response = await fetch(`/api/v1/domains/${domainId}/dns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      });

      const data = await response.json();
      
      if (data.ok) {
        setRecords([...records, data.data]);
        setNewRecord({
          type: 'A',
          host: '@',
          answer: '',
          ttl: 300
        });
        setShowAddForm(false);
      } else {
        console.error('Error adding DNS record:', data.error);
      }
    } catch (error) {
      console.error('Error adding DNS record:', error);
    }
  };

  const handleUpdateRecord = async (recordId: string, updatedRecord: Partial<DNSRecord>) => {
    try {
      const response = await fetch(`/api/v1/domains/${domainId}/dns/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRecord),
      });

      const data = await response.json();
      
      if (data.ok) {
        setRecords(records.map(record => 
          record.id === recordId ? { ...record, ...updatedRecord } : record
        ));
        setEditingRecord(null);
      } else {
        console.error('Error updating DNS record:', data.error);
      }
    } catch (error) {
      console.error('Error updating DNS record:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const response = await fetch(`/api/v1/domains/${domainId}/dns/${recordId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.ok) {
        setRecords(records.filter(record => record.id !== recordId));
      } else {
        console.error('Error deleting DNS record:', data.error);
      }
    } catch (error) {
      console.error('Error deleting DNS record:', error);
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'A':
      case 'AAAA':
        return <Server className="w-4 h-4" />;
      case 'CNAME':
        return <Globe className="w-4 h-4" />;
      case 'MX':
        return <Mail className="w-4 h-4" />;
      case 'TXT':
        return <AlertCircle className="w-4 h-4" />;
      case 'NS':
        return <Server className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'A':
      case 'AAAA':
        return 'bg-blue-100 text-blue-600';
      case 'CNAME':
        return 'bg-green-100 text-green-600';
      case 'MX':
        return 'bg-purple-100 text-purple-600';
      case 'TXT':
        return 'bg-yellow-100 text-yellow-600';
      case 'NS':
        return 'bg-gray-100 text-gray-600';
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
            <span>Loading DNS records...</span>
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
          <h2 className="text-2xl font-bold text-gray-900">DNS Management</h2>
          <p className="text-gray-600">Manage DNS records for {domainName}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={fetchDNSRecords}
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
            Add Record
          </Button>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add DNS Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="A">A</option>
                  <option value="AAAA">AAAA</option>
                  <option value="CNAME">CNAME</option>
                  <option value="MX">MX</option>
                  <option value="TXT">TXT</option>
                  <option value="NS">NS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host
                </label>
                <input
                  type="text"
                  value={newRecord.host}
                  onChange={(e) => setNewRecord({ ...newRecord, host: e.target.value })}
                  placeholder="@"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <input
                  type="text"
                  value={newRecord.answer}
                  onChange={(e) => setNewRecord({ ...newRecord, answer: e.target.value })}
                  placeholder="192.168.1.1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TTL
                </label>
                <input
                  type="number"
                  value={newRecord.ttl}
                  onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleAddRecord}>
                Add Record
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DNS Records List */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No DNS records found</p>
              <p className="text-sm">Add your first DNS record to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getRecordColor(record.type)}`}>
                      {getRecordIcon(record.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{record.type}</Badge>
                        <span className="font-medium">{record.host}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {record.answer}
                      </div>
                      <div className="text-xs text-gray-500">
                        TTL: {record.ttl}s
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setEditingRecord(record)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteRecord(record.id)}
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

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit DNS Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editingRecord.type}
                    onChange={(e) => setEditingRecord({ ...editingRecord, type: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="A">A</option>
                    <option value="AAAA">AAAA</option>
                    <option value="CNAME">CNAME</option>
                    <option value="MX">MX</option>
                    <option value="TXT">TXT</option>
                    <option value="NS">NS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host
                  </label>
                  <input
                    type="text"
                    value={editingRecord.host}
                    onChange={(e) => setEditingRecord({ ...editingRecord, host: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer
                  </label>
                  <input
                    type="text"
                    value={editingRecord.answer}
                    onChange={(e) => setEditingRecord({ ...editingRecord, answer: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TTL
                  </label>
                  <input
                    type="number"
                    value={editingRecord.ttl}
                    onChange={(e) => setEditingRecord({ ...editingRecord, ttl: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  onClick={() => setEditingRecord(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateRecord(editingRecord.id, editingRecord)}
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

export default DNSManager;
