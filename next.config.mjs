/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Only send the origin on cross-origin requests
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Deny framing by other origins (clickjacking). SAMEORIGIN keeps
          // any same-origin embeds working.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // No device features are needed by the site itself
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content-Security-Policy ships in Report-Only mode: it never
          // blocks anything, it only reports violations. Reports now go to
          // the /api/csp-report collector (logged as "[csp-report]" lines,
          // searchable in Vercel function logs) via both the legacy
          // report-uri directive and the modern Reporting-Endpoints header
          // below. TO ENFORCE: after a clean stretch of reports, change
          // this key to 'Content-Security-Policy' — nothing else needs to
          // change. The app needs 'unsafe-inline' for the pre-paint theme
          // script and Next.js inline bootstrapping, plus Supabase (REST +
          // realtime websockets) and PostHog endpoints.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://us.i.posthog.com https://app.posthog.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "report-uri /api/csp-report",
              "report-to csp-endpoint",
            ].join('; '),
          },
          // Modern Reporting API endpoint group referenced by report-to.
          {
            key: 'Reporting-Endpoints',
            value: 'csp-endpoint="/api/csp-report"',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
