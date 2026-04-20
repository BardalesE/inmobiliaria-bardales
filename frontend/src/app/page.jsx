'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import PropertyCard from '@/components/ui/PropertyCard'
import FilterBar from '@/components/ui/FilterBar'
import LeadForm from '@/components/ui/LeadForm'
import { getProperties, getStats } from '@/lib/api'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '51999999999'

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})

  const fetchProperties = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await getProperties(params)
      setProperties(res.data)
      setPagination(res.pagination)
    } catch (e) {
      console.error('Error cargando propiedades:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
    getStats().then(r => setStats(r.data)).catch(() => {})
  }, [fetchProperties])

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
    fetchProperties(newFilters)
  }

  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 py-20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(196,98,45,0.15),transparent)]" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(196,98,45,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(196,98,45,0.05) 1px,transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-terra/30 bg-terra/10 text-terra-light text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-terra-light animate-pulse" />
            Propiedades disponibles
          </div>
          <h1 className="font-display text-5xl sm:text-7xl tracking-wider mb-4"
            style={{ background: 'linear-gradient(135deg, #FDF6E9 40%, #E07840 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ENCUENTRA TU<br />LOTE IDEAL
          </h1>
          <p className="text-sand-muted text-base sm:text-lg mb-8 leading-relaxed">
            Terrenos urbanos en los mejores sectores de Trujillo.<br />
            <strong className="text-sand">Títulos saneados · Precios negociables · Documentos en regla</strong>
          </p>

          {/* Stats */}
          {stats && (
            <div className="flex justify-center flex-wrap gap-8 pt-6 border-t border-terra/20">
              {[
                { n: stats.available, label: 'Disponibles' },
                { n: stats.total, label: 'Total lotes' },
                { n: `S/ ${stats.averagePrice?.toLocaleString()}`, label: 'Precio promedio' },
                { n: '100%', label: 'Títulos saneados' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-3xl text-terra-light tracking-wide">{s.n}</div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-sand-muted">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <FilterBar onFilter={handleFilter} total={pagination.total} />

      {/* ── GRID ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl tracking-wide">Lotes en Venta</h2>
          <span className="text-xs text-sand-muted">
            {pagination.totalPages > 1 && `Pág. ${pagination.page} de ${pagination.totalPages}`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-bark-800 rounded-2xl overflow-hidden border border-terra/10">
                <div className="skeleton h-52" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 text-sand-muted">
            <div className="text-5xl mb-4">🏚️</div>
            <p className="text-lg font-semibold text-sand">No se encontraron propiedades</p>
            <p className="text-sm mt-1">Intenta con otros filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-up">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => fetchProperties({ ...filters, page: i + 1 })}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  pagination.page === i + 1
                    ? 'bg-terra text-white shadow-md shadow-terra/30'
                    : 'bg-bark-800 border border-white/10 text-sand-muted hover:text-sand'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── CONTACT SECTION ── */}
      <section id="contacto" className="bg-bark-800 border-t border-terra/20 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-4xl tracking-wide mb-2">¿Te interesa algún lote?</h2>
            <p className="text-sand-muted text-sm">Déjanos tus datos y te contactamos a la brevedad</p>
          </div>

          <div className="bg-bark-700 border border-terra/20 rounded-2xl p-6 mb-6">
            <LeadForm />
          </div>

          <div className="text-center">
            <p className="text-sand-muted text-xs mb-3">O escríbenos directamente por WhatsApp</p>
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20información%20sobre%20sus%20lotes%20disponibles`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#25D366] to-[#1aad52] text-white font-bold text-sm shadow-lg shadow-green-900/30 hover:shadow-green-900/50 transition-shadow"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Chatear por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 px-4 border-t border-terra/20 bg-bark-900">
        <div className="font-display text-2xl text-terra-light tracking-widest mb-1">Inmobiliaria Bardales</div>
        <p className="text-xs text-sand-muted">Trujillo, La Libertad, Perú · Terrenos con títulos saneados</p>
        <p className="text-xs text-sand-muted/40 mt-4">© 2025 Inmobiliaria Bardales — Todos los derechos reservados</p>
      </footer>
    </div>
  )
}
