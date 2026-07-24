'use client'

export default function MapEmbed({ lat, lng, title }) {
  if (!lat || !lng) return null

  const mapsUrl  = `https://maps.google.com/?q=${lat},${lng}`
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`

  return (
    <div>
      {/* Map iframe */}
      <div className="relative overflow-hidden" style={{ height: 280, borderRadius: '16px 16px 0 0' }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'saturate(0.65) brightness(0.72) hue-rotate(10deg)' }}
          allowFullScreen
          loading="lazy"
          title={`Mapa: ${title}`}
        />
        {/* Coords overlay */}
        <div
          className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(8,4,1,0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(201,164,78,0.22)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(201,164,78,0.18)', border: '1px solid rgba(201,164,78,0.35)' }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#D9BC7A" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: '#D9BC7A' }}>Ubicación exacta</p>
            <p className="text-[9px] font-mono" style={{ color: 'rgba(154,130,104,0.55)' }}>{lat.toFixed(5)}, {lng.toFixed(5)}</p>
          </div>
        </div>
      </div>

      {/* Open in Maps button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 font-semibold text-sm transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          color: 'rgba(154,130,104,0.7)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(201,164,78,0.09)'
          e.currentTarget.style.color = '#D9BC7A'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          e.currentTarget.style.color = 'rgba(154,130,104,0.7)'
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        Abrir en Google Maps ↗
      </a>
    </div>
  )
}
