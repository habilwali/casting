import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Device from '@/models/Device';
import Session from '@/models/Session';
import { getClientIp, validateIpNetwork, getExpirationTime, generateSessionId } from '@/lib/utils';
import { nftAddPair } from '@/lib/nftables';
import { logInfo, logWarning, logError } from '@/lib/logger';

const MOBILE_NETWORK = process.env.MOBILE_NETWORK || '192.168.10.0/24';
const CHROMECAST_NETWORK = process.env.CHROMECAST_NETWORK || '192.168.20.0/24';
const SESSION_HOURS = 2;

export async function GET() {
  try {
    await connectDB();
    const sessions = await Session.find({ active: true })
      .populate('room')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ sessions });
  } catch (error) {
    logError('Failed to fetch sessions', undefined, undefined);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { room } = await request.json();
    
    if (!room) {
      return NextResponse.json({ error: 'Room parameter required' }, { status: 400 });
    }

    await connectDB();

    // Find device
    const device = await Device.findOne({ room });
    if (!device) {
      return NextResponse.json({ error: 'Room not configured' }, { status: 404 });
    }

    const clientIp = getClientIp(request);

    // Validate client IP is from mobile network
    if (!validateIpNetwork(clientIp, MOBILE_NETWORK)) {
      logWarning(`Connection attempt from invalid network: ${clientIp}`, undefined, clientIp);
      return NextResponse.json(
        { error: 'Invalid network', message: `Mobile devices must be on ${MOBILE_NETWORK} network` },
        { status: 400 }
      );
    }

    // Validate Chromecast IP is from Chromecast network
    if (!validateIpNetwork(device.ipAddress, CHROMECAST_NETWORK)) {
      logError(`Device ${room} has invalid Chromecast IP: ${device.ipAddress}`, undefined, clientIp);
      return NextResponse.json(
        { error: 'Configuration error', message: 'Chromecast device IP is not in valid network range' },
        { status: 500 }
      );
    }

    // Check if device is configured as active
    if (device.status !== 'active') {
      logWarning(`Device ${room} is not active`, undefined, clientIp);
      return NextResponse.json(
        { error: 'Device inactive', message: 'This Chromecast device is currently disabled. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // Create session
    const sessionId = generateSessionId();
    const createdAt = new Date();
    const expiresAt = getExpirationTime(SESSION_HOURS);
    const timeoutSeconds = Math.floor((expiresAt.getTime() - createdAt.getTime()) / 1000);

    // Add to NFTables
    const nftResult = await nftAddPair(clientIp, device.ipAddress, timeoutSeconds);
    if (!nftResult.success) {
      logError(`Failed to authorize connection: ${nftResult.error}`, sessionId, clientIp);
      return NextResponse.json(
        { error: 'Authorization failed', message: 'Failed to authorize your connection. Please try again.' },
        { status: 500 }
      );
    }

    // Save session to database
    const session = new Session({
      id: sessionId,
      room,
      mobileIp: clientIp,
      chromecastIp: device.ipAddress,
      createdAt,
      expiresAt,
      active: true,
      userAgent: request.headers.get('user-agent') || '',
      lastActivity: createdAt,
    });

    await session.save();

    logInfo(`New session created for room ${room}`, sessionId, clientIp);

    return NextResponse.json({
      session: {
        id: sessionId,
        room,
        device: {
          name: device.deviceName,
          ipAddress: device.ipAddress,
        },
        mobileIp: clientIp,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error: any) {
    logError(`Failed to create session: ${error.message}`, undefined, getClientIp(request));
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
