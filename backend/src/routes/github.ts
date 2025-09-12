import express from 'express'
import Joi from 'joi'
import { GitHubService } from '../services/GitHubService'
import { logger } from '../utils/logger'

const router = express.Router()

// Validation schemas
const repositoryAnalysisSchema = Joi.object({
  owner: Joi.string().required(),
  repo: Joi.string().required(),
  branch: Joi.string().optional()
})

// Get GitHub OAuth URL
router.get('/auth/url', async (req, res, next) => {
  try {
    const authUrl = await GitHubService.getOAuthUrl()
    res.json({ authUrl })
  } catch (error) {
    next(error)
  }
})

// Exchange code for token
router.post('/auth/callback', async (req, res, next) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' })
    }

    const accessToken = await GitHubService.exchangeCodeForToken(code)
    
    return res.json({ 
      accessToken,
      message: 'Successfully authenticated with GitHub'
    })
  } catch (error) {
    logger.error('GitHub OAuth callback error:', error)
    return next(error)
  }
})

// Get user repositories
router.get('/repositories', async (req, res, next) => {
  try {
    const { accessToken } = req.query
    
    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({ error: 'Access token is required' })
    }

    const repositories = await GitHubService.getUserRepositories(accessToken)
    return res.json(repositories)
  } catch (error) {
    logger.error('Failed to fetch repositories:', error)
    return next(error)
  }
})

// Get repository details
router.get('/repositories/:owner/:repo', async (req, res, next) => {
  try {
    const { accessToken } = req.query
    const { owner, repo } = req.params
    
    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({ error: 'Access token is required' })
    }

    const repository = await GitHubService.getRepositoryDetails(accessToken, owner, repo)
    return res.json(repository)
  } catch (error) {
    logger.error(`Failed to fetch repository ${req.params.owner}/${req.params.repo}:`, error)
    return next(error)
  }
})

// Analyze repository for deployment
router.post('/repositories/analyze', async (req, res, next) => {
  try {
    const { error, value } = repositoryAnalysisSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { accessToken } = req.query
    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({ error: 'Access token is required' })
    }

    const { owner, repo, branch } = value
    const analysis = await GitHubService.analyzeRepository(accessToken, owner, repo, branch)
    
    return res.json(analysis)
  } catch (error) {
    logger.error(`Failed to analyze repository ${req.body.owner}/${req.body.repo}:`, error)
    return next(error)
  }
})

export default router