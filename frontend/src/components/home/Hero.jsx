'use client'
import { useState } from 'react'
import Link from 'next/link'
import HeroVideoPlayer from '@/components/ui/HeroVideoPlayer'
import { WHATSAPP } from '@/lib/site'

/* Hero principal: video de fondo, título, buscador, CTAs y stats */
export default function Hero({ heroVideos, stats, onSearch }) {
  const [heroSearch, setHeroSearch] = useState('')

  const handleHeroSearch = (e) => {
    e.preventDefault()
    onSearch(heroSearch)
    document.getElementById('propiedades')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center text-center">

      {/* Video background */}
      <HeroVideoPlayer videos={heroVideos} />

      {/* ── Depth system: 4 composited layers, no paint ── */}

      {/* L1 — Vertical narrative: dark top + exposed middle + solid bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(15,10,4,0.62) 0%, rgba(15,10,4,0.08) 38%, rgba(15,10,4,0.08) 58%, rgba(15,10,4,0.97) 100%)' }}
      />

      {/* L2 — Terra ambient glow: drifts slowly (GPU-composited, zero repaint) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 88% 62% at 50% -4%, rgba(196,98,45,0.32) 0%, rgba(196,98,45,0.07) 52%, transparent 76%)',
          animation: 'driftAmbient 26s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />

      {/* L3 — Edge vignette: depth-of-field effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 125% 125% at 50% 50%, transparent 42%, rgba(8,4,1,0.72) 100%)' }}
      />

      {/* L4 — Central light shaft: Apple/Stripe style focal beam */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 22% 65% at 50% 0%, rgba(224,130,70,0.11) 0%, transparent 68%)' }}
      />

      {/* Content — max 896px, centered, breathing room on all screens */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-10 py-32 sm:py-28">

        {/* Badge — blur-reveals, then floats perpetually */}
        <div
          className="hero-badge-anim inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-terra-light text-[11px] font-bold tracking-[0.22em] uppercase mb-8 backdrop-blur-md"
          style={{
            border: '1px solid rgba(196,98,45,0.28)',
            background: 'rgba(196,98,45,0.07)',
            boxShadow: '0 0 0 1px rgba(196,98,45,0.10), 0 4px 22px rgba(196,98,45,0.13), inset 0 1px 0 rgba(255,255,255,0.055)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-terra-light animate-pulse flex-shrink-0" />
          Propiedades disponibles en Perú
        </div>

        {/* H1 — Luxury editorial: 5-stop gradient + warm drop-shadow */}
        <h1
          className="hero-reveal font-display text-[3.25rem] xs:text-6xl sm:text-[5.5rem] md:text-8xl tracking-wider leading-[0.88] mb-0"
          style={{
            animationDelay: '0.16s',
            background: 'linear-gradient(158deg, #FFFAF3 4%, #F8E8CC 32%, #E8894A 62%, #C05020 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 3px 32px rgba(196,98,45,0.24))',
          }}
        >
          ENCUENTRA TU<br />HOGAR IDEAL
        </h1>

        {/* Decorative separator */}
        <div
          className="hero-reveal flex items-center justify-center gap-3 my-7"
          style={{ animationDelay: '0.34s' }}
        >
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-terra/40" />
          <div
            className="w-1.5 h-1.5 rounded-full bg-terra flex-shrink-0"
            style={{ boxShadow: '0 0 10px 2px rgba(196,98,45,0.75)' }}
          />
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-terra/40" />
        </div>

        {/* Subtitle */}
        <p
          className="hero-reveal text-sand-muted text-base sm:text-lg mb-10 leading-relaxed max-w-lg mx-auto"
          style={{ animationDelay: '0.46s' }}
        >
          La inmobiliaria digital del norte del Perú.<br />
          <strong className="text-sand font-semibold">Casas · Terrenos · Lotes · Títulos saneados</strong>
        </p>

        {/* ── Hero search bar ── */}
        <form
          onSubmit={handleHeroSearch}
          className="hero-reveal flex items-stretch max-w-lg mx-auto mb-8 rounded-2xl overflow-hidden"
          style={{
            animationDelay: '0.54s',
            background: 'rgba(255,255,255,0.055)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <svg className="ml-4 self-center flex-shrink-0 opacity-45" width="15" height="15"
            viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={heroSearch}
            onChange={e => setHeroSearch(e.target.value)}
            placeholder="Buscar por zona, tipo o referencia…"
            className="flex-1 bg-transparent px-3 py-3.5 text-white placeholder-white/35 text-sm focus:outline-none min-w-0"
          />
          <button type="submit"
            className="px-6 py-3 font-bold text-sm text-white flex-shrink-0 transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #C4622D, #E07840)' }}
          >
            Buscar
          </button>
        </form>

        {/* CTAs — premium microinteractions via CSS classes */}
        <div
          className="hero-reveal flex flex-wrap justify-center gap-3 mb-14"
          style={{ animationDelay: '0.68s' }}
        >
          <a
            href="#propiedades"
            className="cta-terra inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold text-[0.9375rem]"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
            Buscar propiedades
          </a>
          <Link
            href="/publicar"
            className="cta-outline px-7 py-3.5 rounded-xl text-terra-light font-bold text-[0.9375rem] backdrop-blur-sm"
            style={{ border: '1px solid rgba(196,98,45,0.42)', background: 'rgba(196,98,45,0.04)' }}
          >
            + Publicar mi propiedad
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20información%20sobre%20propiedades`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-wa inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#22c55e]/85 text-white font-bold text-[0.9375rem]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Contactar ahora
          </a>
        </div>

        {/* Stats — glassmorphism panel */}
        {stats && (
          <div
            className="hero-reveal flex justify-center"
            style={{ animationDelay: '0.78s' }}
          >
            <div
              className="inline-flex items-center rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 36px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.055)',
              }}
            >
              {[
                { n: stats.available,                              label: 'Disponibles'   },
                { n: stats.total,                                  label: 'Publicadas'    },
                { n: `S/ ${stats.averagePrice?.toLocaleString()}`, label: 'Precio prom.'  },
                { n: '100%',                                       label: 'Títulos sanead.' },
              ].map((s, i, arr) => (
                <div key={i} className="flex items-center">
                  <div className="text-center px-5 sm:px-7 py-4">
                    <div className="font-display text-[1.75rem] sm:text-4xl text-terra-light tracking-wide leading-none">
                      {s.n}
                    </div>
                    <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.14em] text-sand-muted mt-1.5 whitespace-nowrap">
                      {s.label}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-7 w-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
