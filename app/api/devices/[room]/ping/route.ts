import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Device from '@/models/Device';
import { pingDevice } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { room: string } }
) {
  try {
    const { room } = params;

    await connectDB();

    const device = await Device.findOne({ room });
    if (!device) {
      return NextResponse.json({ online: false, error: 'Device not found' }, { status: 404 });
    }

    // Check if device is reachable
    const isOnline = await pingDevice(device.ipAddress);

    return NextResponse.json({
      room,
      device: {
        name: device.deviceName,
        ipAddress: device.ipAddress,
      },
      online: isOnline,
      status: device.status,
    });
  } catch (error: any) {
    return NextResponse.json({ online: false, error: error.message }, { status: 500 });
  }
}
