import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const port = process.env.PORT || null;
  const candidates = [
    port ? `http://127.0.0.1:${port}/api/v1/content` : null,
    port ? `http://localhost:${port}/api/v1/content` : null,
    port ? `http://[::1]:${port}/api/v1/content` : null,
    'http://localhost:3002/api/v1/content',
  ].filter(Boolean) as string[];

  const selfFetch: unknown[] = [];
  for (const url of candidates) {
    const started = Date.now();
    try {
      const res = await fetch(url, {cache: 'no-store', signal: AbortSignal.timeout(8000)});
      const body = await res.text();
      selfFetch.push({url, status: res.status, ms: Date.now() - started, bytes: body.length});
    } catch (error) {
      const err = error as {message?: string; cause?: {message?: string; code?: string}};
      selfFetch.push({
        url,
        error: err?.message || String(error),
        cause: err?.cause?.message || null,
        code: err?.cause?.code || null,
      });
    }
  }

  return NextResponse.json({
    env: {
      PORT: port,
      INTERNAL_API_URL: process.env.INTERNAL_API_URL || null,
      VERCEL_URL: process.env.VERCEL_URL || null,
      NODE_ENV: process.env.NODE_ENV || null,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
    },
    selfFetch,
    time: new Date().toISOString(),
  });
}
