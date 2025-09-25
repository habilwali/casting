import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Device from '@/models/Device';
import { logInfo, logError } from '@/lib/logger';
import { getClientIp } from '@/lib/utils';

export async function GET() {
  try {
    await connectDB();
    const devices = await Device.find({ status: 'active' }).sort({ room: 1 });
    return NextResponse.json({ devices });
  } catch (error) {
    logError('Failed to fetch devices', undefined, undefined);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room, deviceName, ipAddress, macAddress } = body;

    if (!room || !deviceName || !ipAddress) {
      return NextResponse.json({ error: 'Room, device name, and IP address are required' }, { status: 400 });
    }

    await connectDB();

    const device = new Device({
      room,
      deviceName,
      ipAddress,
      macAddress,
    });

    await device.save();
    
    logInfo(`Device added: Room ${room} - ${deviceName} (${ipAddress})`, undefined, getClientIp(request));
    
    return NextResponse.json({ device }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Device with this room already exists' }, { status: 400 });
    }
    
    logError(`Failed to add device: ${error.message}`, undefined, getClientIp(request));
    return NextResponse.json({ error: 'Failed to add device' }, { status: 500 });
  }
}
