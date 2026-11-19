import { MIN_NORMAL_BID } from '@/lib/constants/pricing'

/**
 * One shared test for "is this a Sponsored message". The leaderboard used a
 * broad test (flag, tier, sub-$5 bid, or a sponsor shoutout) while the /w
 * page and the comment action checked only style_config.isSponsored — so
 * legacy sponsored posts (flag missing, shoutout present) showed a comment
 * box on their post page even though Sponsored posts have no comments.
 */
export function isSponsoredMessage(styleConfig: any, bidAmount?: number | null): boolean {
  const config = styleConfig || {}
  return (
    config.isSponsored === true ||
    config.tier === 'sponsored' ||
    (typeof bidAmount === 'number' && bidAmount < MIN_NORMAL_BID) ||
    Boolean(config.sponsorName) ||
    Boolean(config.sponsorNote)
  )
}
