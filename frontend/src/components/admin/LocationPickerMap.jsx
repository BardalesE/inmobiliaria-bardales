'use client'
import { useEffect, useRef, useState } from 'react'

// Only imported via next/dynamic with ssr:false
export default function LocationPickerMap({ lat, lng, onChange }) {
  const mapRef    = useRef(null)
  const markerRef = useRef(null)
  const mapInst   = useRef(null)
  const layersRef = useRef({})
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState([])
  const [searching, setSearching] = useState(false)
  const [satellite, setSatellite] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(16)
  const [noImagery, setNoImagery] = useState(false)
  const noImageryTimer = useRef(null)

  const defaultLat = lat || -7.2281
  const defaultLng = lng || -79.4328

  useEffect(() => {
    if (mapInst.current || !mapRef.current) return

    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')

    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(mapRef.current, { zoomControl: false }).setView([defaultLat, defaultLng], 16)
    mapInst.current = map

    // Mismos tiles que usa Google Maps — híbrido (satélite + calles/nombres
    // en un solo layer, sin capa de etiquetas aparte) y mapa de calles.
    // Cobertura mucho mejor que Esri en Perú: ya no hay pantallas en blanco.
    const satelliteLayer = L.tileLayer(
      'https://{s}.google.com/vt/lyrs=y&hl=es&x={x}&y={y}&z={z}',
      { attribution: '© Google', subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], maxZoom: 21 }
    )
    const streetLayer = L.tileLayer(
      'https://{s}.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}',
      { attribution: '© Google', subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], maxZoom: 21 }
    )

    satelliteLayer.addTo(map)
    layersRef.current = { satellite: satelliteLayer, street: streetLayer }

    // Red de seguridad: si algún tile no carga, avisa en vez de dejar hueco.
    let errorTimer = null
    satelliteLayer.on('tileerror', () => {
      clearTimeout(errorTimer)
      errorTimer = setTimeout(() => {
        if (!mapInst.current) return
        setNoImagery(true)
        clearTimeout(noImageryTimer.current)
        noImageryTimer.current = setTimeout(() => setNoImagery(false), 4500)
      }, 150)
    })

    map.on('zoomend', () => setZoomLevel(map.getZoom()))

    // Custom zoom controls (top-right)
    L.control.zoom({ position: 'topright' }).addTo(map)

    // Draggable marker
    const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)
    markerRef.current = marker

    marker.on('dragend', () => {
      const p = marker.getLatLng()
      onChange(parseFloat(p.lat.toFixed(6)), parseFloat(p.lng.toFixed(6)))
    })

    map.on('click', (e) => {
      marker.setLatLng([e.latlng.lat, e.latlng.lng])
      onChange(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external lat/lng changes (e.g. search result) to marker+view
  useEffect(() => {
    if (!mapInst.current || !markerRef.current) return
    if (lat && lng) {
      markerRef.current.setLatLng([lat, lng])
      mapInst.current.setView([lat, lng], 17)
    }
  }, [lat, lng])

  // Toggle satélite (híbrido) ↔ mapa de calles
  const toggleLayer = () => {
    if (!mapInst.current) return
    const { satellite: sat, street } = layersRef.current
    if (satellite) {
      mapInst.current.removeLayer(sat)
      street.addTo(mapInst.current)
    } else {
      mapInst.current.removeLayer(street)
      sat.addTo(mapInst.current)
    }
    setSatellite(v => !v)
    setNoImagery(false)
  }

  const search = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=pe`,
        { headers: { 'Accept-Language': 'es' } }
      )
      setResults(await res.json())
    } catch {}
    setSearching(false)
  }

  const pick = (r) => {
    const rlat = parseFloat(r.lat), rlng = parseFloat(r.lon)
    onChange(rlat, rlng)
    setResults([])
    setQuery(r.display_name.split(',')[0])
  }

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <form onSubmit={search} className="flex gap-2 relative">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar dirección en Perú..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-bark-700 border border-white/8 rounded-xl text-sm text-sand placeholder-sand-muted/35 focus:outline-none focus:border-terra/60 focus:shadow-[0_0_0_3px_rgba(201,164,78,0.10)] transition-all"
          />
        </div>
        <button type="submit" disabled={searching}
          className="px-4 rounded-xl bg-terra/15 border border-terra/25 text-terra-light text-xs font-bold hover:bg-terra/25 disabled:opacity-50 transition-colors whitespace-nowrap">
          {searching ? '...' : 'Buscar'}
        </button>
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bark-800 border border-white/12 rounded-xl overflow-hidden z-[9999] shadow-2xl">
            {results.map((r, i) => (
              <button key={i} type="button" onClick={() => pick(r)}
                className="w-full px-4 py-2.5 text-left text-xs text-sand-muted hover:bg-bark-700 hover:text-sand transition-colors border-b border-white/5 last:border-0 line-clamp-1">
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Map container */}
      <div className="relative">
        <div ref={mapRef}
          className="w-full rounded-xl overflow-hidden border border-white/8"
          style={{ height: 380, zIndex: 1, background: '#1C1308' }} />

        {/* Satellite/Street segmented toggle — arriba a la izquierda, fuera del paso de los controles de zoom */}
        <div
          className="absolute top-3 left-3 z-[400] flex items-center gap-0.5 p-0.5 rounded-lg"
          style={{ background: 'rgba(15,10,4,0.82)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}
        >
          <button
            type="button"
            onClick={() => { if (!satellite) toggleLayer() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all"
            style={{ background: satellite ? 'rgba(110,231,183,0.16)' : 'transparent', color: satellite ? '#6EE7B7' : '#9A8268' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            Satélite
          </button>
          <button
            type="button"
            onClick={() => { if (satellite) toggleLayer() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all"
            style={{ background: !satellite ? 'rgba(217,188,122,0.16)' : 'transparent', color: !satellite ? '#D9BC7A' : '#9A8268' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
            Mapa
          </button>
        </div>

        {/* Nivel de zoom */}
        <div
          className="absolute top-3 right-14 z-[400] px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
          style={{ background: 'rgba(15,10,4,0.82)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(154,130,104,0.85)', backdropFilter: 'blur(8px)' }}
        >
          Zoom {zoomLevel}
        </div>

        {/* Aviso: sin imagen satelital en esta zona/zoom */}
        {noImagery && satellite && (
          <div
            className="absolute bottom-3 left-3 right-3 z-[400] px-3.5 py-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-2"
            style={{ background: 'rgba(15,10,4,0.92)', border: '1px solid rgba(250,204,21,0.35)', color: '#FACC15', backdropFilter: 'blur(8px)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            No se pudo cargar la imagen en esta zona. Revisa tu conexión o usa modo Mapa.
          </div>
        )}
      </div>

      <p className="text-[11px] text-sand-muted/50">
        Busca la dirección, o haz clic en el mapa / arrastra el pin para ajustar la ubicación exacta.
      </p>
    </div>
  )
}
