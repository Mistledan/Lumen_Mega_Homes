import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/server/src/db';
import {requireAdmin} from '@/lib/server-auth';
import {emptySocials, socialsSchema} from '@/lib/socials';

const teamSchema = z.array(z.object({photo: z.string(), name: z.string().min(1), role: z.string().min(1), note: z.string().optional(), lead: z.boolean().optional()})).default([]);
const statsSchema = z.array(z.tuple([z.string(), z.string()]));
const testimonialsSchema = z.array(z.object({quote: z.string().min(1), name: z.string().min(1), role: z.string().optional()}));

export async function GET() {
  return NextResponse.json(await prisma.siteContent.findUnique({where: {id: 'main'}}) || {});
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  const b: any = await req.json().catch(() => ({}));
  const old = await prisma.siteContent.findUnique({where: {id: 'main'}});
  const team = teamSchema.safeParse(b.team === undefined ? (old?.team ?? []) : b.team);
  if (!team.success) return NextResponse.json({message: 'Invalid team payload', issues: team.error.issues}, {status: 400});
  const stats = statsSchema.safeParse(b.stats === undefined ? (old?.stats ?? []) : b.stats);
  if (!stats.success) return NextResponse.json({message: 'Invalid stats payload', issues: stats.error.issues}, {status: 400});
  const testimonials = testimonialsSchema.safeParse(b.testimonials === undefined ? (old?.testimonials ?? []) : b.testimonials);
  if (!testimonials.success) return NextResponse.json({message: 'Invalid testimonials payload', issues: testimonials.error.issues}, {status: 400});
  const socials = socialsSchema.safeParse(b.socials === undefined ? (old?.socials ?? emptySocials) : b.socials);
  if (!socials.success) return NextResponse.json({message: 'Invalid socials payload', issues: socials.error.issues}, {status: 400});
  const data: any = {
    brandName: String(b.brandName ?? old?.brandName ?? ''),
    phone: String(b.phone ?? old?.phone ?? ''),
    email: String(b.email ?? old?.email ?? ''),
    address: String(b.address ?? old?.address ?? ''),
    description: String(b.description ?? old?.description ?? ''),
    hero: b.hero ?? old?.hero ?? {},
    about: b.about ?? old?.about ?? {},
    stats: stats.data,
    services: b.services ?? old?.services ?? [],
    testimonials: testimonials.data,
    footer: b.footer ?? old?.footer ?? {},
    team: team.data,
    socials: socials.data,
  };
  return NextResponse.json(await prisma.siteContent.upsert({where: {id: 'main'}, update: data, create: {id: 'main', ...data}}));
}