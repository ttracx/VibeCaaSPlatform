import { Router } from 'express'
import axios from 'axios'

const router = Router()

// Stream Chat Completions via NVIDIA Integrate API
router.post('/chat', async (req, res) => {
  try {
    const { messages, temperature = 0.6, top_p = 0.9, frequency_penalty = 0, presence_penalty = 0, max_tokens = 4096, stream = true } = req.body || {}

    const systemPrompt = require('@/services/agent/systemPrompt').NEURAL_QUANTUM_SYSTEM_PROMPT as string

    const nvidiaApiKey = process.env.NVIDIA_API_KEY
    if (!nvidiaApiKey) {
      res.status(500).json({ error: 'Missing NVIDIA_API_KEY env' })
      return
    }

    const invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions'

    const payload = {
      model: 'moonshotai/kimi-k2-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        ...(Array.isArray(messages) ? messages : [])
      ],
      temperature,
      top_p,
      frequency_penalty,
      presence_penalty,
      max_tokens,
      stream
    }

    const nvidiaResponse = await axios.post(invokeUrl, payload, {
      headers: {
        Authorization: `Bearer ${nvidiaApiKey}`,
        Accept: stream ? 'text/event-stream' : 'application/json',
        'Content-Type': 'application/json'
      },
      responseType: stream ? 'stream' : 'json',
      timeout: 600000
    })

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.flushHeaders?.()

      nvidiaResponse.data.on('data', (chunk: Buffer) => {
        res.write(chunk)
      })
      nvidiaResponse.data.on('end', () => {
        res.end()
      })
      nvidiaResponse.data.on('error', (err: any) => {
        res.write(`data: ${JSON.stringify({ error: 'stream_error', message: String(err?.message || err) })}\n\n`)
        res.end()
      })
    } else {
      res.json(nvidiaResponse.data)
    }
  } catch (error: any) {
    const status = error?.response?.status || 500
    const data = error?.response?.data
    res.status(status).json({ error: 'agent_proxy_error', detail: data || String(error?.message || error) })
  }
})

export default router

