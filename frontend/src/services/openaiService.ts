import OpenAI from 'openai'

// Lazy initialization to avoid errors at module load time
let openai: OpenAI | null = null

const getOpenAI = () => {
  if (!openai) {
    try {
      openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true // Only for demo purposes
      })
    } catch (error) {
      console.warn('Failed to initialize OpenAI client:', error)
      return null
    }
  }
  return openai
}

export interface AppSuggestion {
  name: string
  description: string
  image: string
  port: number
  resources: {
    cpu: number
    memory: string
    gpu: number
  }
  environment: Record<string, string>
  dockerfile?: string
  reasoning: string
}

export interface DeploymentRequest {
  description: string
  requirements?: string[]
  preferredLanguage?: string
  framework?: string
  database?: string
}

export class OpenAIService {
  static async generateAppSuggestions(request: DeploymentRequest): Promise<AppSuggestion[]> {
    try {
      const openaiClient = getOpenAI()
      if (!openaiClient) {
        console.warn('OpenAI client not available, using fallback suggestions')
        return this.getFallbackSuggestions(request)
      }

      const prompt = this.buildPrompt(request)
      
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert DevOps engineer and containerization specialist. 
            Generate detailed app deployment suggestions for the VibeCaaS platform based on user requirements.
            Always provide practical, production-ready configurations with proper resource allocation.
            Include reasoning for each suggestion and provide Dockerfile when applicable.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      return this.parseSuggestions(response)
    } catch (error) {
      console.error('OpenAI API error:', error)
      // Return fallback suggestions for demo purposes
      return this.getFallbackSuggestions(request)
    }
  }

  static async generateDockerfile(appType: string, requirements: string[]): Promise<string> {
    try {
      const openaiClient = getOpenAI()
      if (!openaiClient) {
        console.warn('OpenAI client not available, using fallback Dockerfile')
        return this.getFallbackDockerfile(appType)
      }

      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert in Docker and containerization. 
            Generate production-ready Dockerfiles optimized for the VibeCaaS platform.
            Include best practices like multi-stage builds, security considerations, and proper layer caching.`
          },
          {
            role: "user",
            content: `Generate a Dockerfile for a ${appType} application with these requirements: ${requirements.join(', ')}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      return completion.choices[0]?.message?.content || this.getFallbackDockerfile(appType)
    } catch (error) {
      console.error('OpenAI API error:', error)
      return this.getFallbackDockerfile(appType)
    }
  }

  private static buildPrompt(request: DeploymentRequest): string {
    let prompt = `Generate 3 app deployment suggestions for the VibeCaaS platform based on this description: "${request.description}"`
    
    if (request.requirements?.length) {
      prompt += `\n\nRequirements: ${request.requirements.join(', ')}`
    }
    
    if (request.preferredLanguage) {
      prompt += `\n\nPreferred Language: ${request.preferredLanguage}`
    }
    
    if (request.framework) {
      prompt += `\n\nFramework: ${request.framework}`
    }
    
    if (request.database) {
      prompt += `\n\nDatabase: ${request.database}`
    }

    prompt += `\n\nFor each suggestion, provide:
    - name: A descriptive app name
    - description: Brief description of what the app does
    - image: Docker image to use (e.g., node:18-alpine, python:3.11-slim)
    - port: Port number for the application
    - resources: CPU cores (0.25-4.0), memory (256Mi-8Gi), GPU count (0-2)
    - environment: Key environment variables needed
    - dockerfile: Optional Dockerfile content if custom image needed
    - reasoning: Why this configuration is suitable

    Format the response as a JSON array of objects.`
    
    return prompt
  }

  private static parseSuggestions(response: string): AppSuggestion[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      console.error('Failed to parse suggestions:', error)
      return this.getFallbackSuggestions({ description: 'web application' })
    }
  }

  private static getFallbackSuggestions(request: DeploymentRequest): AppSuggestion[] {
    const baseSuggestions: AppSuggestion[] = [
      {
        name: "React Frontend App",
        description: "Modern React application with TypeScript and Vite",
        image: "node:18-alpine",
        port: 3000,
        resources: { cpu: 0.5, memory: "512Mi", gpu: 0 },
        environment: { NODE_ENV: "production", PORT: "3000" },
        reasoning: "Lightweight React app perfect for frontend applications"
      },
      {
        name: "Node.js API Server",
        description: "Express.js API server with TypeScript",
        image: "node:18-alpine",
        port: 8000,
        resources: { cpu: 1.0, memory: "1Gi", gpu: 0 },
        environment: { NODE_ENV: "production", PORT: "8000" },
        reasoning: "Robust API server with good performance characteristics"
      },
      {
        name: "Python Flask App",
        description: "Python web application with Flask framework",
        image: "python:3.11-slim",
        port: 5000,
        resources: { cpu: 0.75, memory: "512Mi", gpu: 0 },
        environment: { FLASK_ENV: "production", PORT: "5000" },
        reasoning: "Efficient Python web app with minimal resource usage"
      }
    ]

    // Customize based on request
    if (request.preferredLanguage?.toLowerCase().includes('python')) {
      return baseSuggestions.filter(s => s.name.includes('Python'))
    }
    if (request.preferredLanguage?.toLowerCase().includes('javascript') || request.preferredLanguage?.toLowerCase().includes('typescript')) {
      return baseSuggestions.filter(s => s.name.includes('React') || s.name.includes('Node.js'))
    }

    return baseSuggestions
  }

  private static getFallbackDockerfile(appType: string): string {
    if (appType.toLowerCase().includes('react') || appType.toLowerCase().includes('node')) {
      return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]`
    }
    
    if (appType.toLowerCase().includes('python')) {
      return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]`
    }

    return `FROM nginx:alpine

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`
  }
}