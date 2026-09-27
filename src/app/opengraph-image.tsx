import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Words of the World'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
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
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: 28,
            opacity: 0.6,
            letterSpacing: '0.2em',
            fontFamily: 'sans-serif',
          }}
        >
          WORDS OF THE WORLD
        </div>
        <div
          style={{
            fontSize: 64,
            fontStyle: 'italic',
            fontFamily: 'serif',
            marginTop: 24,
            textAlign: 'center',
            padding: '0 80px',
          }}
        >
          One message. One moment. The world&apos;s attention.
        </div>
      </div>
    ),
    { ...size }
  )
}
