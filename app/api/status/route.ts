import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Device from '@/models/Device';
import Session from '@/models/Session';
import { nftListPairs } from '@/lib/nftables';

const SERVER_HOST = process.env.SERVER_HOST || '192.168.70.215';

export async function GET() {
  try {
    await connectDB();

    // Count active sessions
    const activeSessions = await Session.countDocuments({ active: true });

    // Count total devices
    const totalDevices = await Device.countDocuments({ status: 'active' });

    // Get NFTables status
    const nftResult = await nftListPairs();

    return NextResponse.json({
      status: 'running',
      activeSessions,
      totalDevices,
      nftablesStatus: nftResult.success ? 'ok' : 'error',
      serverIp: SERVER_HOST,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    );
  }
}
