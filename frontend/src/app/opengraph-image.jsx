import { ImageResponse } from 'next/og'

// Imagen Open Graph por defecto (home y páginas sin OG propio).
// Las páginas de propiedad usan su foto de Cloudinary vía generateMetadata.
export const runtime = 'edge'
export const alt = 'Inmobiliaria Bardales — Lotes y casas en Chepén'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #1C1308 0%, #0F0A04 60%, #1a0d04 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #C9A227 0%, #E8C766 100%)',
            color: '#FDF6E9',
            fontSize: 64,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          EE
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: '#FDF6E9' }}>
          Inmobiliaria Bardales
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#E8C766', marginTop: 16 }}>
          Lotes y casas en Chepén · La Libertad · Perú
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(154,130,104,0.8)', marginTop: 28 }}>
          Títulos saneados · Precios negociables · Atención por WhatsApp
        </div>
      </div>
    ),
    size
  )
}
