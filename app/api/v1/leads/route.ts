import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';

const schema = z.object({name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), interest: z.string().optional(), message: z.string().optional(), source: z.string().optional()});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const p = schema.safeParse(body);
  if (!p.success) return NextResponse.json({message: 'Invalid enquiry'}, {status: 400});
  return NextResponse.json(await prisma.lead.create({data: p.data}), {status: 201});
}

export async function GET(req: NextRequest) {
  const me = await requireAdmin(req);
  if (!me) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  return NextResponse.json(await prisma.lead.findMany({orderBy: {createdAt: 'desc'}, take: 200}));
}