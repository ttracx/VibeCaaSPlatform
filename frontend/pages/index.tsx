import { useEffect, useState } from 'react'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState('user@example.com')
  const [username, setUsername] = useState('user')
  const [password, setPassword] = useState('password123')
  const [apps, setApps] = useState<any[]>([])
  const [appName, setAppName] = useState('my-app')

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (t) setToken(t)
  }, [])

  const register = async () => {
    await axios.post(`${API}/api/v1/auth/register`, { email, username, password })
    alert('Registered! Now login.')
  }

  const login = async () => {
    const { data } = await axios.post(`${API}/api/v1/auth/login`, { email, password })
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
  }

  const fetchApps = async () => {
    if (!token) return
    const { data } = await axios.get(`${API}/api/v1/apps`, { headers: { Authorization: `Bearer ${token}` } })
    setApps(data)
  }

  const createApp = async () => {
    if (!token) return
    const { data } = await axios.post(
      `${API}/api/v1/apps`,
      { name: appName, framework: 'python', gpu_enabled: false },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    setApps([data, ...apps])
  }

  const action = async (id: string, act: 'start' | 'stop' | 'restart' | 'delete') => {
    if (!token) return
    if (act === 'delete') {
      await axios.delete(`${API}/api/v1/apps/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setApps(apps.filter(a => a.id !== id))
      return
    }
    await axios.post(`${API}/api/v1/apps/${id}/${act}`, {}, { headers: { Authorization: `Bearer ${token}` } })
    fetchApps()
  }

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1>VibeCaaS (Local MVP)</h1>

      {!token ? (
        <section style={{ marginTop: 20 }}>
          <h2>Auth</h2>
          <div style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
            <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={register}>Register</button>
              <button onClick={login}>Login</button>
            </div>
          </div>
        </section>
      ) : (
        <section style={{ marginTop: 20 }}>
          <h2>Apps</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={appName} onChange={e => setAppName(e.target.value)} placeholder="app name" />
            <button onClick={createApp}>Create</button>
            <button onClick={fetchApps}>Refresh</button>
            <button onClick={() => { localStorage.removeItem('token'); setToken(null) }}>Logout</button>
          </div>
          <div style={{ marginTop: 12 }}>
            {apps.map(a => (
              <div key={a.id} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{a.name}</strong> <small>({a.framework})</small>
                    <div>Status: {a.status}</div>
                    {a.url && (
                      <div>
                        URL: <a href={a.url} target="_blank" rel="noreferrer">{a.url}</a>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => action(a.id, 'start')}>Start</button>
                    <button onClick={() => action(a.id, 'stop')}>Stop</button>
                    <button onClick={() => action(a.id, 'restart')}>Restart</button>
                    <button onClick={() => action(a.id, 'delete')}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

