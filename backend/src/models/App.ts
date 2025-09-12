import mongoose, { Schema, Document } from 'mongoose'
import { App } from '../types/app'

const AppSchema = new Schema<App & Document>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['creating', 'building', 'running', 'stopped', 'terminated'],
    default: 'creating'
  },
  image: { type: String, required: true },
  port: { type: Number, required: true },
  url: { type: String },
  userId: { type: String, required: true, index: true },
  namespace: { type: String, required: true },
  resources: {
    cpu: { type: String, required: true },
    memory: { type: String, required: true },
    gpu: { type: String }
  },
  environment: { type: Map, of: String, default: {} },
  volumes: [{
    name: { type: String, required: true },
    mountPath: { type: String, required: true },
    size: { type: String, required: true }
  }],
  logs: [{ type: String }],
  metrics: {
    cpu: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    networkIn: { type: Number, default: 0 },
    networkOut: { type: Number, default: 0 }
  },
  kubernetesConfig: {
    deploymentName: { type: String },
    serviceName: { type: String },
    ingressName: { type: String },
    podName: { type: String }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Indexes
AppSchema.index({ userId: 1, status: 1 })
AppSchema.index({ namespace: 1 })
AppSchema.index({ createdAt: -1 })

export const AppModel = mongoose.model<App & Document>('App', AppSchema)