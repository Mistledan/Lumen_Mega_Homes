import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';

const patchSchema = z.object({
  title: z.string().min(2).optional(), slug: z.string().min(2).optional(), type: z.string().optional(), status: z.string().optional(),
  location: z.string().optional(), price: z.number().int().nullable().optional(), priceLabel: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(), description: z.string().min(2).optional(),
  bedrooms: z.number().int().nullable().optional(), bathrooms: z.number().int().nullable().optional(),
  area: z.string().nullable().optional(), plotSize: z.string().nullable().optional(),
  images: z.array(z.string()).optional(), amenities: z.array(z.string()).optional(), featured: z.boolean().optional(),
});

export async function GET(_req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  const {param} = await ctx.params;
  const p = await prisma.property.findUnique({where: {slug: param}});
  return p ? NextResponse.json(p) : NextResponse.json({message: 'Not found'}, {status: 404});
}

export async function PATCH(req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const {param} = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const p = patchSchema.safeParse(body);
  if (!p.success) return NextResponse.json({message: 'Invalid property'}, {status: 400});
  return NextResponse.json(await prisma.property.update({where: {id: param}, data: p.data as any}));
}

export async function DELETE(req: NextRequest, ctx: {params: Promise<{param: string}>}) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const {param} = await ctx.params;
  await prisma.property.delete({where: {id: param}});
  return new NextResponse(null, {status: 204});
}