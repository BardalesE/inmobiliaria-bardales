'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProperties, getStats } from '@/lib/api'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function AdminDashboard() {
  const router = useRouter()
  const [properties, setProperties] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [propsRes, statsRes] = await Promise.all([
        getProperties({ limit: 50 }),
        getStats()
      ])
      setProperties(propsRes.data)
      setStats(statsRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    setDeleting(id)
    try {
      await axios.delete(`${API}/properties/${id}`)
      setProperties(prev => prev.filter(p => p.id !== id))
      alert('Propiedad eliminada ✅')
    } catch (e) {
      alert('Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    router.push('/admin')
  }

  const STATUS_COLOR = {
    AVAILABLE: 'bg-emerald-500/20 text-emerald-400',
    RESERVED: 'bg-yellow-500/20 text-yellow-400',
    SOLD: 'bg-zinc-500/20 text-zinc-400'
  }
  const STATUS_LABEL = { AVAILABLE: 'Disponible', RESERVED: 'Separado', SOLD: 'Vendido' }

  return (
    <div className="min-h-screen bg-bark-900">
      {/* Navbar admin */}
      <nav className="bg-bark-800 border-b border-terra/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-sm">IB</div>
          <span className="font-display text-lg tracking-wide">Panel Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sand-muted text-sm hover:text-sand transition-colors">Ver sitio</Link>
          <Link href="/admin/leads" className="text-sand-muted text-sm hover:text-sand transition-colors">📥 Leads</Link>
          <button onClick={handleLogout} className="text-red-400 text-sm hover:text-red-300 transition-colors">Salir</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total lotes', value: stats.total, color: 'text-sand' },
              { label: 'Disponibles', value: stats.available, color: 'text-emerald-400' },
              { label: 'Separados', value: stats.reserved, color: 'text-yellow-400' },
              { label: 'Vendidos', value: stats.sold, color: 'text-zinc-400' },
            ].map((s, i) => (
              <div key={i} className="bg-bark-800 border border-white/5 rounded-xl p-4 text-center">
                <div className={`font-display text-3xl ${s.color}`}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wide text-sand-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl tracking-wide">Mis Lotes</h1>
          <Link
            href="/admin/properties/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white text-sm font-bold shadow-lg shadow-terra/30 hover:shadow-terra/50 transition-shadow"
          >
            ➕ Nuevo Lote
          </Link>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-sand-muted">Cargando...</div>
        ) : (
          <div className="bg-bark-800 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-sand-muted">Referencia</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-sand-muted">Título</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-sand-muted hidden sm:table-cell">Área</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-sand-muted hidden sm:table-cell">Precio</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-sand-muted">Estado</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-wide text-sand-muted">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-xs text-terra-light font-mono">{p.ref}</td>
                    <td className="px-4 py-3 text-sm text-sand font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-sm text-sand-muted hidden sm:table-cell">{p.area} m²</td>
                    <td className="px-4 py-3 text-sm text-sand-muted hidden sm:table-cell">S/ {p.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_COLOR[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/properties/${p.id}/edit`}
                          className="px-3 py-1.5 rounded-lg bg-bark-700 border border-white/10 text-sand text-xs font-semibold hover:border-terra/40 transition-colors"
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          disabled={deleting === p.id}
                          className="px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-900/50 transition-colors disabled:opacity-50"
                        >
                          {deleting === p.id ? '...' : '🗑️ Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}