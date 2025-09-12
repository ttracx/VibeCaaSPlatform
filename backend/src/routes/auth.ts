import express from 'express'
import Joi from 'joi'
import { UserModel } from '../models/User'
import { generateToken } from '../middleware/auth'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, email, password } = value

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Create new user
    const user = new UserModel({
      id: uuidv4(),
      name,
      email,
      password,
      plan: 'free'
    })

    await user.save()

    const token = generateToken(user.id)

    logger.info(`New user registered: ${email}`)

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { email, password } = value

    // Find user
    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    const token = generateToken(user.id)

    logger.info(`User logged in: ${email}`)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        lastLoginAt: user.lastLoginAt
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get profile
router.get('/profile', async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const user = await UserModel.findOne({ id: decoded.userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    })
  } catch (error) {
    next(error)
  }
})

// Logout
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement token blacklisting here if needed
  res.json({ message: 'Logout successful' })
})

export default router