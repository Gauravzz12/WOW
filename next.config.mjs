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
          // NOTE: a Content-Security-Policy is deliberately not set here yet.
          // The app loads Supabase, Dodo Payments, PostHog and inline styles;
          // roll a policy out in Report-Only mode first, fix violations, then
          // enforce. The headers above are safe to enforce immediately.
        ],
      },
    ]
  },
};

export default nextConfig;
