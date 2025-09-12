import express from 'express'

const router = express.Router()

// Predefined templates
const templates = [
  {
    id: 'react',
    name: 'React App',
    description: 'Create React application with TypeScript',
    image: 'node:18-alpine',
    port: 3000,
    category: 'Frontend',
    tags: ['react', 'typescript', 'frontend'],
    resources: { 
      cpu: '500m', 
      memory: '512Mi' 
    },
    environment: { 
      NODE_ENV: 'production' 
    },
    volumes: []
  },
  {
    id: 'nextjs',
    name: 'Next.js App',
    description: 'Create Next.js application with TypeScript',
    image: 'node:18-alpine',
    port: 3000,
    category: 'Frontend',
    tags: ['nextjs', 'react', 'typescript', 'frontend'],
    resources: { 
      cpu: '500m', 
      memory: '512Mi' 
    },
    environment: { 
      NODE_ENV: 'production' 
    },
    volumes: []
  },
  {
    id: 'vue',
    name: 'Vue.js App',
    description: 'Create Vue.js application with TypeScript',
    image: 'node:18-alpine',
    port: 3000,
    category: 'Frontend',
    tags: ['vue', 'typescript', 'frontend'],
    resources: { 
      cpu: '500m', 
      memory: '512Mi' 
    },
    environment: { 
      NODE_ENV: 'production' 
    },
    volumes: []
  },
  {
    id: 'python-flask',
    name: 'Python Flask',
    description: 'Create Python Flask web application',
    image: 'python:3.11-slim',
    port: 5000,
    category: 'Backend',
    tags: ['python', 'flask', 'backend', 'api'],
    resources: { 
      cpu: '500m', 
      memory: '512Mi' 
    },
    environment: { 
      FLASK_ENV: 'production' 
    },
    volumes: []
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    description: 'Create FastAPI Python application',
    image: 'python:3.11-slim',
    port: 8000,
    category: 'Backend',
    tags: ['python', 'fastapi', 'backend', 'api'],
    resources: { 
      cpu: '500m', 
      memory: '512Mi' 
    },
    environment: { 
      PYTHONPATH: '/app' 
    },
    volumes: []
  },
  {
    id: 'django',
    name: 'Django',
    description: 'Create Django Python web application',
    image: 'python:3.11-slim',
    port: 8000,
    category: 'Backend',
    tags: ['python', 'django', 'backend', 'web'],
    resources: { 
      cpu: '500m', 
      memory: '512Mi' 
    },
    environment: { 
      DJANGO_SETTINGS_MODULE: 'settings.production' 
    },
    volumes: []
  },
  {
    id: 'golang',
    name: 'Go Web Server',
    description: 'Create Go web server application',
    image: 'golang:1.21-alpine',
    port: 8080,
    category: 'Backend',
    tags: ['golang', 'go', 'backend', 'api'],
    resources: { 
      cpu: '500m', 
      memory: '512Mi' 
    },
    environment: { 
      CGO_ENABLED: '0' 
    },
    volumes: []
  },
  {
    id: 'rust',
    name: 'Rust Web Server',
    description: 'Create Rust web server with Actix',
    image: 'rust:1.75-alpine',
    port: 8080,
    category: 'Backend',
    tags: ['rust', 'actix', 'backend', 'api'],
    resources: { 
      cpu: '500m', 
      memory: '512Mi' 
    },
    environment: { 
      RUST_LOG: 'info' 
    },
    volumes: []
  },
  {
    id: 'nodejs',
    name: 'Node.js API',
    description: 'Create Node.js Express API server',
    image: 'node:18-alpine',
    port: 3000,
    category: 'Backend',
    tags: ['nodejs', 'express', 'backend', 'api'],
    resources: { 
      cpu: '500m', 
      memory: '512Mi' 
    },
    environment: { 
      NODE_ENV: 'production' 
    },
    volumes: []
  },
  {
    id: 'postgres',
    name: 'PostgreSQL Database',
    description: 'Create PostgreSQL database instance',
    image: 'postgres:15-alpine',
    port: 5432,
    category: 'Database',
    tags: ['postgres', 'database', 'sql'],
    resources: { 
      cpu: '500m', 
      memory: '1Gi' 
    },
    environment: { 
      POSTGRES_DB: 'appdb',
      POSTGRES_USER: 'appuser',
      POSTGRES_PASSWORD: 'apppass'
    },
    volumes: [{
      name: 'postgres-data',
      mountPath: '/var/lib/postgresql/data',
      size: '10Gi'
    }]
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    description: 'Create Redis cache instance',
    image: 'redis:7-alpine',
    port: 6379,
    category: 'Database',
    tags: ['redis', 'cache', 'database'],
    resources: { 
      cpu: '250m', 
      memory: '256Mi' 
    },
    environment: {},
    volumes: []
  },
  {
    id: 'mongodb',
    name: 'MongoDB Database',
    description: 'Create MongoDB database instance',
    image: 'mongo:7',
    port: 27017,
    category: 'Database',
    tags: ['mongodb', 'database', 'nosql'],
    resources: { 
      cpu: '500m', 
      memory: '1Gi' 
    },
    environment: { 
      MONGO_INITDB_ROOT_USERNAME: 'admin',
      MONGO_INITDB_ROOT_PASSWORD: 'password'
    },
    volumes: [{
      name: 'mongodb-data',
      mountPath: '/data/db',
      size: '10Gi'
    }]
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow ML',
    description: 'Create TensorFlow machine learning application',
    image: 'tensorflow/tensorflow:latest-gpu',
    port: 8888,
    category: 'AI/ML',
    tags: ['tensorflow', 'machine-learning', 'ai', 'gpu'],
    resources: { 
      cpu: '1000m', 
      memory: '2Gi',
      gpu: '1'
    },
    environment: { 
      JUPYTER_ENABLE_LAB: 'yes' 
    },
    volumes: [{
      name: 'ml-data',
      mountPath: '/workspace',
      size: '20Gi'
    }]
  },
  {
    id: 'pytorch',
    name: 'PyTorch ML',
    description: 'Create PyTorch machine learning application',
    image: 'pytorch/pytorch:latest-gpu',
    port: 8888,
    category: 'AI/ML',
    tags: ['pytorch', 'machine-learning', 'ai', 'gpu'],
    resources: { 
      cpu: '1000m', 
      memory: '2Gi',
      gpu: '1'
    },
    environment: { 
      JUPYTER_ENABLE_LAB: 'yes' 
    },
    volumes: [{
      name: 'ml-data',
      mountPath: '/workspace',
      size: '20Gi'
    }]
  }
]

