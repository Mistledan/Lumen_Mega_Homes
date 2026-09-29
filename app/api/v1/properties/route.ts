import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';

const schema = z.object({
  title: z.string().min(2), slug: z.string().min(2), type: z.string(), status: z.string(), location: z.string(),
  price: z.number().int().nullable().optional(), priceLabel: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(), description: z.string().min(2),
  bedrooms: z.number().int().nullable().optional(), bathrooms: z.number().int().nullable().optional(),
  area: z.string().nullable().optional(), plotSize: z.string().nullable().optional(),
  images: z.array(z.string()), amenities: z.array(z.string()), featured: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get('q') || '').trim();
  const where: any = {};
  if (sp.get('featured') === 'true') where.featured = true;
  if (sp.get('status')) where.status = sp.get('status');
  if (sp.get('type')) where.type = sp.get('type');
  if (sp.get('location')) where.location = {contains: sp.get('location'), mode: 'insensitive'};
  if (q) where.OR = [{title: {contains: q, mode: 'insensitive'}}, {location: {contains: q, mode: 'insensitive'}}, {description: {contains: q, mode: 'insensitive'}}];
  return NextResponse.json(await prisma.property.findMany({where, orderBy: {createdAt: 'desc'}, take: Math.min(Number(sp.get('limit') || 100), 100)}));
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const body = await req.json().catch(() => ({}));
  const p = schema.safeParse(body);
  if (!p.success) return NextResponse.json({message: 'Invalid property', issues: p.error.issues}, {status: 400});
  try {
    return NextResponse.json(await prisma.property.create({data: p.data as any}), {status: 201});
  } catch {
    return NextResponse.json({message: 'Slug already exists'}, {status: 409});
  }
}