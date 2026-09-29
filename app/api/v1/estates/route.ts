import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';

const schema = z.object({
  title: z.string().min(2), slug: z.string().min(2), location: z.string(), description: z.string().min(2),
  startingPrice: z.string().nullable().optional(), image: z.string().min(4),
  gallery: z.array(z.string()), amenities: z.array(z.string()), featured: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const where: any = {};
  if (req.nextUrl.searchParams.get('featured') === 'true') where.featured = true;
  return NextResponse.json(await prisma.estate.findMany({where, orderBy: {createdAt: 'desc'}, take: 100}));
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const body = await req.json().catch(() => ({}));
  const p = schema.safeParse(body);
  if (!p.success) return NextResponse.json({message: 'Invalid estate'}, {status: 400});
  try {
    return NextResponse.json(await prisma.estate.create({data: p.data as any}), {status: 201});
  } catch {
    return NextResponse.json({message: 'Slug already exists'}, {status: 409});
  }
}