import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const baseUrl = 'https://words.world'

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

  const categories = [
    'love', 'proposal', 'celebration', 'confession',
    'heartbreak', 'gratitude', 'awareness', 'tribute'
  ]

  const categoryUrls = categories.map(category => ({
    url: `${baseUrl}/${category}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/content-policy`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guidelines`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    ...categoryUrls,
    ...messageUrls,
  ]
}
