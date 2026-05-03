'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import PropertyCard from '@/components/ui/PropertyCard'
import FilterBar from '@/components/ui/FilterBar'
import LeadForm from '@/components/ui/LeadForm'
import { getProperties, getStats } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '51999999999'

const Stars = ({ n = 5 }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-3.5 h-3.5 ${i < n ? 'text-yellow-400' : 'text-white/10'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118L10 15.347l-3.373 2.454c-.785.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.63 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
      </svg>
    ))}
  </div>
)

export default function HomePage() {
  const [properties, setProperties] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [testimonials, setTestimonials] = useState([])
  const [companies, setCompanies] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [likes, setLikes] = useState({})

  const fetchProperties = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await getProperties(params)
      setProperties(res.data)
      setPagination(res.pagination)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchProperties()
    getStats().then(r => setStats(r.data)).catch(() => {})
    fetch(`${API}/testimonials`).then(r => r.json()).then(d => setTestimonials(d.data || [])).catch(() => {})
    fetch(`${API}/companies`).then(r => r.json()).then(d => setCompanies(d.data || [])).catch(() => {})
    // Cargar likes del localStorage
    try { setLikes(JSON.parse(localStorage.getItem('ee_likes') || '{}')) } catch {}
  }, [fetchProperties])

  const handleFilter = (f) => { setFilters(f); fetchProperties(f) }

  const toggleLike = (id) => {
    const next = { ...likes, [id]: !likes[id] }
    setLikes(next)
    try { localStorage.setItem('ee_likes', JSON.stringify(next)) } catch {}
  }

  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />

      {/* ── REDES SOCIALES STICKY ── */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {[
          { href: `https://wa.me/${WHATSAPP}`, bg: '#25D366', svg: <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> },
          { href: 'https://facebook.com', bg: '#1877F2', svg: <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
          { href: 'https://tiktok.com', bg: '#010101', svg: <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg> },
        ].map((s, i) => (
          <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            style={{ background: s.bg }}>
            {s.svg}
          </a>
        ))}
      </div>

      {/* ── HERO CON VIDEO BACKGROUND ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center text-center">

        {/* Video background — reemplaza /videos/hero.mp4 con tu video real */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          poster="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&q=60"
        >
          {/* Pon aquí tu video: <source src="/videos/hero.mp4" type="video/mp4" /> */}
          {/* Mientras tanto usa el poster como fondo */}
        </video>

        {/* Overlay degradado */}
        <div className="absolute inset-0 bg-gradient-to-b from-bark-900/60 via-bark-900/40 to-bark-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(196,98,45,0.2),transparent)]" />

        {/* Contenido */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-terra/40 bg-terra/15 text-terra-light text-[10px] font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-terra-light animate-pulse" />
            Propiedades disponibles en Perú
          </div>

          <h1 className="font-display text-6xl sm:text-8xl tracking-wider mb-4 leading-none"
            style={{ background: 'linear-gradient(135deg, #FDF6E9 30%, #E07840 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ENCUENTRA TU<br />HOGAR IDEAL
          </h1>

          <p className="text-sand-muted text-lg sm:text-xl mb-10 leading-relaxed">
            La inmobiliaria digital del norte del Perú.<br />
            <strong className="text-sand">Casas · Terrenos · Lotes · Títulos saneados</strong>
          </p>

          {/* CTAs principales */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <a href="#propiedades"
              className="px-8 py-4 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold text-base shadow-xl shadow-terra/40 hover:shadow-terra/60 hover:scale-105 transition-all">
              🔍 Buscar propiedades
            </a>
            <Link href="/publicar"
              className="px-8 py-4 rounded-xl border-2 border-terra/40 text-terra-light font-bold text-base hover:bg-terra/10 hover:border-terra hover:scale-105 transition-all backdrop-blur-sm">
              + Publicar mi propiedad
            </Link>
            <a href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20información%20sobre%20propiedades`}
              target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-[#25D366]/90 text-white font-bold text-base hover:bg-[#25D366] hover:scale-105 transition-all backdrop-blur-sm flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              Contactar ahora
            </a>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex justify-center flex-wrap gap-8 pt-6 border-t border-terra/20">
              {[
                { n: stats.available, label: 'Disponibles' },
                { n: stats.total, label: 'Publicadas' },
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
      <div id="propiedades">
        <FilterBar onFilter={handleFilter} total={pagination.total} />
      </div>

      {/* ── GRID DE PROPIEDADES ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-display text-3xl tracking-wide">Propiedades en Venta</h2>
          <div className="flex items-center gap-1 bg-bark-800 border border-white/5 rounded-lg p-1">
            {[['grid','⊞ Mosaico'],['list','☰ Lista']].map(([m, label]) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode===m ? 'bg-terra text-white' : 'text-sand-muted hover:text-sand'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-bark-800 rounded-2xl overflow-hidden border border-terra/10">
                <div className="skeleton h-52" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-3 w-24 rounded" /><div className="skeleton h-5 w-3/4 rounded" /><div className="skeleton h-8 rounded" />
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
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map(p => (
              <div key={p.id} className="group relative bg-bark-800 border border-white/5 rounded-2xl overflow-hidden hover:border-terra/40 hover:shadow-xl hover:shadow-terra/10 hover:-translate-y-1 transition-all duration-300">
                {/* Imagen con zoom en hover */}
                <div className="relative overflow-hidden h-52">
                  {p.images?.[0] ? (
                    <img src={p.images[0].url} alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-bark-700 flex items-center justify-center text-4xl">🏠</div>
                  )}
                  {/* Overlay en hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Badge estado */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      p.status === 'AVAILABLE' ? 'bg-emerald-500 text-white' :
                      p.status === 'RESERVED' ? 'bg-yellow-500 text-black' : 'bg-zinc-500 text-white'
                    }`}>
                      {p.status === 'AVAILABLE' ? 'Disponible' : p.status === 'RESERVED' ? 'Separado' : 'Vendido'}
                    </span>
                  </div>
                  {/* Area badge */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    {p.area} m²
                  </div>
                  {/* Like button */}
                  <button onClick={(e) => { e.preventDefault(); toggleLike(p.id) }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
                    <span className={`text-base transition-all ${likes[p.id] ? 'scale-125' : 'scale-100'}`}>
                      {likes[p.id] ? '❤️' : '🤍'}
                    </span>
                  </button>
                  {/* CTA rápido en hover */}
                  <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <Link href={`/properties/${p.id}`}
                      className="text-[10px] font-bold bg-terra text-white px-3 py-1.5 rounded-lg hover:bg-terra-light transition-colors">
                      Ver ubicación →
                    </Link>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-[10px] text-terra-light font-bold mb-1">{p.ref}</p>
                  <h3 className="font-semibold text-sand text-sm mb-1 group-hover:text-terra-light transition-colors line-clamp-1">{p.title}</h3>
                  <p className="text-[11px] text-sand-muted mb-3 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                    {p.district}, {p.province}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-xl text-terra-light tracking-wide">S/ {p.price?.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-400">Negociable</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`https://wa.me/${WHATSAPP}?text=Hola,%20me%20interesa%20la%20propiedad%20${p.ref}`}
                        target="_blank" rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-[10px] font-bold hover:bg-[#25D366]/30 transition-colors">
                        WA
                      </a>
                      <Link href={`/properties/${p.id}`}
                        className="px-3 py-2 rounded-lg bg-gradient-to-br from-terra to-terra-light text-white text-[10px] font-bold hover:shadow-lg hover:shadow-terra/30 transition-all">
                        Ver más →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map(p => (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="flex gap-4 bg-bark-800 border border-white/5 hover:border-terra/30 rounded-2xl p-4 transition-all group hover:-translate-x-1">
                {p.images?.[0] && (
                  <img src={p.images[0].url} alt={p.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-terra-light font-bold mb-1">{p.ref}</p>
                  <h3 className="font-semibold text-sand group-hover:text-terra-light transition-colors truncate">{p.title}</h3>
                  <p className="text-xs text-sand-muted mt-0.5">{p.address}, {p.district}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-terra-light font-bold text-sm">S/ {p.price?.toLocaleString()}</span>
                    <span className="text-xs text-sand-muted">{p.area} m²</span>
                  </div>
                </div>
                <button onClick={e => { e.preventDefault(); toggleLike(p.id) }} className="text-xl self-center flex-shrink-0">
                  {likes[p.id] ? '❤️' : '🤍'}
                </button>
              </Link>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button key={i} onClick={() => fetchProperties({ ...filters, page: i+1 })}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  pagination.page === i+1 ? 'bg-terra text-white shadow-md' : 'bg-bark-800 border border-white/10 text-sand-muted hover:text-sand'
                }`}>{i+1}</button>
            ))}
          </div>
        )}
      </section>

      {/* ── TESTIMONIOS ── */}
      {testimonials.length > 0 && (
        <section className="py-16 px-4 bg-bark-800 border-t border-terra/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-terra/30 bg-terra/10 text-terra-light text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Casos reales</div>
              <h2 className="font-display text-4xl tracking-wide mb-2">Lo que dicen nuestros clientes</h2>
              <p className="text-sand-muted text-sm">Personas reales que cambiaron su vida con EE-Stars</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map(t => (
                <div key={t.id} className="bg-bark-900 border border-white/5 rounded-2xl p-6 hover:border-terra/20 hover:-translate-y-1 transition-all duration-300">
                  <Stars n={t.rating} />
                  <p className="text-sand-muted text-sm leading-relaxed mt-3 mb-4">"{t.comment}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    {t.avatar
                      ? <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      : <div className="w-10 h-10 rounded-full bg-terra/20 flex items-center justify-center text-terra-light font-bold">{t.name[0]}</div>
                    }
                    <div>
                      <p className="text-sm font-semibold text-sand">{t.name}</p>
                      <p className="text-[11px] text-sand-muted">{t.role}{t.city ? ` · ${t.city}` : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EMPRESAS ── */}
      {companies.length > 0 && (
        <section className="py-14 px-4 border-t border-terra/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-sand-muted mb-2">Trabajan con nosotros</p>
              <h2 className="font-display text-3xl tracking-wide">Empresas que confían en EE-Stars</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {companies.map(c => (
                <div key={c.id} className="flex flex-col items-center gap-3 bg-bark-800 border border-white/5 rounded-2xl px-6 py-5 hover:border-terra/20 hover:scale-105 transition-all">
                  {c.logo ? <img src={c.logo} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                    : <div className="w-12 h-12 rounded-full bg-terra/20 flex items-center justify-center text-terra-light font-bold text-lg">{c.name[0]}</div>}
                  <div className="text-center">
                    <p className="text-sm font-bold text-sand">{c.name}</p>
                    {c.comment && <p className="text-[10px] text-sand-muted mt-0.5">{c.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NOSOTROS ── */}
      <section id="nosotros" className="py-16 px-4 bg-bark-800 border-t border-terra/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl tracking-wide mb-3">Sobre EE-Stars</h2>
            <p className="text-sand-muted max-w-2xl mx-auto text-sm leading-relaxed">
              Nacimos en Chepén con una misión clara: digitalizar el mercado inmobiliario del norte del Perú.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'Misión', text: 'Democratizar el acceso a la información inmobiliaria en el Perú, conectando vendedores y compradores de forma simple, segura y eficiente.' },
              { icon: '🚀', title: 'Visión', text: 'Ser la red inmobiliaria digital más grande del Perú, integrando tecnología, confianza y accesibilidad para todos.' },
              { icon: '💡', title: 'Por qué existimos', text: 'En el Perú existen miles de propiedades que no están en internet. Si no se ve, no existe. EE-Stars cambia eso.' },
            ].map((item, i) => (
              <div key={i} className="bg-bark-900 border border-white/5 rounded-2xl p-6 text-center hover:border-terra/20 hover:-translate-y-1 transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-display text-xl tracking-wide text-terra-light mb-3">{item.title}</h3>
                <p className="text-sand-muted text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-14 px-4 border-t border-terra/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl tracking-wide mb-2">¿Cómo funciona?</h2>
            <p className="text-sand-muted text-sm">Simple como comprar en internet</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Busca tu propiedad', text: 'Filtra por zona, precio y tipo. Ve fotos y la ubicación exacta en el mapa.', icon: '🔍' },
              { n: '02', title: 'Contacta al equipo', text: 'Escríbenos por WhatsApp. Te respondemos en menos de 24 horas.', icon: '💬' },
              { n: '03', title: 'Cierra el trato', text: 'Te acompañamos: documentos, visita y firma.', icon: '🤝' },
            ].map((s, i) => (
              <div key={i} className="relative bg-bark-800 border border-white/5 rounded-2xl p-6 hover:border-terra/20 hover:-translate-y-1 transition-all">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="font-display text-5xl text-terra/15 absolute top-4 right-5">{s.n}</div>
                <h3 className="font-semibold text-sand text-base mb-2">{s.title}</h3>
                <p className="text-sand-muted text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="bg-bark-800 border-t border-terra/20 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-4xl tracking-wide mb-2">¿Te interesa alguna propiedad?</h2>
            <p className="text-sand-muted text-sm">Déjanos tus datos y te contactamos a la brevedad</p>
          </div>
          <div className="bg-bark-700 border border-terra/20 rounded-2xl p-6 mb-6"><LeadForm /></div>
          <div className="text-center">
            <p className="text-sand-muted text-xs mb-3">O escríbenos directamente</p>
            <a href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20información%20sobre%20sus%20propiedades`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#25D366] to-[#1aad52] text-white font-bold text-sm shadow-lg shadow-green-900/30 hover:scale-105 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              Chatear por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-bark-900 border-t border-terra/20 py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="font-display text-2xl text-terra-light tracking-widest mb-2">EE-Stars</div>
            <p className="text-xs text-sand-muted leading-relaxed">La inmobiliaria digital del norte del Perú.</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-sand-muted mb-3">Navegación</p>
            <div className="flex flex-col gap-2 text-sm text-sand-muted">
              <Link href="/" className="hover:text-terra-light transition-colors">Inicio</Link>
              <Link href="/properties" className="hover:text-terra-light transition-colors">Propiedades</Link>
              <Link href="/publicar" className="hover:text-terra-light transition-colors">Publicar propiedad</Link>
              <Link href="#contacto" className="hover:text-terra-light transition-colors">Contacto</Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-sand-muted mb-3">Contacto</p>
            <div className="flex flex-col gap-2 text-sm text-sand-muted">
              <a href={`https://wa.me/${WHATSAPP}`} className="hover:text-terra-light">WhatsApp</a>
              <p>Chepén, La Libertad, Perú</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-sand-muted/40">© {new Date().getFullYear()} EE-Stars Inmobiliaria Digital</p>
        </div>
      </footer>
    </div>
  )
}
