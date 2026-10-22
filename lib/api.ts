const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

function serverBases(): string[] {
  const bases: string[] = [];
  if (process.env.INTERNAL_API_URL) bases.push(process.env.INTERNAL_API_URL);
  if (process.env.VERCEL_URL) bases.push(`https://${process.env.VERCEL_URL}/api/v1`);
  const port = process.env.PORT;
  if (port) {
    bases.push(`http://127.0.0.1:${port}/api/v1`);
    bases.push(`http://localhost:${port}/api/v1`);
    bases.push(`http://[::1]:${port}/api/v1`);
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

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (typeof window !== 'undefined') return request<T>(API, path, init);

  let lastError: unknown = null;
  for (const base of serverBases()) {
    try {
      return await request<T>(base, path, init);
    } catch (error) {
      lastError = error;
      console.error(`[api] ${base}${path} failed:`, (error as Error)?.message);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('API unavailable');
}

export { API };
