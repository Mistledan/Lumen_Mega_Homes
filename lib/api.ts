const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
function serverBase(): string {
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/v1`;
  return 'http://localhost:3002/api/v1';
}
export async function api<T>(path: string, init?: RequestInit): Promise<T> { const base = typeof window === 'undefined' ? serverBase() : API; const res = await fetch(`${base}${path}`, { ...init, cache: 'no-store' }); if (!res.ok) throw new Error((await res.text()) || `API ${res.status}`); return res.json(); }
export { API };