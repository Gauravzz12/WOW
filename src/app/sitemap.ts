import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/site'
import { CATEGORY_METADATA } from '@/lib/constants/templates'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  )

  const baseUrl = SITE_URL

  // Get active or queued messages
  const { data: messages } = await supabase
    .from('messages')
    .select('id, updated_at')
    .in('status', ['ACTIVE', 'QUEUED', 'COMPLETED'])
    .order('created_at', { ascending: false })
    .limit(1000)

  const messageUrls = (messages || []).map((message) => ({
    url: `${baseUrl}/w/${message.id}`,
    lastModified: new Date(message.updated_at || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Category pages live at /category/<slug>; slugs are the keys of
  // CATEGORY_METADATA (the same taxonomy the create flow uses).
  const categoryUrls = Object.keys(CATEGORY_METADATA).map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }))

  // Static pages: no lastModified — a fabricated "now" on every request makes
  // search engines distrust the field. Add real dates here if pages gain
  // tracked update timestamps.
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/create`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/waiting-room`,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/content-policy`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guidelines`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  return [
    ...staticUrls,
    ...categoryUrls,
    ...messageUrls,
  ]
}
