import {NextRequest} from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

type RouteModule = {GET: (req: NextRequest, ctx: any) => Promise<Response> | Response};

const localRoutes: Record<string, () => Promise<RouteModule>> = {
  content: () => import('@/app/api/v1/content/route'),
  properties: () => import('@/app/api/v1/properties/route'),
  'properties/[param]': () => import('@/app/api/v1/properties/[param]/route'),
  estates: () => import('@/app/api/v1/estates/route'),
  'estates/[param]': () => import('@/app/api/v1/estates/[param]/route'),
  posts: () => import('@/app/api/v1/posts/route'),
  'posts/[param]': () => import('@/app/api/v1/posts/[param]/route'),
};

function serverBases(): string[] {
  const bases: string[] = [];
  if (process.env.INTERNAL_API_URL) bases.push(process.env.INTERNAL_API_URL);
  if (process.env.VERCEL_URL) bases.push(`https://${process.env.VERCEL_URL}/api/v1`);
  const port = process.env.PORT;
  if (port) {
    bases.push(`http://127.0.0.1:${port}/api/v1`);
    bases.push(`http://localhost:${port}/api/v1`);
  }
  bases.push('http://localhost:3002/api/v1');
  return bases;
}

async function request<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    cache: 'no-store',
    signal: init?.signal ?? AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error((await res.text()) || `API ${res.status}`);
  return (await res.json()) as T;
}

async function inProcess<T>(path: string): Promise<T> {
  const [pathname, search = ''] = path.split('?');
  const segments = pathname.split('/').filter(Boolean);
  const loader = localRoutes[segments.length > 1 ? `${segments[0]}/[param]` : segments[0]];
  if (!loader) throw new Error(`no local route for ${pathname}`);
  const mod = await loader();
  const url = `http://internal.local/api/v1${pathname}${search ? `?${search}` : ''}`;
  const ctx = segments.length > 1 ? {params: Promise.resolve({param: segments[1]})} : undefined;
  const res = await mod.GET(new NextRequest(url), ctx);
  if (!res.ok) throw new Error((await res.text()) || `API ${res.status}`);
  return (await res.json()) as T;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const isRead = !init || !init.method || init.method.toUpperCase() === 'GET';
  if (typeof window === 'undefined' && isRead) {
    try {
      return await inProcess<T>(path);
    } catch (error) {
      console.error(`[api] in-process ${path} failed, trying HTTP:`, (error as Error)?.message);
    }
  }

  const bases = typeof window === 'undefined' ? serverBases() : [API];
  let lastError: unknown = null;
  for (const base of bases) {
    try {
      return await request<T>(base, path, init);
    } catch (error) {
      lastError = error;
      if (typeof window === 'undefined') console.error(`[api] ${base}${path} failed:`, (error as Error)?.message);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('API unavailable');
}

export { API };