// Get all templates
router.get('/', (req, res) => {
  const { category, tag, search } = req.query
  
  let filteredTemplates = [...templates]
  
  // Filter by category
  if (category) {
    filteredTemplates = filteredTemplates.filter(t => 
      t.category.toLowerCase() === (category as string).toLowerCase()
    )
  }
  
  // Filter by tag
  if (tag) {
    filteredTemplates = filteredTemplates.filter(t => 
      t.tags.some(tagName => 
        tagName.toLowerCase().includes((tag as string).toLowerCase())
      )
    )
  }
  
  // Search by name or description
  if (search) {
    const searchTerm = (search as string).toLowerCase()
    filteredTemplates = filteredTemplates.filter(t => 
      t.name.toLowerCase().includes(searchTerm) ||
      t.description.toLowerCase().includes(searchTerm) ||
      t.tags.some(tagName => tagName.toLowerCase().includes(searchTerm))
    )
  }
  
  res.json(filteredTemplates)
})

// Get single template
router.get('/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id)
  if (!template) {
    return res.status(404).json({ error: 'Template not found' })
  }
  res.json(template)
})

// Get template categories
router.get('/categories/list', (req, res) => {
  const categories = [...new Set(templates.map(t => t.category))]
  res.json(categories)
})

// Get template tags
router.get('/tags/list', (req, res) => {
  const tags = [...new Set(templates.flatMap(t => t.tags))]
  res.json(tags)
})

export default router