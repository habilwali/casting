import { NextRequest } from 'next/server';

export function getClientIp(req: NextRequest): string {
  // Check for forwarded headers first
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return req.ip || '127.0.0.1';
}

export function validateIpNetwork(ip: string, expectedNetwork: string): boolean {
  try {
    const ipParts = ip.split('.').map(Number);
    const [network, prefix] = expectedNetwork.split('/');
    const networkParts = network.split('.').map(Number);
    const prefixLength = parseInt(prefix);

    if (ipParts.length !== 4 || networkParts.length !== 4) {
      return false;
    }

    // Convert to 32-bit integers
    const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const networkInt = (networkParts[0] << 24) + (networkParts[1] << 16) + (networkParts[2] << 8) + networkParts[3];
    const mask = ~((1 << (32 - prefixLength)) - 1);

    return (ipInt & mask) === (networkInt & mask);
  } catch {
    return false;
  }
}

export async function pingDevice(ipAddress: string): Promise<boolean> {
  try {
    // For browser environments, we'll use a different approach
    // This is a simplified version - in production you'd want to use a proper ping service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(`http://${ipAddress}`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  } catch {
    return false;
  }
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getExpirationTime(hours: number = 2): Date {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

export function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC';
}

export function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const timeLeft = expiresAt.getTime() - now.getTime();

  if (timeLeft <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}
