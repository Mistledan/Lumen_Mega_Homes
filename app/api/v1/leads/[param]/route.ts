import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';

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