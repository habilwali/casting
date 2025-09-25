import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logInfo, logError } from '@/lib/logger';
import { getClientIp } from '@/lib/utils';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-here';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // For simplicity, we're using plain text comparison
    // In production, you'd want to hash the password
    if (password !== ADMIN_PASSWORD) {
      logError('Admin login failed', undefined, getClientIp(request));
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { admin: true, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    logInfo('Admin login successful', undefined, getClientIp(request));

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error: any) {
    logError(`Login error: ${error.message}`, undefined, getClientIp(request));
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
