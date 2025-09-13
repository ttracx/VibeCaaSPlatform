'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { streamAgentResponse, type ChatMessage } from '@/services/agentService'

export default function AgentChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function handleSend() {
    const content = input.trim()
    if (!content || streaming) return
    const nextMessages = [...messages, { role: 'user', content } as ChatMessage]
    setMessages(nextMessages)
    setInput('')
    setStreaming(true)

    let assistantBuffer = ''
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])
    try {
      for await (const chunk of streamAgentResponse(nextMessages)) {
        assistantBuffer += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantBuffer }
          return updated
        })
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${String(err?.message || err)}` }])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">NeuralQuantum SWE Agent</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Agentic Full-Stack SaaS Builder (Kimi K2)</p>

        <div className="card mb-4 max-h-[65vh] overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="text-gray-500 dark:text-gray-400 text-sm">Ask for a vertical slice, e.g., "Build marketing + auth + Stripe"</div>
          )}
          <div className="space-y-6">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-gray-900 dark:text-white' : 'prose prose-sm dark:prose-invert max-w-none'}>
                {m.role === 'user' ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    {m.content}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Describe what to build..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={streaming}
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {streaming ? 'Generating…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

