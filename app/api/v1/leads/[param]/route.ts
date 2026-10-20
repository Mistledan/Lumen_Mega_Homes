import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';
import {verifyPassword} from '@/server/src/security';

const statusSchema = z.enum(['NEW', 'CONTACTED', 'VIEWING', 'NEGOTIATION', 'CONVERTED', 'CLOSED']);

export async function PATCH(req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  const me = await requireAdmin(req);
  if (!me) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const {param} = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = statusSchema.safeParse(body.status);
  if (!status.success) return NextResponse.json({message: 'Invalid status'}, {status: 400});
  return NextResponse.json(await prisma.lead.update({where: {id: param}, data: {status: status.data}}));
}

export async function DELETE(req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  const me = await requireAdmin(req);
  if (!me) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const {param} = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === 'string' ? body.password : '';
  if (!password.trim()) return NextResponse.json({message: 'Password is required to delete a lead.'}, {status: 400});

  const admin = await prisma.adminUser.findUnique({where: {id: me.admin.id}});
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return NextResponse.json({message: 'Incorrect admin password.'}, {status: 401});
  }

  try {
    await prisma.lead.delete({where: {id: param}});
    return NextResponse.json({message: 'Lead deleted.'}, {status: 200});
  } catch {
    return NextResponse.json({message: 'Lead not found.'}, {status: 404});
  }
}