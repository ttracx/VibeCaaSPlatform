'use client'

import { useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type App = {
  id: string
  name: string
  subdomain: string
  framework: string
  status: string
  url?: string
  gpu_enabled: boolean
  created_at: string
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState('admin@example.com')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [apps, setApps] = useState<App[]>([])
  const [newAppName, setNewAppName] = useState('my-app')

  const register = async () => {
    await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    }).catch(() => {})
  }

  const login = async () => {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setToken(data.access_token)
  }

  const loadApps = async () => {
    if (!token) return
    const res = await fetch(`${API_URL}/api/v1/apps`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setApps(data)
  }

  const createApp = async () => {
    if (!token || !newAppName) return
    await fetch(`${API_URL}/api/v1/apps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newAppName }),
    })
    setNewAppName('')
    loadApps()
  }

  useEffect(() => {
    if (token) {
      loadApps()
    }
  }, [token])

  return (
    <main style={{ padding: 24 }}>
      <h1>VibeCaaS (Local)</h1>
      {!token ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
          <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
          <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
            <input placeholder="new app name" value={newAppName} onChange={e => setNewAppName(e.target.value)} />
            <button onClick={createApp}>Create App</button>
            <button onClick={loadApps}>Refresh</button>
          </div>
          <ul style={{ marginTop: 16 }}>
            {apps.map(app => (
              <li key={app.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <b>{app.name}</b> — {app.status} — {app.url}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}

