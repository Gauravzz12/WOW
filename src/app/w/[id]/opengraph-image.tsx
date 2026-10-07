import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'Message on Words.World'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  // Use anon key for Edge runtime
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: message } = await supabase
    .from('messages')
    .select('content, status, category:categories(name)')
    .eq('id', params.id)
    .single()

  // Paywall: anon RLS hides PENDING_PAYMENT (message will be null).
  // Never render unpaid content in OG images — crawlers must not get free full text.
  if (!message || (message as any).status === 'PENDING_PAYMENT') {
    return new ImageResponse(
      (
        <div style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'serif',
        }}>
          <div style={{ fontSize: 28, opacity: 0.6, letterSpacing: '0.2em', fontFamily: 'sans-serif' }}>LOCKED • WORDS.WORLD</div>
          <div style={{ fontSize: 48, fontStyle: 'italic', marginTop: 20 }}>Sponsor $3 to reveal this message</div>
        </div>
      ),
      { ...size }
    )
  }
  const categoryName = (message.category as any)?.name || 'MESSAGE'

  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,1) 80%)',
        }} />
        
        <div style={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 24,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 40,
          fontFamily: 'sans-serif',
          zIndex: 10
        }}>
          {categoryName} ON WORDS.WORLD
        </div>

        <div style={{
          color: 'white',
          fontSize: 72,
          fontFamily: 'serif',
          fontStyle: 'italic',
          textAlign: 'center',
          lineHeight: 1.2,
          zIndex: 10,
          maxWidth: '900px',
        }}>
          "{message.content}"
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
