'use client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ImageGallery from '@/components/ui/ImageGallery'
import MapEmbed from '@/components/ui/MapEmbed'
import LeadForm from '@/components/ui/LeadForm'
import { WHATSAPP } from '@/lib/site'

/* Build a Cloudinary forced-download URL with a proper filename */
function pdfDownloadUrl(url, title = 'documento') {
  if (!url) return url
  const safeName = (title || 'documento')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + '.pdf'
  return url.replace('/upload/', `/upload/fl_attachment:${safeName}/`)
}

const STATUS_CFG = {
  AVAILABLE: { label: 'Disponible',  bg: 'rgba(201,164,78,0.14)', border: 'rgba(201,164,78,0.32)', color: '#D9BC7A' },
  RESERVED:  { label: 'Separado',   bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.30)',  color: '#fbbf24' },
  SOLD:      { label: 'Vendido',    bg: 'rgba(113,113,122,0.12)',border: 'rgba(113,113,122,0.25)',color: '#a1a1aa' },
  HIDDEN:    { label: 'Oculto',     bg: 'rgba(113,113,122,0.12)',border: 'rgba(113,113,122,0.25)',color: '#a1a1aa' },
  DRAFT:     { label: 'Borrador',   bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.28)', color: '#818cf8' },
}

const OP_CFG = {
  SALE: { label: 'En venta',   bg: 'rgba(201,164,78,0.14)',  border: 'rgba(201,164,78,0.30)',  color: '#D9BC7A' },
  RENT: { label: 'En alquiler', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.28)', color: '#818cf8' },
}

const TYPE_LABELS = {
  URBAN_LOT: 'Lote urbano', HOUSE: 'Casa', APARTMENT: 'Departamento',
  COMMERCIAL: 'Local comercial', LAND: 'Terreno', OTHER: 'Otro',
}

