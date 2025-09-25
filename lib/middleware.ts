import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-here';

export function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.admin === true;
  } catch {
    return false;
  }
}

export function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    if (!verifyAdminToken(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return handler(request, ...args);
  };
}
