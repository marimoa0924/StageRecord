import type { NextConfig } from 'next';

// Allowed origin for CORS. Set NEXT_PUBLIC_APP_URL in Vercel env vars.
// Falls back to the known production URL.
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? 'https://stage-record.vercel.app';

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Legacy XSS filter (belt-and-suspenders)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Limit Referer header to origin only on cross-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// Restrict API routes to same-origin requests only.
// Browsers enforce CORS: requests from other origins will be blocked.
const apiCorsHeaders = [
  { key: 'Access-Control-Allow-Origin', value: APP_ORIGIN },
  { key: 'Access-Control-Allow-Methods', value: 'GET, POST, DELETE, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
  { key: 'Access-Control-Max-Age', value: '86400' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Security headers on every response
      { source: '/:path*', headers: securityHeaders },
      // Explicit CORS restriction on API routes
      { source: '/api/:path*', headers: apiCorsHeaders },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
