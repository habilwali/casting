import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  timestamp: Date;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  sessionId?: string;
  ipAddress?: string;
}

const LogSchema = new Schema<ILog>({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  level: {
    type: String,
    required: true,
    enum: ['INFO', 'WARNING', 'ERROR'],
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  sessionId: {
    type: String,
    trim: true,
  },
  ipAddress: {
    type: String,
    trim: true,
  },
});

// Index for efficient queries
LogSchema.index({ timestamp: -1 });
LogSchema.index({ level: 1 });

export default mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
