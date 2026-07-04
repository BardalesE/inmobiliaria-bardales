import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

/* Página 404 global */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-32">
        <div className="text-center max-w-md">
          <p className="font-display text-7xl tracking-wide mb-4" style={{ color: '#E07840' }}>404</p>
          <h1 className="font-display text-3xl tracking-wide text-sand mb-2">Página no encontrada</h1>
          <p className="text-sm mb-8" style={{ color: 'rgba(154,130,104,0.7)' }}>
            La página que buscas no existe o fue movida.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #C4622D, #E07840)' }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
