import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';

const schema = z.object({
  title: z.string().min(2), slug: z.string().min(2), excerpt: z.string(), content: z.string(),
  image: z.string().nullable().optional(), published: z.boolean().optional(), publishedAt: z.coerce.date().nullable().optional(),
});

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('admin') === 'true') {
    const me = await requireAdmin(req);
    if (!me) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
    return NextResponse.json(await prisma.post.findMany({orderBy: {createdAt: 'desc'}, take: 100}));
  }
  return NextResponse.json(await prisma.post.findMany({where: {published: true}, orderBy: {publishedAt: 'desc'}, take: 50}));
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const body = await req.json().catch(() => ({}));
  const p = schema.safeParse(body);
  if (!p.success) return NextResponse.json({message: 'Invalid post'}, {status: 400});
  return NextResponse.json(await prisma.post.create({data: p.data as any}), {status: 201});
}