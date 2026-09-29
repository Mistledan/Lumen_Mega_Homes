import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {clearSession, isAdminToken} from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  await clearSession(isAdminToken(req));
  const res = NextResponse.json({ok: true});
  res.cookies.set('cms_session', '', {httpOnly: true, path: '/', maxAge: 0});
  return res;
}