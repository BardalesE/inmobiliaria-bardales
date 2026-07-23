'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WHATSAPP } from '@/lib/site'

const WaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const links = [
  { href: '/',           label: 'Inicio'       },
  { href: '/properties', label: 'Propiedades'  },
  { href: '/#contacto',  label: 'Contacto'     },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: 'rgba(15,10,4,0.90)',
        borderBottom: '1px solid rgba(201,179,126,0.13)',
        boxShadow: '0 1px 0 rgba(201,179,126,0.07), 0 4px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[58px]">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display text-sm flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #C9B37E 0%, #D8C48D 100%)',
              boxShadow: '0 2px 14px rgba(201,179,126,0.38)',
              transition: 'box-shadow 0.25s ease',
            }}
          >
            EE
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-[15px] tracking-widest text-sand group-hover:text-terra-light transition-colors duration-200">
              EE-Stars
            </span>
            <span className="text-[8px] tracking-[0.22em] uppercase" style={{ color: 'rgba(216,196,141,0.65)' }}>
              Inmobiliaria Digital · Perú
            </span>
          </div>
        </Link>

        {/* ── Desktop links ── */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${active ? ' nav-link--active' : ''}`}
              >
                {l.label}
              </Link>
            )
          })}

          {/* Divider */}
          <div className="w-px h-4 mx-3" style={{ background: 'rgba(255,255,255,0.07)' }} />

          {/* Publicar */}
          <Link
            href="/publicar"
            className="cta-outline px-4 py-2 rounded-lg text-terra-light text-xs font-bold tracking-wide"
            style={{ border: '1px solid rgba(201,179,126,0.35)', background: 'transparent' }}
          >
            + Publicar propiedad
          </Link>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20información%20sobre%20sus%20propiedades`}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-wa ml-1.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-bold"
            style={{ background: 'rgba(34,197,94,0.82)' }}
          >
            <WaIcon />
            WhatsApp
          </a>
        </div>

        {/* ── Mobile toggle ── */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: open ? '#D8C48D' : '#9A8268' }}
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h10"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div
          className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1"
          style={{
            background: 'rgba(20,13,5,0.98)',
            borderTop: '1px solid rgba(201,179,126,0.10)',
          }}
        >
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color:      active ? '#D8C48D' : '#9A8268',
                  background: active ? 'rgba(201,179,126,0.08)' : 'transparent',
                }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            )
          })}

          <div className="h-px mx-2 my-1.5" style={{ background: 'rgba(255,255,255,0.05)' }} />

          <Link
            href="/publicar"
            className="px-4 py-3 rounded-xl text-terra-light text-sm font-bold text-center"
            style={{ border: '1px solid rgba(201,179,126,0.32)', background: 'rgba(201,179,126,0.05)' }}
            onClick={() => setOpen(false)}
          >
            + Publicar mi propiedad
          </Link>

          <a
            href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20información%20sobre%20sus%20propiedades`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-bold"
            style={{ background: 'rgba(34,197,94,0.82)' }}
          >
            <WaIcon />
            Contactar por WhatsApp
          </a>
        </div>
      )}
    </nav>
  )
}
