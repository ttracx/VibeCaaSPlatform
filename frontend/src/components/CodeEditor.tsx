'use client'

import { useState, useEffect, useRef } from 'react'
import { Editor } from '@monaco-editor/react'
import { 
  PlayIcon, 
  StopIcon, 
  ArrowPathIcon, 
  CodeBracketIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface CodeEditorProps {
  isOpen: boolean
  onClose: () => void
  initialCode?: string
  language?: string
  onDeploy?: (code: string, language: string) => void
  appName?: string
}

const languageTemplates = {
  javascript: `// React App Example
import React, { useState, useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Hello VibeCaaS!');

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>{message}</h1>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#6c3aea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
    </div>
  );
}

export default App;`,
  
  python: `# FastAPI Example
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI(title="VibeCaaS Demo API")

@app.get("/")
async def root():
    return {"message": "Hello from VibeCaaS!", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "demo-api"}

@app.get("/demo", response_class=HTMLResponse)
async def demo_page():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>VibeCaaS Demo</title>
        <style>
            body { font-family: Arial; padding: 2rem; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .btn { padding: 10px 20px; background: #6c3aea; color: white; border: none; border-radius: 5px; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 VibeCaaS Demo API</h1>
            <p>Your FastAPI application is running!</p>
            <button class="btn" onclick="fetchData()">Test API</button>
            <div id="result"></div>
        </div>
        <script>
            async function fetchData() {
                const response = await fetch('/');
                const data = await response.json();
                document.getElementById('result').innerHTML = '<p>Response: ' + JSON.stringify(data) + '</p>';
            }
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`,
  
  typescript: `// Next.js App Example
import { useState, useEffect } from 'react';
import Head from 'next/head';

interface AppProps {
  initialCount?: number;
}

export default function App({ initialCount = 0 }: AppProps) {
  const [count, setCount] = useState(initialCount);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCount(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <>
      <Head>
        <title>VibeCaaS Demo App</title>
        <meta name="description" content="A demo application deployed with VibeCaaS" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '2rem',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>
            🚀 VibeCaaS Demo
          </h1>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>
            Your Next.js application is running!
          </p>
          
          <div style={{ fontSize: '3rem', marginBottom: '2rem', fontWeight: 'bold' }}>
            {count}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: isRunning ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {isRunning ? 'Stop' : 'Start'} Timer
            </button>
            
            <button
              onClick={() => setCount(0)}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#6c3aea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}`,
  
  go: `package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
)

type Response struct {
    Message string    \`json:"message"\`
    Time    time.Time \`json:"time"\`
    Status  string    \`json:"status"\`
}

type Counter struct {
    Count int \`json:"count"\`
}

var counter Counter

func main() {
    http.HandleFunc("/", homeHandler)
    http.HandleFunc("/api/counter", counterHandler)
    http.HandleFunc("/api/health", healthHandler)
    
    fmt.Println("🚀 VibeCaaS Demo Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
    html := \`
    <!DOCTYPE html>
    <html>
    <head>
        <title>VibeCaaS Go Demo</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                padding: 2rem; 
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                padding: 2rem;
                border-radius: 16px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                max-width: 500px;
            }
            .btn {
                padding: 12px 24px;
                background: #6c3aea;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                margin: 0.5rem;
            }
            .btn:hover { background: #5a2dd1; }
            #result { margin-top: 1rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 VibeCaaS Go Demo</h1>
            <p>Your Go application is running!</p>
            <button class="btn" onclick="fetchCounter()">Get Counter</button>
            <button class="btn" onclick="incrementCounter()">Increment</button>
            <div id="result"></div>
        </div>
        <script>
            async function fetchCounter() {
                try {
                    const response = await fetch('/api/counter');
                    const data = await response.json();
                    document.getElementById('result').innerHTML = '<p>Counter: ' + data.count + '</p>';
                } catch (error) {
                    document.getElementById('result').innerHTML = '<p>Error: ' + error.message + '</p>';
                }
            }
            
            async function incrementCounter() {
                try {
                    const response = await fetch('/api/counter', { method: 'POST' });
                    const data = await response.json();
                    document.getElementById('result').innerHTML = '<p>Counter: ' + data.count + '</p>';
                } catch (error) {
                    document.getElementById('result').innerHTML = '<p>Error: ' + error.message + '</p>';
                }
            }
        </script>
    </body>
    </html>
    \`
    
    w.Header().Set("Content-Type", "text/html")
    w.Write([]byte(html))
}

func counterHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    
    if r.Method == "POST" {
        counter.Count++
    }
    
    json.NewEncoder(w).Encode(counter)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    response := Response{
        Message: "VibeCaaS Go Demo is healthy",
        Time:    time.Now(),
        Status:  "healthy",
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}`
}

export function CodeEditor({ 
  isOpen, 
  onClose, 
  initialCode, 
  language = 'javascript',
  onDeploy,
  appName = 'demo-app'
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode || languageTemplates[language as keyof typeof languageTemplates] || languageTemplates.javascript)
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'building' | 'deploying' | 'success' | 'error'>('idle')
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([])
  const editorRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen) {
      setCode(languageTemplates[selectedLanguage as keyof typeof languageTemplates] || languageTemplates.javascript)
    }
  }, [isOpen, selectedLanguage])

  const handleDeploy = async () => {
    if (!onDeploy) return
    
    setIsDeploying(true)
    setDeploymentStatus('building')
    setDeploymentLogs([])
    
    // Simulate deployment process
    const logs = [
      '🚀 Starting deployment process...',
      '📦 Building application container...',
      '🔍 Analyzing code structure...',
      '⚙️ Configuring resources...',
      '🌐 Deploying to VibeCaaS infrastructure...',
      '✅ Application deployed successfully!',
      '🔗 Application is now available at: https://demo-app.vibecaas.com'
    ]
    
    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setDeploymentLogs(prev => [...prev, logs[i]])
      
      if (i === logs.length - 2) {
        setDeploymentStatus('deploying')
      }
    }
    
    setDeploymentStatus('success')
    setIsDeploying(false)
    
    // Call the actual deploy function
    onDeploy(code, selectedLanguage)
    
    toast.success('Application deployed successfully!')
  }

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage)
    setCode(languageTemplates[newLanguage as keyof typeof languageTemplates] || languageTemplates.javascript)
  }

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CodeBracketIcon className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Live Code Editor
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {appName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
            </select>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <Editor
                height="100%"
                language={selectedLanguage}
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                }}
              />
            </div>
            
            {/* Deployment Controls */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Language: {selectedLanguage}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Lines: {code.split('\n').length}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying || !code.trim()}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeploying ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4" />
                        <span>Deploy App</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Logs */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Deployment Logs
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {deploymentStatus === 'idle' && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <CodeBracketIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ready to deploy your application</p>
                  <p className="text-sm mt-2">Click "Deploy App" to start</p>
                </div>
              )}
              
              {deploymentLogs.length > 0 && (
                <div className="space-y-2">
                  {deploymentLogs.map((log, index) => (
                    <div
                      key={index}
                      className="text-sm font-mono p-2 bg-gray-100 dark:bg-gray-700 rounded"
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
              
              {deploymentStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      Deployment Successful!
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    Your application is now running and accessible.
                  </p>
                </div>
              )}
              
              {deploymentStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-200 font-medium">
                      Deployment Failed
                    </span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    Please check your code and try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}