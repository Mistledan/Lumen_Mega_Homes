import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';

const patchSchema = z.object({
  title: z.string().min(2).optional(), slug: z.string().min(2).optional(), location: z.string().optional(),
  description: z.string().min(2).optional(), startingPrice: z.string().nullable().optional(),
  image: z.string().min(4).optional(), gallery: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(), featured: z.boolean().optional(),
});

export async function GET(_req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  const {param} = await ctx.params;
  const e = await prisma.estate.findUnique({where: {slug: param}});
  return e ? NextResponse.json(e) : NextResponse.json({message: 'Not found'}, {status: 404});
}

export async function PATCH(req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const {param} = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const p = patchSchema.safeParse(body);
  if (!p.success) return NextResponse.json({message: 'Invalid estate'}, {status: 400});
  return NextResponse.json(await prisma.estate.update({where: {id: param}, data: p.data as any}));
}

export async function DELETE(req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const {param} = await ctx.params;
  await prisma.estate.delete({where: {id: param}});
  return new NextResponse(null, {status: 204});
}