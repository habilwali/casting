import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import connectDB from '@/lib/mongodb';
import Device from '@/models/Device';
import { pingDevice, getClientIp } from '@/lib/utils';
import { logInfo, logError } from '@/lib/logger';

const SERVER_HOST = process.env.SERVER_HOST || '192.168.70.215';
const SERVER_PORT = process.env.SERVER_PORT || '3000';

export async function GET(
  request: NextRequest,
  { params }: { params: { room: string } }
) {
  try {
    const { room } = params;

    await connectDB();

    const device = await Device.findOne({ room });
    if (!device) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if device is reachable
    const deviceOnline = await pingDevice(device.ipAddress);

    // Generate connection URL
    const url = `http://${SERVER_HOST}:${SERVER_PORT}/connect?room=${room}`;

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    logInfo(`QR code generated for room ${room}`, undefined, getClientIp(request));

    return NextResponse.json({
      room,
      device: {
        name: device.deviceName,
        ipAddress: device.ipAddress,
        macAddress: device.macAddress,
      },
      qrCode: qrCodeDataUrl,
      url,
      deviceOnline,
    });
  } catch (error: any) {
    logError(`QR generation failed: ${error.message}`, undefined, getClientIp(request));
    return NextResponse.json({ error: 'QR generation failed' }, { status: 500 });
  }
}
