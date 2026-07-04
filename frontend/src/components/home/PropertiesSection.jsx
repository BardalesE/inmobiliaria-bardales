'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FilterBar from '@/components/ui/FilterBar'
import PropertySlider from '@/components/ui/PropertySlider'
import { WHATSAPP } from '@/lib/site'

/* Catálogo de la home: barra de filtros, vista mosaico/lista, likes y paginación */
export default function PropertiesSection({ properties, loading, pagination, onFilter, onPageChange }) {
  const [viewMode, setViewMode] = useState('grid')
  const [likes, setLikes] = useState({})

  useEffect(() => {
    try { setLikes(JSON.parse(localStorage.getItem('ee_likes') || '{}')) } catch {}
  }, [])

  const toggleLike = (id) => {
    const next = { ...likes, [id]: !likes[id] }
    setLikes(next)
    try { localStorage.setItem('ee_likes', JSON.stringify(next)) } catch {}
  }

  return (
    <>
      {/* ── FILTER BAR ── */}
      <div id="propiedades">
        <FilterBar onFilter={onFilter} total={pagination.total} />
      </div>

      {/* ── GRID DE PROPIEDADES ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Section header */}
        <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
          <div>
            <div className="section-eyebrow">En venta ahora</div>
            <h2 className="font-display text-3xl sm:text-4xl tracking-wide leading-none">Propiedades en Venta</h2>
          </div>
          {/* View toggle */}
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{ background: 'rgba(42,30,16,0.65)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {[
              ['grid', <svg key="g" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>, 'Mosaico'],
              ['list', <svg key="l" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>, 'Lista'],
            ].map(([m, icon, label]) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                style={{
                  background: viewMode === m ? '#C4622D'                   : 'transparent',
                  color:       viewMode === m ? '#FDF6E9'                   : 'rgba(154,130,104,0.8)',
                  boxShadow:   viewMode === m ? '0 2px 8px rgba(196,98,45,0.3)' : 'none',
                }}
              >
                {icon}{label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)', background: '#1C1308' }}>
                <div className="skeleton h-52" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-2.5 w-20 rounded-full" />
                  <div className="skeleton h-4 w-3/4 rounded-lg" />
                  <div className="skeleton h-3 w-1/2 rounded-lg" />
                  <div className="skeleton h-9 rounded-xl" />
                </div>
              </div>
            ))}
          </div>

        ) : properties.length === 0 ? (
          <div className="text-center py-24">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(196,98,45,0.08)', border: '1px solid rgba(196,98,45,0.15)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(224,120,64,0.6)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
              </svg>
            </div>
            <p className="text-base font-semibold text-sand mb-1">No se encontraron propiedades</p>
            <p className="text-sm" style={{ color: 'rgba(154,130,104,0.6)' }}>Intenta con otros filtros</p>
          </div>

        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map(p => (
              <div
                key={p.id}
                className="group relative rounded-2xl overflow-hidden"
                style={{
                  background: '#1C1308',
                  border: '1px solid rgba(255,255,255,0.055)',
                  transition: 'border-color 0.28s ease, transform 0.28s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.28s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(196,98,45,0.30)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 16px 52px rgba(0,0,0,0.38), 0 0 0 1px rgba(196,98,45,0.10)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* ── Slider + badge overlay ── */}
                <div className="relative overflow-hidden" style={{ height: 216 }}>
                  <PropertySlider
                    images={p.images || []}
                    videoUrl={p.videoUrl || ''}
                    height={216}
                  />

                  {/* Status badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: p.status === 'AVAILABLE' ? 'rgba(16,185,129,0.88)'
                                  : p.status === 'RESERVED'  ? 'rgba(234,179,8,0.88)'
                                  : 'rgba(113,113,122,0.85)',
                        color: p.status === 'RESERVED' ? '#1C1308' : '#FDF6E9',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      {p.status === 'AVAILABLE' ? 'Disponible' : p.status === 'RESERVED' ? 'Separado' : 'Vendido'}
                    </span>
                  </div>

                  {/* Operation badge */}
                  {p.operation && (
                    <div className="absolute top-3 z-10" style={{ left: p.status ? 90 : 12 }}>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: p.operation === 'RENT' ? 'rgba(99,102,241,0.85)' : 'rgba(196,98,45,0.75)',
                          color: '#FDF6E9',
                          backdropFilter: 'blur(4px)',
                        }}>
                        {p.operation === 'RENT' ? 'Alquiler' : 'Venta'}
                      </span>
                    </div>
                  )}

                  {/* Area badge */}
                  <div className="absolute bottom-8 right-3 z-10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                    {p.area} m²
                  </div>

                  {/* Like button */}
                  <button type="button"
                    onClick={e => { e.preventDefault(); toggleLike(p.id) }}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: likes[p.id] ? 'rgba(196,98,45,0.88)' : 'rgba(0,0,0,0.48)',
                      backdropFilter: 'blur(4px)',
                      transform: likes[p.id] ? 'scale(1.12)' : 'scale(1)',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={likes[p.id] ? 'white' : 'none'} stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                  </button>

                  {/* Hover CTA */}
                  <div className="absolute bottom-8 left-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1.5 group-hover:translate-y-0">
                    <Link href={`/properties/${p.id}`}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-white"
                      style={{ background: 'rgba(196,98,45,0.92)', backdropFilter: 'blur(4px)' }}>
                      Ver ubicación →
                    </Link>
                  </div>
                </div>

                {/* ── Card body ── */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold tracking-[0.12em]" style={{ color: '#E07840' }}>{p.ref}</span>
                    <span className="text-[9px] uppercase tracking-wide font-medium" style={{ color: 'rgba(154,130,104,0.45)' }}>
                      {p.type?.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sand text-[0.875rem] mb-1.5 line-clamp-1 group-hover:text-terra-light transition-colors duration-200 leading-snug">
                    {p.title}
                  </h3>

                  <p className="text-[11px] mb-3 flex items-center gap-1" style={{ color: 'rgba(154,130,104,0.65)' }}>
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    {p.district}, {p.province}
                  </p>

                  {/* Rooms/bath row if available */}
                  {(p.rooms || p.bathrooms || p.floors) && (
                    <div className="flex items-center gap-3 mb-3 text-[10px] font-semibold" style={{ color: 'rgba(154,130,104,0.6)' }}>
                      {p.rooms && (
                        <span className="flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 20v-8a2 2 0 012-2h14a2 2 0 012 2v8"/><path d="M3 14h18M5 14V7a2 2 0 012-2h10a2 2 0 012 2v7"/></svg>
                          {p.rooms}
                        </span>
                      )}
                      {p.bathrooms && (
                        <span className="flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="3"/><line x1="5" x2="4" y1="11" y2="11"/><path d="M4 15h16"/></svg>
                          {p.bathrooms}
                        </span>
                      )}
                      {p.floors && (
                        <span className="flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/></svg>
                          {p.floors}p
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-[1.3rem] tracking-wide leading-none" style={{ color: '#E07840' }}>
                        S/ {p.price?.toLocaleString()}
                      </p>
                      {p.area > 0 && (
                        <p className="text-[9px] mt-0.5" style={{ color: 'rgba(154,130,104,0.45)' }}>
                          S/ {Math.round(p.price / p.area).toLocaleString()}/m²
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <a
                        href={`https://wa.me/${WHATSAPP}?text=Hola,%20me%20interesa%20la%20propiedad%20${p.ref}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center px-3 py-2 rounded-lg text-[10px] font-bold transition-colors duration-200"
                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.22)', color: '#22c55e' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.12)'}
                      >
                        WA
                      </a>
                      <Link
                        href={`/properties/${p.id}`}
                        className="px-3 py-2 rounded-lg text-white text-[10px] font-bold transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg,#C4622D,#E07840)' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(196,98,45,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                      >
                        Ver más →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : (
          /* List view */
          <div className="space-y-2.5">
            {properties.map(p => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="group flex gap-4 p-4 rounded-2xl transition-all duration-250"
                style={{
                  background: '#1C1308',
                  border: '1px solid rgba(255,255,255,0.055)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(196,98,45,0.25)'
                  e.currentTarget.style.transform = 'translateX(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)'
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {p.images?.[0] ? (
                  <Image
                    src={p.images[0].url}
                    alt={p.title}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(42,30,16,0.7)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(196,98,45,0.3)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-[10px] font-bold mb-1" style={{ color: '#E07840' }}>{p.ref}</p>
                  <h3 className="font-semibold text-sand text-sm group-hover:text-terra-light transition-colors duration-200 truncate">{p.title}</h3>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(154,130,104,0.6)' }}>{p.address}, {p.district}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display text-base tracking-wide" style={{ color: '#E07840' }}>S/ {p.price?.toLocaleString()}</span>
                    <span className="text-xs" style={{ color: 'rgba(154,130,104,0.5)' }}>{p.area} m²</span>
                  </div>
                </div>
                <button
                  onClick={e => { e.preventDefault(); toggleLike(p.id) }}
                  className="self-center flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    background: likes[p.id] ? 'rgba(196,98,45,0.15)' : 'transparent',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={likes[p.id] ? '#E07840' : 'none'} stroke={likes[p.id] ? '#E07840' : 'rgba(154,130,104,0.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </button>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-10">
            {[...Array(pagination.totalPages)].map((_, i) => {
              const active = pagination.page === i + 1
              return (
                <button
                  key={i}
                  onClick={() => onPageChange(i + 1)}
                  className="w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background:  active ? '#C4622D'                       : 'rgba(42,30,16,0.65)',
                    color:        active ? '#FDF6E9'                       : 'rgba(154,130,104,0.7)',
                    border:       active ? '1px solid rgba(196,98,45,0.5)' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow:    active ? '0 4px 16px rgba(196,98,45,0.28)' : 'none',
                    transform:    active ? 'scale(1.05)'                  : 'scale(1)',
                  }}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
