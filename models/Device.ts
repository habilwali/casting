import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  room: string;
  deviceName: string;
  ipAddress: string;
  macAddress?: string;
  createdAt: Date;
  status: 'active' | 'inactive';
}

const DeviceSchema = new Schema<IDevice>({
  room: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  deviceName: {
    type: String,
    required: true,
    trim: true,
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true,
  },
  macAddress: {
    type: String,
    trim: true,
    uppercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
});

export default mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);
