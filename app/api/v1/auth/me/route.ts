import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {requireAdmin} from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const me = await requireAdmin(req);
  return me ? NextResponse.json(me.admin) : NextResponse.json({message: 'Unauthorized'}, {status: 401});
}