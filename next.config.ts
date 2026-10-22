import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Shared hosting has a low thread/process limit; Next's default worker
    // count (one per CPU) crashes with "pthread_create: Resource temporarily unavailable".
    cpus: 1,
    workerThreads: false,
  },
  turbopack: {
    root: __dirname,
  },
};
export default nextConfig;
