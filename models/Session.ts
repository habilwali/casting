import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  id: string;
  room: string;
  mobileIp: string;
  chromecastIp: string;
  createdAt: Date;
  expiresAt: Date;
  active: boolean;
  userAgent?: string;
  lastActivity: Date;
}

const SessionSchema = new Schema<ISession>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  room: {
    type: String,
    required: true,
    trim: true,
  },
  mobileIp: {
    type: String,
    required: true,
    trim: true,
  },
  chromecastIp: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
SessionSchema.index({ active: 1, expiresAt: 1 });
SessionSchema.index({ room: 1, active: 1 });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
