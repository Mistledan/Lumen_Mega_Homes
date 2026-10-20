import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';
import {emptySocials, socialsSchema} from '@/lib/socials';

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const content = await prisma.siteContent.findUnique({where: {id: 'main'}});
  return NextResponse.json(content?.socials ?? emptySocials);
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const body = await req.json().catch(() => null);
  const socials = socialsSchema.safeParse(body);
  if (!socials.success) return NextResponse.json({message: 'Invalid socials payload', issues: socials.error.issues}, {status: 400});

  const content = await prisma.siteContent.upsert({
    where: {id: 'main'},
    update: {socials: socials.data},
    create: {
      id: 'main',
      brandName: 'LUMEN MEGA HOMES',
      phone: '',
      email: '',
      address: '',
      description: '',
      hero: {},
      about: {},
      stats: [],
      services: [],
      testimonials: [],
      footer: {},
      team: [],
      socials: socials.data,
    },
  });
  return NextResponse.json(content.socials);
}