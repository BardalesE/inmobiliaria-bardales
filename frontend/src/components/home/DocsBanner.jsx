'use client'
import Link from 'next/link'

/* Banner de documentación verificada (contenido estático) */
export default function DocsBanner() {
  return (
    <section className="py-16 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-5xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-start gap-8"
          style={{
            background: 'linear-gradient(135deg, #1C1308 0%, #0F0A04 60%, #1a0d04 100%)',
            border: '1px solid rgba(201,164,78,0.22)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 80% at 10% 50%, rgba(201,164,78,0.13) 0%, transparent 65%)' }}
          />

          {/* Icon box */}
          <div
            className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(201,164,78,0.18) 0%, rgba(201,164,78,0.08) 100%)',
              border: '1px solid rgba(201,164,78,0.32)',
              boxShadow: '0 8px 28px rgba(201,164,78,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D9BC7A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>

          {/* Text block */}
          <div className="relative flex-1 text-center sm:text-left">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(217,188,122,0.65)' }}>
              Transparencia total
            </div>
            <h2 className="font-display text-3xl sm:text-4xl tracking-wide leading-tight mb-3" style={{ color: '#FDF6E9' }}>
              Propiedades con documentación<br className="hidden sm:block" /> verificada
            </h2>
            <p className="text-sm leading-relaxed mb-6 max-w-lg" style={{ color: 'rgba(154,130,104,0.75)' }}>
              Todas nuestras propiedades pasan por una revisión documental rigurosa antes de ser publicadas. Accede a planos, escrituras y registros públicos.
            </p>

            {/* Doc type tags */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-8">
              {['Título saneado', 'Habilitación urbana', 'Partida registral', 'Plano perimétrico'].map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(201,164,78,0.10)',
                    border: '1px solid rgba(201,164,78,0.22)',
                    color: '#D9BC7A',
                  }}
                >
                  ✓ {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/docs"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-bark-900 transition-all duration-250"
              style={{
                background: 'linear-gradient(135deg, #C9A44E, #D9BC7A)',
                boxShadow: '0 6px 24px rgba(201,164,78,0.32)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,164,78,0.48)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,164,78,0.32)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Ver documentación
            </Link>
          </div>

          {/* Decorative corner lines */}
          <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none opacity-[0.04]"
            style={{ background: 'radial-gradient(circle at 100% 100%, #D9BC7A 0%, transparent 70%)' }} />
        </div>
      </div>
    </section>
  )
}
