import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Session from '@/models/Session';
import { nftDeletePair } from '@/lib/nftables';
import { logInfo, logError } from '@/lib/logger';
import { getClientIp } from '@/lib/utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectDB();

    const session = await Session.findOne({ id });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.active) {
      return NextResponse.json({ error: 'Session already ended' }, { status: 400 });
    }

    // Remove from NFTables
    await nftDeletePair(session.mobileIp, session.chromecastIp);

    // Mark as inactive
    await Session.findByIdAndUpdate(session._id, { active: false });

    logInfo(`Session manually ended for room ${session.room}`, id, getClientIp(request));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(`Failed to end session: ${error.message}`, undefined, getClientIp(request));
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}
