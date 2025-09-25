import connectDB from './mongodb';
import Log from '@/models/Log';

export interface LogEntry {
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  sessionId?: string;
  ipAddress?: string;
}

export async function logActivity(entry: LogEntry): Promise<void> {
  try {
    await connectDB();
    
    const log = new Log({
      level: entry.level,
      message: entry.message,
      sessionId: entry.sessionId,
      ipAddress: entry.ipAddress,
    });

    await log.save();
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export function logInfo(message: string, sessionId?: string, ipAddress?: string): void {
  logActivity({ level: 'INFO', message, sessionId, ipAddress });
}

export function logWarning(message: string, sessionId?: string, ipAddress?: string): void {
  logActivity({ level: 'WARNING', message, sessionId, ipAddress });
}

export function logError(message: string, sessionId?: string, ipAddress?: string): void {
  logActivity({ level: 'ERROR', message, sessionId, ipAddress });
}
