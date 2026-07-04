'use client'
import Image from 'next/image'

/* Sección de empresas aliadas (se oculta si no hay datos) */
export default function Companies({ companies }) {
  if (!companies?.length) return null

  return (
    <section className="py-16 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="section-eyebrow">Alianzas</div>
          <h2 className="font-display text-3xl sm:text-4xl tracking-wide">Empresas que confían en EE-Stars</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {companies.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-250"
              style={{
                background: 'rgba(28,19,8,0.8)',
                border: '1px solid rgba(255,255,255,0.055)',
                transition: 'border-color 0.25s ease, transform 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(196,98,45,0.22)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {c.logo
                ? <Image src={c.logo} alt={c.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{ background: 'rgba(196,98,45,0.15)', color: '#E07840' }}
                  >
                    {c.name[0]}
                  </div>
                )
              }
              <div>
                <p className="text-sm font-semibold text-sand leading-tight">{c.name}</p>
                {c.comment && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(154,130,104,0.55)' }}>{c.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
