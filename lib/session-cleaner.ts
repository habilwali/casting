import connectDB from './mongodb';
import Session from '@/models/Session';
import { nftDeletePair } from './nftables';
import { logInfo } from './logger';

export async function cleanExpiredSessions(): Promise<void> {
  try {
    await connectDB();
    
    const now = new Date();
    const expiredSessions = await Session.find({
      active: true,
      expiresAt: { $lte: now },
    });

    for (const session of expiredSessions) {
      // Remove from NFTables
      await nftDeletePair(session.mobileIp, session.chromecastIp);

      // Mark as inactive
      await Session.findByIdAndUpdate(session._id, { active: false });

      logInfo(`Cleaned expired session: ${session.id} (Room: ${session.room})`);
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned ${expiredSessions.length} expired sessions`);
    }
  } catch (error) {
    console.error('Session cleaner error:', error);
  }
}

// Run cleanup every 30 seconds
export function startSessionCleaner(): NodeJS.Timeout {
  return setInterval(cleanExpiredSessions, 30000);
}
