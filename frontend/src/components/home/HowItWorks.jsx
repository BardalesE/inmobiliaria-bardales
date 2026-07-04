/* Sección "¿Cómo funciona?": pasos del proceso (contenido estático) */
export default function HowItWorks() {
  return (
    <section className="py-20 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-eyebrow">Proceso</div>
          <h2 className="font-display text-4xl sm:text-5xl tracking-wide mb-3">¿Cómo funciona?</h2>
          <p className="text-sm" style={{ color: 'rgba(154,130,104,0.65)' }}>Simple como comprar en internet</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              n: '01',
              title: 'Busca tu propiedad',
              text: 'Filtra por zona, precio y tipo. Ve fotos y la ubicación exacta en el mapa.',
              icon: (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              ),
            },
            {
              n: '02',
              title: 'Contacta al equipo',
              text: 'Escríbenos por WhatsApp. Te respondemos en menos de 24 horas.',
              icon: (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              ),
            },
            {
              n: '03',
              title: 'Cierra el trato',
              text: 'Te acompañamos en documentos, visita y firma. Sin complicaciones.',
              icon: (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              ),
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card-premium relative p-6"
              style={{ background: '#1C1308' }}
            >
              {/* Step number watermark */}
              <div
                className="absolute top-4 right-5 font-display text-6xl leading-none select-none"
                style={{ color: 'rgba(196,98,45,0.08)' }}
              >
                {s.n}
              </div>
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: 'rgba(196,98,45,0.10)',
                  border: '1px solid rgba(196,98,45,0.20)',
                  color: '#E07840',
                }}
              >
                {s.icon}
              </div>
              {/* Step indicator */}
              <div
                className="text-[9px] font-bold tracking-[0.2em] uppercase mb-2"
                style={{ color: 'rgba(196,98,45,0.6)' }}
              >
                Paso {s.n}
              </div>
              <h3 className="font-semibold text-sand text-[0.9375rem] mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(154,130,104,0.75)' }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
