'use client'
import Link from 'next/link'
import { WHATSAPP } from '@/lib/site'

/* Footer del sitio: marca, navegación y contacto */
export default function Footer() {
  return (
    <footer style={{ background: '#0A0603', borderTop: '1px solid rgba(255,255,255,0.045)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#C9A227,#E8C766)', boxShadow: '0 2px 12px rgba(201,162,39,0.3)' }}
              >
                EE
              </div>
              <span className="font-display text-base tracking-widest text-sand">EE-Stars</span>
            </div>
            <p className="text-xs leading-relaxed mb-5" style={{ color: 'rgba(154,130,104,0.55)' }}>
              La inmobiliaria digital del norte del Perú. Propiedades con título saneado, transparencia total.
            </p>
            {/* Social icons */}
            <div className="flex gap-2.5">
              {[
                { href: `https://wa.me/${WHATSAPP}`, bg: 'rgba(37,211,102,0.15)', color: '#22c55e', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> },
                { href: 'https://facebook.com', bg: 'rgba(24,119,242,0.12)', color: '#4f8ef5', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                { href: 'https://tiktok.com', bg: 'rgba(255,255,255,0.06)', color: 'rgba(154,130,104,0.7)', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg> },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: s.bg, color: s.color, border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ color: 'rgba(154,130,104,0.45)' }}>Navegación</p>
            <div className="flex flex-col gap-2.5">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/properties', label: 'Propiedades' },
                { href: '/publicar', label: 'Publicar propiedad' },
                { href: '#contacto', label: 'Contacto' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors duration-200 hover:text-terra-light"
                  style={{ color: 'rgba(154,130,104,0.6)' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ color: 'rgba(154,130,104,0.45)' }}>Contacto</p>
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/${WHATSAPP}`}
                className="flex items-center gap-2.5 text-sm transition-colors duration-200 hover:text-terra-light"
                style={{ color: 'rgba(154,130,104,0.6)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.12 1.21a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 6a16 16 0 006.29 6.29l.38-.38a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                WhatsApp directo
              </a>
              <div className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(154,130,104,0.45)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Chepén, La Libertad, Perú
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(154,130,104,0.28)' }}>
            © {new Date().getFullYear()} EE-Stars Inmobiliaria Digital
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(154,130,104,0.22)' }}>
            Chepén · La Libertad · Perú
          </p>
        </div>
      </div>
    </footer>
  )
}
