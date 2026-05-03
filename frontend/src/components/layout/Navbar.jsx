'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '51999999999'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/properties', label: 'Propiedades' },
    { href: '/#contacto', label: 'Contacto' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-bark-900/95 backdrop-blur-md border-b border-terra/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-lg shadow-lg shadow-terra/30">
            EE
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base tracking-widest text-sand">EE-Stars</span>
            <span className="text-[9px] tracking-[0.2em] uppercase text-terra-light">Perú · Inmobiliaria Digital</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href ? 'text-terra-light' : 'text-sand-muted hover:text-sand'
              }`}
            >
              {l.label}
            </Link>
          ))}

          {/* CTA Publicar */}
          <Link
            href="/publicar"
            className="px-4 py-2 rounded-lg border border-terra/40 text-terra-light text-xs font-bold tracking-wide hover:bg-terra/10 transition-colors"
          >
            + Publicar propiedad
          </Link>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20información%20sobre%20sus%20propiedades`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-gradient-to-br from-terra to-terra-light text-white text-xs font-bold tracking-wide shadow-md shadow-terra/30 hover:shadow-terra/50 transition-shadow"
          >
            WhatsApp
          </a>
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden text-sand text-2xl"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-bark-800 border-t border-terra/20 px-4 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sand text-sm font-medium" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/publicar"
            className="px-4 py-2.5 rounded-lg border border-terra/40 text-terra-light text-sm font-bold text-center"
            onClick={() => setOpen(false)}
          >
            + Publicar mi propiedad
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20información%20sobre%20sus%20propiedades`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-terra to-terra-light text-white text-sm font-bold text-center"
          >
            💬 WhatsApp
          </a>
        </div>
      )}
    </nav>
  )
}
