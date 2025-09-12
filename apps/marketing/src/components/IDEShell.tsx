'use client';

import { useEffect, useRef, useState } from 'react';
import { Container } from '@vibecaas/ui';

// Mock Monaco Editor component
function MonacoEditor({ 
  value, 
  onChange, 
  language = 'typescript',
  theme = 'vs-dark',
  className 
}: {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  className?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Mock editor initialization
    const loadEditor = async () => {
      // Simulate loading Monaco Editor
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoaded(true);
    };

    loadEditor();
  }, []);

  if (!isLoaded) {
    return (
      <div className={`bg-gray-900 text-white p-4 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" />
          <span className="text-sm">Loading Monaco Editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 text-white rounded-lg overflow-hidden ${className}`}>
      {/* Editor Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <span className="text-sm text-gray-300">app.tsx</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">TypeScript</span>
          <div className="w-2 h-2 bg-green-400 rounded-full" />
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4 font-mono text-sm">
        <div className="space-y-1">
          {value.split('\n').map((line, index) => (
            <div key={index} className="flex">
              <span className="text-gray-500 w-8 text-right mr-4 select-none">
                {index + 1}
              </span>
              <span className="flex-1">{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mock Yjs presence component
function PresenceIndicator({ 
  users, 
  className 
}: { 
  users: Array<{ id: string; name: string; color: string; cursor: { line: number; column: number } }>;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Online Users</h4>
      {users.map((user) => (
        <div key={user.id} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: user.color }}
          />
          <span className="text-sm text-gray-600">{user.name}</span>
          <span className="text-xs text-gray-400">
            L{user.cursor.line}:C{user.cursor.column}
          </span>
        </div>
      ))}
    </div>
  );
}

export function IDEShell() {
  const [code, setCode] = useState(`import React from 'react';
import { useState, useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Hello VibeCaaS!');

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{message}</h1>
      <p className="text-lg mb-4">Count: {count}</p>
      <button 
        onClick={() => setCount(0)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Reset
      </button>
    </div>
  );
}

export default App;`);

  const [users] = useState([
    { id: '1', name: 'Alice Johnson', color: '#3B82F6', cursor: { line: 5, column: 12 } },
    { id: '2', name: 'Bob Smith', color: '#10B981', cursor: { line: 12, column: 8 } },
  ]);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">VibeCaaS IDE</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Deploy
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-6">
            {/* File Explorer */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Files</h3>
              <div className="space-y-1">
                <div className="text-sm text-gray-600 py-1 px-2 bg-primary-50 rounded">
                  📄 app.tsx
                </div>
                <div className="text-sm text-gray-500 py-1 px-2">
                  📄 package.json
                </div>
                <div className="text-sm text-gray-500 py-1 px-2">
                  📄 tsconfig.json
                </div>
              </div>
            </div>

            {/* AI Agents */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">AI Agents</h3>
              <div className="space-y-2">
                <div className="text-xs text-gray-600 py-2 px-2 bg-green-50 rounded border border-green-200">
                  🤖 Code Assistant
                  <div className="text-gray-500">Active</div>
                </div>
                <div className="text-xs text-gray-600 py-2 px-2 bg-blue-50 rounded border border-blue-200">
                  🔍 Debug Helper
                  <div className="text-gray-500">Standby</div>
                </div>
              </div>
            </div>

            {/* Presence */}
            <PresenceIndicator users={users} />
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor */}
          <div className="flex-1 p-4">
            <MonacoEditor
              value={code}
              onChange={setCode}
              language="typescript"
              className="h-full"
            />
          </div>

          {/* Terminal */}
          <div className="h-48 bg-gray-900 text-green-400 p-4 font-mono text-sm">
            <div className="mb-2">
              <span className="text-blue-400">$</span> npm run dev
            </div>
            <div className="text-gray-400">
              ✓ Starting development server...
            </div>
            <div className="text-gray-400">
              ✓ Server running on http://localhost:3000
            </div>
            <div className="text-gray-400">
              ✓ Hot reload enabled
            </div>
            <div className="mt-2">
              <span className="text-blue-400">$</span> <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}