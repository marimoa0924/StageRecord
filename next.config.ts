import type { NextConfig } from 'next';

// Allowed origin for CORS. Set NEXT_PUBLIC_APP_URL in Vercel env vars.
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? 'https://stage-record.vercel.app';

// ─── Content-Security-Policy ────────────────────────────────────────────────
//
// TRADE-OFF NOTE:
//   script-src includes 'unsafe-inline' because Next.js App Router injects
//   inline hydration scripts, and layout.tsx has a dangerouslySetInnerHTML
//   theme script that cannot carry a nonce without middleware refactoring.
//   All other directives are kept as restrictive as possible.
//
//   To upgrade to a nonce-based strict CSP (recommended for financial apps):
//   1. Generate a per-request nonce in middleware.ts
//   2. Forward it via a custom request header (e.g. x-nonce)
//   3. Read it in app/layout.tsx and apply to <script> and <style> tags
//   4. Replace 'unsafe-inline' with 'nonce-${nonce}' 'strict-dynamic'
//
const CSP = [
  // Only load resources from our own origin by default
  "default-src 'self'",
  // Next.js hydration requires 'unsafe-inline'; XSS risk is mitigated by
  // React's output escaping and the restrictive connect-src / img-src below
  "script-src 'self' 'unsafe-inline'",
  // Inline styles are used by Tailwind; Google Fonts stylesheet is loaded
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  // Only allow images from our own origin, Vercel Blob, and Google avatars
  "img-src 'self' blob: data: https://*.public.blob.vercel-storage.com https://*.googleusercontent.com",
  // Google Fonts glyphs
  "font-src 'self' https://fonts.gstatic.com",
  // Fetch/XHR: only our own API and Google OAuth endpoints
  `connect-src 'self' https://accounts.google.com https://*.googleapis.com`,
  // Google OAuth uses a popup frame
  "frame-src https://accounts.google.com",
  // Block Flash, Java applets, etc.
  "object-src 'none'",
  // Prevent <base> tag injection attacks
  "base-uri 'self'",
  // Only allow form submissions to our own origin and Google OAuth
  "form-action 'self' https://accounts.google.com",
  // Equivalent to X-Frame-Options: DENY (belt-and-suspenders)
  "frame-ancestors 'none'",
  // Automatically upgrade any accidental HTTP sub-resource requests to HTTPS
  "upgrade-insecure-requests",
]
  .join('; ')
  .trim();

// ─── Security headers applied to every response ─────────────────────────────
const securityHeaders = [
  { key: 'Content-Security-Policy', value: CSP },
  // HSTS: enforce HTTPS for 2 years, include sub-domains, allow preload list
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent clickjacking (also covered by CSP frame-ancestors above)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Legacy XSS filter for older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Limit Referer header on cross-origin navigation
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features not used by this app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// ─── CORS — restrict API routes to same-origin calls ────────────────────────
// Browsers will block cross-origin API requests from third-party sites.
const apiCorsHeaders = [
  { key: 'Access-Control-Allow-Origin', value: APP_ORIGIN },
  { key: 'Access-Control-Allow-Methods', value: 'GET, POST, DELETE, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
  { key: 'Access-Control-Max-Age', value: '86400' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/api/:path*', headers: apiCorsHeaders },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.googleusercontent.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