/* ── Spec card ─────────────────────────────────── */
function SpecCard({ label, value, accent }) {
  return (
    <div
      className="rounded-xl p-3.5 transition-all duration-250 group/spec"
      style={{
        background: 'rgba(28,19,8,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(201,164,78,0.22)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.22)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <p className="text-[9px] uppercase tracking-[0.14em] font-bold mb-1.5"
        style={{ color: 'rgba(154,130,104,0.5)' }}>
        {label}
      </p>
      <p className={`font-bold text-sm leading-tight ${accent ? '' : 'text-sand'}`}
        style={accent ? { color: '#D9BC7A' } : {}}>
        {value}
      </p>
    </div>
  )
}

export default function PropertyDetailClient({ property }) {
  const router = useRouter()

  const priceM2   = property.area ? Math.round(property.price / property.area) : null
  const statusCfg = STATUS_CFG[property.status] || STATUS_CFG.AVAILABLE
  const opCfg     = OP_CFG[property.operation]  || OP_CFG.SALE
  const typeLabel = TYPE_LABELS[property.type]  || property.type
  const waMessage = encodeURIComponent(
    `Hola, vi el ${property.title} (${property.ref}) de ${property.area}m² por S/${property.price.toLocaleString()} en EE-Stars. ¿Sigue disponible?`
  )

  return (
    <div className="min-h-screen" style={{ background: '#0D0804' }}>
      <Navbar />

      {/* ── Ambient background glow ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(201,164,78,0.06) 0%, transparent 70%)',
        }} />
      </div>

      {/* ── Breadcrumb ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-3 flex items-center gap-2">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors duration-200"
          style={{ color: 'rgba(154,130,104,0.55)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#D9BC7A'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(154,130,104,0.55)'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
          </svg>
          Inicio
        </button>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(154,130,104,0.3)" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <button
          onClick={() => router.back()}
          className="text-xs font-medium transition-colors duration-200"
          style={{ color: 'rgba(154,130,104,0.55)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#D9BC7A'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(154,130,104,0.55)'}
        >
          Propiedades
        </button>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(154,130,104,0.3)" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <span className="text-xs font-semibold" style={{ color: '#D9BC7A' }}>{property.ref}</span>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-2 grid grid-cols-1 md:grid-cols-[1fr_390px] gap-8 lg:gap-12 items-start">

        {/* ════════════════ LEFT COLUMN ════════════════ */}
        <div className="space-y-8">

          {/* Hero gallery */}
          <ImageGallery images={property.images} videos={property.videos || []} videoUrl={property.videoUrl || ''} title={property.title} />

          {/* ── Title block ── */}
          <div className="space-y-4">
            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(217,188,122,0.7)' }}>
                {property.ref}
              </span>
              <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(154,130,104,0.3)' }} />
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, color: statusCfg.color }}>
                {statusCfg.label}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: opCfg.bg, border: `1px solid ${opCfg.border}`, color: opCfg.color }}>
                {opCfg.label}
              </span>
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(154,130,104,0.6)' }}>
                {typeLabel}
              </span>
            </div>

            {/* Main title */}
            <h1
              className="font-display tracking-wide leading-[0.93]"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
                color: '#FDF6E9',
                textShadow: '0 2px 24px rgba(0,0,0,0.4)',
              }}
            >
              {property.title}
            </h1>

            {/* Address */}
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="#D9BC7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(154,130,104,0.75)' }}>
                {property.address}
                {property.district && `, ${property.district}`}
                {property.province && `, ${property.province}`}
                {property.department && `, ${property.department}`}
              </p>
            </div>
          </div>

          {/* ── Separator ── */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(201,164,78,0.4)' }} />
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>

          {/* ── Specs grid ── */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-3" style={{ color: 'rgba(154,130,104,0.45)' }}>
              Ficha técnica
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <SpecCard label="Área total"  value={`${property.area} m²`} accent />
              <SpecCard label="Precio"      value={`S/ ${property.price.toLocaleString()}`} accent />
              <SpecCard label="Precio / m²" value={priceM2 ? `S/ ${priceM2.toLocaleString()}/m²` : '—'} />
              {property.frontage && <SpecCard label="Frente"   value={`${property.frontage} m`} />}
              {property.depth    && <SpecCard label="Fondo"    value={`${property.depth} m`} />}
              {property.block    && <SpecCard label="Manzana"  value={property.block} />}
              {property.lot      && <SpecCard label="Lote"     value={property.lot} />}
              {property.sector   && <SpecCard label="Sector"   value={property.sector} />}
              {property.rooms    && <SpecCard label="Dormitorios" value={property.rooms} />}
              {property.bathrooms && <SpecCard label="Baños"   value={property.bathrooms} />}
              {property.floors   && <SpecCard label="Pisos"    value={property.floors} />}
              {property.yearBuilt && <SpecCard label="Año"     value={property.yearBuilt} />}
              {property.parking  && <SpecCard label="Cochera"  value="Incluida" />}
            </div>
          </div>

          {/* ── Description ── */}
          {property.description && (
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: 'rgba(28,19,8,0.55)',
                border: '1px solid rgba(255,255,255,0.055)',
                borderLeft: '3px solid rgba(201,164,78,0.45)',
              }}
            >
              <h3 className="font-display text-xl tracking-wide mb-3" style={{ color: '#D9BC7A' }}>
                Descripción
              </h3>
              <p className="text-sm leading-7" style={{ color: 'rgba(154,130,104,0.85)' }}>
                {property.description}
              </p>
            </div>
          )}

          {/* ── Features / amenities ── */}
          {property.features?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-3" style={{ color: 'rgba(154,130,104,0.45)' }}>
                Características
              </p>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(201,164,78,0.08)',
                      border: '1px solid rgba(201,164,78,0.20)',
                      color: '#D9BC7A',
                    }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Map ── */}
          {property.latitude && property.longitude && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-3" style={{ color: 'rgba(154,130,104,0.45)' }}>
                Ubicación en el mapa
              </p>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <MapEmbed lat={property.latitude} lng={property.longitude} title={property.title} />
              </div>
            </div>
          )}

          {/* ── Documentos ── */}
          {(() => {
            const docs = property.documents?.length
              ? property.documents
              : (property.documentUrl ? [{ url: property.documentUrl, name: null }] : [])
            if (!docs.length) return null
            return (
              <div className="space-y-2.5">
                {docs.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{
                      background: 'rgba(201,164,78,0.06)',
                      border: '1px solid rgba(201,164,78,0.15)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(201,164,78,0.12)', border: '1px solid rgba(201,164,78,0.22)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D9BC7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-sand">{doc.name || 'Documentación disponible'}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(154,130,104,0.5)' }}>Planos, escrituras o brochure adjunto</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Open in browser — works when URL ends in .pdf (new uploads) */}
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold px-3 py-2 rounded-lg transition-all duration-200"
                        style={{ background: 'rgba(201,164,78,0.15)', border: '1px solid rgba(201,164,78,0.25)', color: '#D9BC7A' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,164,78,0.28)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,164,78,0.15)'}
                      >
                        Ver PDF ↗
                      </a>
                      {/* Force download with correct .pdf filename */}
                      <a
                        href={pdfDownloadUrl(doc.url, doc.name || property.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold px-3 py-2 rounded-lg transition-all duration-200"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(154,130,104,0.75)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        ↓ Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* ════════════════ RIGHT COLUMN ════════════════ */}
        <div className="relative">
          <div
            className="sticky top-24 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(18,12,6,0.92)',
              border: '1px solid rgba(201,164,78,0.18)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Terra glow header strip */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent 0%, #C9A44E 35%, #D9BC7A 65%, transparent 100%)' }} />

            <div className="p-6">

              {/* Operation badge */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold"
                  style={{ color: 'rgba(154,130,104,0.45)' }}>
                  {opCfg.label.toUpperCase()}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, color: statusCfg.color }}>
                  {statusCfg.label}
                </span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <p className="font-display tracking-wide leading-none"
                  style={{ fontSize: 42, background: 'linear-gradient(135deg,#FDF6E9 30%,#D9BC7A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  S/ {property.price.toLocaleString()}
                </p>
                {priceM2 && (
                  <p className="text-[11px] mt-1.5 font-medium" style={{ color: 'rgba(154,130,104,0.5)' }}>
                    S/ {priceM2.toLocaleString()} por m² · {property.area} m²
                  </p>
                )}
              </div>

              {/* Negotiable */}
              <div className="flex items-center gap-1.5 mb-6 text-[11px] font-semibold"
                style={{ color: 'rgba(217,188,122,0.85)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                Precio negociable
              </div>

              {/* Separator */}
              <div className="h-px mb-6" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* WA CTA — premium glow */}
              <a
                href={`https://wa.me/${WHATSAPP}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-bold text-sm text-bark-900 mb-2.5 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #8F7332 0%, #C9A44E 55%, #D9BC7A 100%)',
                  boxShadow: '0 6px 24px rgba(201,164,78,0.30)',
                  transition: 'box-shadow 0.25s ease, transform 0.20s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 36px rgba(201,164,78,0.50)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,164,78,0.30)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#0F0A04">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Consultar por WhatsApp
              </a>

              {/* Call button */}
              <a
                href={`tel:+${WHATSAPP}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm mb-5 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(154,130,104,0.85)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(201,164,78,0.10)'
                  e.currentTarget.style.borderColor = 'rgba(201,164,78,0.25)'
                  e.currentTarget.style.color = '#D9BC7A'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
                  e.currentTarget.style.color = 'rgba(154,130,104,0.85)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-2.95-8.72A2 2 0 012.14 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8a16 16 0 006.29 6.29l.38-.38a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
                Llamar ahora
              </a>

              {/* Lead form separator */}
              <div className="relative flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />
                <span className="text-[10px] uppercase tracking-[0.14em] font-bold"
                  style={{ color: 'rgba(154,130,104,0.35)' }}>
                  o envía un mensaje
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />
              </div>

              {/* Lead form */}
              <LeadForm propertyId={property.id} propertyTitle={property.title} />
            </div>

            {/* Bottom trust badges */}
            <div className="px-6 py-4 flex items-center justify-center gap-5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
              {[
                { icon: '🔒', label: 'Datos seguros' },
                { icon: '⚡', label: 'Respuesta rápida' },
                { icon: '✓',  label: 'Título saneado' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[9px] font-semibold"
                  style={{ color: 'rgba(154,130,104,0.4)' }}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
