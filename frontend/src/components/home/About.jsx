/* Sección "Sobre EE-Stars": misión, visión y propósito (contenido estático) */
export default function About() {
  return (
    <section id="nosotros" className="py-20 px-4" style={{ background: '#1C1308', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-eyebrow">Nuestra historia</div>
          <h2 className="font-display text-4xl sm:text-5xl tracking-wide mb-3">Sobre EE-Stars</h2>
          <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(154,130,104,0.75)' }}>
            Nacimos en Chepén con una misión clara: digitalizar el mercado inmobiliario del norte del Perú.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor" strokeWidth="0"/>
                </svg>
              ),
              title: 'Misión',
              text: 'Democratizar el acceso a la información inmobiliaria en el Perú, conectando vendedores y compradores de forma simple, segura y eficiente.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              ),
              title: 'Visión',
              text: 'Ser la red inmobiliaria digital más grande del Perú, integrando tecnología, confianza y accesibilidad para todos.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                </svg>
              ),
              title: 'Por qué existimos',
              text: 'En el Perú existen miles de propiedades que no están en internet. Si no se ve, no existe. EE-Stars cambia eso.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="card-premium p-6 text-center"
              style={{
                background: '#0F0A04',
                borderTopWidth: 2,
                borderTopColor: 'rgba(201,179,126,0.30)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
                style={{
                  background: 'rgba(201,179,126,0.10)',
                  border: '1px solid rgba(201,179,126,0.22)',
                  color: '#D8C48D',
                }}
              >
                {item.icon}
              </div>
              <h3 className="font-display text-xl tracking-wide mb-3" style={{ color: '#D8C48D' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(154,130,104,0.8)' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
