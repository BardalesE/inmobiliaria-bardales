'use client'
import Link from 'next/link'

/* Error boundary global del App Router */
export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-bark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 className="font-display text-3xl tracking-wide text-sand mb-2">Algo salió mal</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(154,130,104,0.7)' }}>
          Ocurrió un error inesperado. Puedes reintentar o volver al inicio.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #C9A227, #E8C766)' }}
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ border: '1px solid rgba(201,162,39,0.4)', color: '#E8C766' }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
