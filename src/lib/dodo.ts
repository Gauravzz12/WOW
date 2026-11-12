// Dodo Payments environment is controlled by the DODO_PAYMENTS_ENVIRONMENT
// env var so test/live can be switched from Vercel without a code change.
// Anything other than exactly 'live_mode' stays in test mode (safe default —
// a missing or mistyped var must never silently start charging real cards).
export const DODO_ENVIRONMENT: 'live_mode' | 'test_mode' =
  process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode'
