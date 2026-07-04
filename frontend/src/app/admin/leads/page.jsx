'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api, { updateLeadStatus } from '@/lib/api'
import { useAdminAuth } from '@/lib/useAdminAuth'

const STATUS_LABELS = {
  NUEVO:      { label: 'Nuevo',      color: 'text-blue-400 bg-blue-900/20 border-blue-500/20' },
  CONTACTADO: { label: 'Contactado', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/20' },
  CERRADO:    { label: 'Cerrado',    color: 'text-emerald-400 bg-emerald-900/20 border-emerald-500/20' },
}

export default function AdminLeads() {
  const { user, loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    api.get('/leads', { params: { limit: 100 } })
      .then(res => setLeads(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const deleteLead = async (id) => {
    if (!confirm('¿Eliminar esta consulta?')) return
    await api.delete(`/leads/${id}`).catch(console.error)
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  const changeStatus = async (id, status) => {
    await updateLeadStatus(id, status).catch(console.error)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const handleCreateProperty = (lead) => {
    const params = new URLSearchParams({
      prefill_name:    lead.name,
      prefill_phone:   lead.phone,
      prefill_email:   lead.email  || '',
      prefill_message: lead.message || '',
      prefill_leadId:  lead.id,
    })
    router.push(`/admin/properties/new?${params.toString()}`)
  }

  const filtered = filter === 'all'     ? leads
    : filter === 'sellers'              ? leads.filter(l => l.source === 'seller')
    : leads.filter(l => l.source !== 'seller')

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bark-900 flex items-center justify-center">
        <p className="text-sand-muted text-sm">Verificando sesión...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bark-900">
      <nav className="bg-bark-800 border-b border-terra/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-sm">EE</div>
          <span className="font-display text-lg tracking-wide">Consultas y Vendedores</span>
        </div>
        <Link href="/admin/dashboard" className="text-sand-muted text-sm hover:text-sand">← Panel</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-display text-3xl tracking-wide">{leads.length} registros totales</h1>
          <div className="flex gap-2">
            {[['all','Todos'],['buyers','Compradores'],['sellers','Vendedores']].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter===v ? 'bg-terra text-white' : 'bg-bark-800 border border-white/10 text-sand-muted'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-sand-muted">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sand-muted">No hay registros aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(lead => {
              const statusInfo = STATUS_LABELS[lead.status] || STATUS_LABELS.NUEVO
              return (
                <div key={lead.id} className="bg-bark-800 border border-white/5 rounded-2xl p-5 hover:border-terra/20 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-sand">{lead.name}</h3>
                        <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full border ${
                          lead.source === 'seller'
                            ? 'text-terra-light bg-terra/10 border-terra/20'
                            : 'text-blue-400 bg-blue-900/20 border-blue-500/20'
                        }`}>
                          {lead.source === 'seller' ? 'Quiere publicar' : 'Comprador'}
                        </span>
                        {/* Status badge */}
                        <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-sand-muted mb-2">
                        <a href={`tel:${lead.phone}`} className="hover:text-terra-light">📞 {lead.phone}</a>
                        {lead.email && <a href={`mailto:${lead.email}`} className="hover:text-terra-light">✉️ {lead.email}</a>}
                      </div>
                      {lead.message && (
                        <p className="text-xs text-sand-muted bg-bark-700 rounded-lg px-3 py-2 border border-white/5 mb-2">{lead.message}</p>
                      )}
                      {lead.property && (
                        <p className="text-xs text-terra-light">🏠 {lead.property.title} ({lead.property.ref})</p>
                      )}

                      {/* Status selector */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wide text-sand-muted">Estado:</span>
                        <select
                          value={lead.status || 'NUEVO'}
                          onChange={e => changeStatus(lead.id, e.target.value)}
                          className="text-xs bg-bark-700 border border-white/10 text-sand rounded-lg px-2 py-1 cursor-pointer"
                        >
                          <option value="NUEVO">Nuevo</option>
                          <option value="CONTACTADO">Contactado</option>
                          <option value="CERRADO">Cerrado</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end flex-shrink-0">
                      <p className="text-[10px] text-sand-muted">
                        {new Date(lead.createdAt).toLocaleDateString('es-PE', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </p>
                      <a
                        href={`https://wa.me/${(lead.phone||'').replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(lead.name)}%2C%20soy%20de%20EE-Stars.`}
                        target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-900/50"
                      >
                        💬 WhatsApp
                      </a>
                      {lead.source === 'seller' && (
                        <button
                          onClick={() => handleCreateProperty(lead)}
                          className="px-3 py-1.5 rounded-lg bg-terra/20 border border-terra/30 text-terra-light text-xs font-bold hover:bg-terra/30"
                        >
                          + Crear propiedad
                        </button>
                      )}
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-900/40"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
