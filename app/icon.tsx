import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0E0E0E',
        width: 32,
        height: 32,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#C6FF3D',
        fontFamily: 'sans-serif',
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: '-1px',
      }}
    >
      D
    </div>,
    { ...size }
  )
}
