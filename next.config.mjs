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
          // Content-Security-Policy ships in Report-Only mode for now: it
          // never blocks anything, it only surfaces violations (browser
          // console) so the policy can be tightened against real traffic
          // before enforcement. The app needs 'unsafe-inline' for the
          // pre-paint theme script and Next.js inline bootstrapping, plus
          // Supabase (REST + realtime websockets) and PostHog endpoints.
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
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
