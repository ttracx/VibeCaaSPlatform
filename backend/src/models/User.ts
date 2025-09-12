import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../types/app'

const UserSchema = new Schema<User & Document>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String },
  plan: { 
    type: String, 
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  lastLoginAt: { type: Date }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      delete ret.password
      return ret
    }
  }
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Indexes
UserSchema.index({ email: 1 })
UserSchema.index({ plan: 1 })

export const UserModel = mongoose.model<User & Document>('User', UserSchema)