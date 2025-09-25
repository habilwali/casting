import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Device from '@/models/Device';
import Session from '@/models/Session';
import { logInfo, logError } from '@/lib/logger';
import { getClientIp } from '@/lib/utils';
import { nftDeletePair } from '@/lib/nftables';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { room: string } }
) {
  try {
    const { room } = params;

    await connectDB();

    // End any active sessions for this room
    const activeSessions = await Session.find({ room, active: true });
    
    for (const session of activeSessions) {
      await nftDeletePair(session.mobileIp, session.chromecastIp);
      await Session.findByIdAndUpdate(session._id, { active: false });
    }

    // Remove device
    await Device.findOneAndDelete({ room });

    logInfo(`Device removed: Room ${room}`, undefined, getClientIp(request));

    return NextResponse.json({ message: 'Device removed successfully' });
  } catch (error: any) {
    logError(`Failed to remove device: ${error.message}`, undefined, getClientIp(request));
    return NextResponse.json({ error: 'Failed to remove device' }, { status: 500 });
  }
}
