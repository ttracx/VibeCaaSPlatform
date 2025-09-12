import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/User'
import { logger } from '../utils/logger'

interface AuthRequest extends Request {
  user?: any
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    
    const user = await UserModel.findOne({ id: decoded.userId })
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' })
    }

    req.user = user
    next()
  } catch (error) {
    logger.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Invalid token.' })
  }
}

export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  )
}