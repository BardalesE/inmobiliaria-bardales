'use client'

export default function MapEmbed({ lat, lng, title }) {
  if (!lat || !lng) return null

  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=18&output=embed`

  return (
    <div className="space-y-2">
      <div className="relative h-56 rounded-xl overflow-hidden border border-terra/20 bg-bark-700">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'saturate(0.7) brightness(0.75)' }}
          allowFullScreen
          loading="lazy"
          title={`Mapa: ${title}`}
        />
        {/* Coords badge */}
        <div className="absolute bottom-3 left-3 bg-bark-900/85 backdrop-blur-sm border border-terra/30 rounded-lg px-3 py-1.5">
          <p className="text-[10px] uppercase tracking-wide text-terra-light font-bold">📍 Ubicación exacta</p>
          <p className="text-[10px] font-mono text-sand-muted">{lat}, {lng}</p>
        </div>
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-bark-700 border border-terra/30 text-terra-light text-sm font-semibold hover:bg-terra/10 transition-colors"
      >
        🗺️ Abrir en Google Maps
      </a>
    </div>
  )
}
