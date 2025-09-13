export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export async function* streamAgentResponse(messages: ChatMessage[]) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const resp = await fetch(`${apiUrl}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true })
  })

  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Agent request failed: ${resp.status} ${text}`)
  }

  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\n\n/)
    buffer = lines.pop() || ''
    for (const block of lines) {
      const line = block.trim()
      if (!line) continue
      // Expect SSE format: data: {json}
      for (const row of line.split('\n')) {
        const m = row.match(/^data:\s*(.*)$/)
        if (!m) continue
        const data = m[1]
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const delta = parsed?.choices?.[0]?.delta?.content
          if (typeof delta === 'string' && delta.length > 0) {
            yield delta
          }
        } catch {
          // Fallback: if not JSON, yield raw line content
          yield data
        }
      }
    }
  }
}

