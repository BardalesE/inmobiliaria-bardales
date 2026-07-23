'use client'
import Image from 'next/image'

const Stars = ({ n = 5 }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-3.5 h-3.5 ${i < n ? 'text-yellow-400' : 'text-white/10'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118L10 15.347l-3.373 2.454c-.785.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.63 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/>
      </svg>
    ))}
  </div>
)

/* Sección de testimonios de clientes (se oculta si no hay datos) */
export default function Testimonials({ testimonials }) {
  if (!testimonials?.length) return null

  return (
    <section className="py-20 px-4" style={{ background: '#1C1308', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="section-eyebrow">Casos reales</div>
          <h2 className="font-display text-4xl sm:text-5xl tracking-wide mb-3">Lo que dicen nuestros clientes</h2>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(154,130,104,0.7)' }}>
            Personas reales que cambiaron su vida con EE-Stars
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div
              key={t.id}
              className="card-premium p-6 flex flex-col"
              style={{ background: '#0F0A04' }}
            >
              {/* Quote mark + stars */}
              <div className="flex items-start justify-between mb-4">
                <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true">
                  <path d="M0 20V12.5C0 8.833 1.167 5.917 3.5 3.75 5.833 1.583 8.833.333 12.5 0L13.5 2C11.167 2.667 9.333 3.75 8 5.25S6 8.5 6 10.5H12V20H0zm16 0V12.5c0-3.667 1.167-6.583 3.5-8.75C21.833 1.583 24.833.333 28.5 0L29.5 2c-2.333.667-4.167 1.75-5.5 3.25S22 8.5 22 10.5H28V20H16z" fill="rgba(201,162,39,0.18)"/>
                </svg>
                <Stars n={t.rating} />
              </div>
              <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'rgba(154,130,104,0.85)' }}>
                {t.comment}
              </p>
              <div
                className="flex items-center gap-3 pt-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                {t.avatar
                  ? <Image src={t.avatar} alt={t.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  : (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{ background: 'rgba(201,162,39,0.15)', color: '#E8C766' }}
                    >
                      {t.name[0]}
                    </div>
                  )
                }
                <div>
                  <p className="text-sm font-semibold text-sand leading-tight">{t.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(154,130,104,0.55)' }}>
                    {t.role}{t.city ? ` · ${t.city}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
