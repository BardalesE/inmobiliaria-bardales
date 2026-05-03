'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ImageGallery from '@/components/ui/ImageGallery'
import MapEmbed from '@/components/ui/MapEmbed'
import LeadForm from '@/components/ui/LeadForm'
import { getPropertyById } from '@/lib/api'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '51999999999'
const STATUS_LABEL = { AVAILABLE: 'Disponible', RESERVED: 'Separado', SOLD: 'Vendido' }
const STATUS_COLOR = {
  AVAILABLE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  RESERVED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  SOLD: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getPropertyById(id)
      .then(r => setProperty(r.data))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 animate-pulse">
        <div className="skeleton h-96 rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-10 w-full rounded" />
          <div className="skeleton h-4 w-48 rounded" />
          <div className="skeleton h-32 rounded" />
        </div>
      </div>
    </div>
  )

  if (!property) return null

  const priceM2 = property.area ? Math.round(property.price / property.area) : null
  const waMessage = encodeURIComponent(
    `Hola, vi el ${property.title} (${property.ref}) de ${property.area}m² por S/${property.price.toLocaleString()} en Inmobiliaria Bardales. ¿Sigue disponible?`
  )

  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center gap-2 text-xs text-sand-muted">
        <button onClick={() => router.push('/')} className="hover:text-terra-light transition-colors">Inicio</button>
        <span>›</span>
        <span className="text-sand">{property.ref}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid md:grid-cols-[1fr_380px] gap-8">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">
          <ImageGallery images={property.images} title={property.title} />

          {/* Title block */}
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.14em] text-terra-light font-semibold">{property.ref}</span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLOR[property.status]}`}>
                {STATUS_LABEL[property.status]}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-sand mb-2 leading-tight">{property.title}</h1>
            <p className="flex items-center gap-1.5 text-sm text-sand-muted">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
              </svg>
              {property.address}, {property.district}, {property.province}, {property.department}
            </p>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Área total', value: `${property.area} m²` },
              { label: 'Precio', value: `S/ ${property.price.toLocaleString()}` },
              { label: 'Precio/m²', value: priceM2 ? `S/ ${priceM2}` : '—' },
              { label: 'Manzana', value: property.block || '—' },
              { label: 'Lote', value: property.lot || '—' },
              { label: 'Sector', value: property.sector || '—' },
              ...(property.frontage ? [{ label: 'Frente', value: `${property.frontage} m` }] : []),
              ...(property.depth ? [{ label: 'Fondo', value: `${property.depth} m` }] : []),
            ].map((s, i) => (
              <div key={i} className="bg-bark-800 border border-white/5 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wide text-sand-muted mb-1">{s.label}</p>
                <p className="font-bold text-sand text-sm">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-bark-800 border border-white/5 rounded-xl p-4">
              <h3 className="font-display text-lg tracking-wide mb-2">Descripción</h3>
              <p className="text-sm text-sand-muted leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {property.features?.length > 0 && (
            <div>
              <h3 className="font-display text-lg tracking-wide mb-3">Características</h3>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-bark-800 border border-white/5 rounded-lg text-xs font-medium text-sand">
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.latitude && property.longitude && (
            <div>
              <h3 className="font-display text-lg tracking-wide mb-3">Ubicación</h3>
              <MapEmbed lat={property.latitude} lng={property.longitude} title={property.title} />
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">

          {/* Price card */}
          <div className="bg-bark-800 border border-terra/30 rounded-2xl p-5 sticky top-20">
            <p className="text-[10px] uppercase tracking-wide text-sand-muted mb-1">Precio de venta</p>
            <p className="font-display text-4xl text-terra-light tracking-wide mb-1">S/ {property.price.toLocaleString()}</p>
            <p className="text-xs text-emerald-400 font-semibold mb-4">✓ Precio negociable</p>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WHATSAPP}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-br from-[#25D366] to-[#1aad52] text-white font-bold text-sm shadow-lg shadow-green-900/30 hover:shadow-green-900/50 transition-shadow mb-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Consultar por WhatsApp
            </a>

            <a
              href={`tel:+${WHATSAPP}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-bark-700 border border-terra/30 text-sand font-semibold text-sm hover:bg-terra/10 transition-colors"
            >
              📞 Llamar ahora
            </a>

            <div className="border-t border-white/5 mt-4 pt-4">
              <p className="text-xs font-semibold text-sand mb-3">O envíanos un mensaje</p>
              <LeadForm propertyId={property.id} propertyTitle={property.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
