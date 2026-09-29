import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {prisma} from '@/server/src/db';
import {hashToken, randomToken} from '@/server/src/security';

const COOKIE = 'cms_session';

export async function createSession(res: NextResponse, userId: string): Promise<NextResponse> {
  const token = randomToken();
  const days = Number(process.env.SESSION_DAYS || 7);
  await prisma.session.create({data: {tokenHash: hashToken(token), adminUserId: userId, expiresAt: new Date(Date.now() + days * 86400000)}});
  res.cookies.set(COOKIE, token, {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: days * 86400, path: '/'});
  return res;
}

export async function getCurrentAdmin(token?: string) {
  if (!token) return null;
  try {
    const s = await prisma.session.findUnique({where: {tokenHash: hashToken(token)}, include: {adminUser: true}});
    if (!s || s.expiresAt < new Date()) return null;
    return s.adminUser;
  } catch {
    return null;
  }
}

export async function clearSession(token?: string) {
  if (token) await prisma.session.deleteMany({where: {tokenHash: hashToken(token)}});
}

export function isAdminToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE)?.value;
}

export async function requireAdmin(req: NextRequest): Promise<{admin: {id: string; email: string; name: string | null}} | null> {
  const token = isAdminToken(req);
  const admin = await getCurrentAdmin(token);
  return admin ? {admin: {id: admin.id, email: admin.email, name: admin.name}} : null;
}