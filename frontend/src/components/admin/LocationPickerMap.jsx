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

    // Satellite layer (Esri World Imagery)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri · Maxar · Earthstar Geographics', maxZoom: 20, maxNativeZoom: 19 }
    )
    // Street layer (OSM)
    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '© OpenStreetMap', maxZoom: 19 }
    )

    satelliteLayer.addTo(map)
    layersRef.current = { satellite: satelliteLayer, street: streetLayer }

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

  // Toggle satellite ↔ street
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
            className="w-full pl-9 pr-3.5 py-2.5 bg-bark-700 border border-white/8 rounded-xl text-sm text-sand placeholder-sand-muted/35 focus:outline-none focus:border-terra/60 focus:shadow-[0_0_0_3px_rgba(201,179,126,0.10)] transition-all"
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
          style={{ height: 320, zIndex: 1 }} />

        {/* Satellite/Street toggle */}
        <button
          type="button"
          onClick={toggleLayer}
          className="absolute bottom-3 left-3 z-[400] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
          style={{
            background: 'rgba(15,10,4,0.82)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: satellite ? '#6EE7B7' : '#9A8268',
            backdropFilter: 'blur(8px)',
          }}
        >
          {satellite ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
              Satélite
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></svg>
              Mapa
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-sand-muted/50">
        Haz clic en el mapa o arrastra el pin para ubicar la propiedad exactamente.
      </p>
    </div>
  )
}
