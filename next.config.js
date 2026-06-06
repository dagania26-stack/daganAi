/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

// Headers de sécurité communs (dev + prod)
const COMMON_HEADERS = [
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "X-DNS-Prefetch-Control",   value: "on" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
];

const PROD_ONLY_HEADERS = [
  // HSTS — force HTTPS 2 ans, inclut sous-domaines
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // unsafe-inline nécessaire pour Next.js App Router (hydratation)
      // unsafe-eval retiré en production
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn-uicons.flaticon.com",
      "font-src 'self' data: https://fonts.gstatic.com https://cdn-uicons.flaticon.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.openai.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@react-pdf/renderer"],

  async headers() {
    const headers = isDev ? COMMON_HEADERS : [...COMMON_HEADERS, ...PROD_ONLY_HEADERS];
    return [{ source: "/(.*)", headers }];
  },
};

module.exports = nextConfig;
