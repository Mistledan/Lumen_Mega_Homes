import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {prisma} from '@/server/src/db';
import {verifyPassword} from '@/server/src/security';
import {createSession} from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const {email, password} = body || {};
  if (typeof email !== 'string' || typeof password !== 'string') return NextResponse.json({message: 'Invalid request'}, {status: 400});
  const u = await prisma.adminUser.findUnique({where: {email: email.toLowerCase().trim()}});
  if (!u || !verifyPassword(password, u.passwordHash)) return NextResponse.json({message: 'Invalid credentials'}, {status: 401});
  const res = NextResponse.json({id: u.id, email: u.email, name: u.name});
  return createSession(res, u.id);
}