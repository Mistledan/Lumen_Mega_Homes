import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';

const patchSchema = z.object({
  title: z.string().min(2).optional(), slug: z.string().min(2).optional(), excerpt: z.string().optional(),
  content: z.string().optional(), image: z.string().nullable().optional(),
  published: z.boolean().optional(), publishedAt: z.coerce.date().nullable().optional(),
});

export async function GET(_req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  const {param} = await ctx.params;
  const post = await prisma.post.findUnique({where: {slug: param}});
  return post ? NextResponse.json(post) : NextResponse.json({message: 'Not found'}, {status: 404});
}

export async function PATCH(req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const {param} = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const p = patchSchema.safeParse(body);
  if (!p.success) return NextResponse.json({message: 'Invalid post'}, {status: 400});
  return NextResponse.json(await prisma.post.update({where: {id: param}, data: p.data as any}));
}

export async function DELETE(req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const {param} = await ctx.params;
  await prisma.post.delete({where: {id: param}});
  return new NextResponse(null, {status: 204});
}