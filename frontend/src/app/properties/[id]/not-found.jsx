import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

/* 404 específico de propiedad: se muestra cuando el ID no existe en la BD */
export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-32">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(201,179,126,0.08)', border: '1px solid rgba(201,179,126,0.15)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(216,196,141,0.6)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-wide text-sand mb-2">Propiedad no encontrada</h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(154,130,104,0.7)' }}>
            Es posible que ya se haya vendido o que el enlace no sea correcto.
          </p>
          <Link
            href="/properties"
            className="inline-block px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #1F6D45, #2F8557)' }}
          >
            Ver propiedades disponibles
          </Link>
        </div>
      </div>
    </div>
  )
}
