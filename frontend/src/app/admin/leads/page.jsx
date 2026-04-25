'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function AdminLeads() {
  const router = useRouter()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin')
      return
    }
    axios.get(`${API}/leads`).then(res => {
      setLeads(res.data.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-bark-900">
      <nav className="bg-bark-800 border-b border-terra/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-sm">IB</div>
          <span className="font-display text-lg tracking-wide">Leads / Consultas</span>
        </div>
        <Link href="/admin/dashboard" className="text-sand-muted text-sm hover:text-sand">← Volver</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl tracking-wide">Consultas de Clientes</h1>
          <span className="text-xs text-sand-muted bg-bark-800 border border-white/5 px-3 py-1.5 rounded-full">
            {leads.length} consultas
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-sand-muted">Cargando...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-sand font-semibold">No hay consultas aún</p>
            <p className="text-sand-muted text-sm mt-1">Las consultas del formulario aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map(lead => (
              <div key={lead.id} className="bg-bark-800 border border-white/5 rounded-2xl p-5 hover:border-terra/20 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-sand">{lead.name}</h3>
                      <span className="text-[10px] uppercase tracking-wide text-terra-light bg-terra/10 border border-terra/20 px-2 py-0.5 rounded-full">
                        {lead.source}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-sand-muted mb-3">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-terra-light transition-colors">
                        📞 {lead.phone}
                      </a>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-terra-light transition-colors">
                          ✉️ {lead.email}
                        </a>
                      )}
                    </div>
                    {lead.message && (
                      <p className="text-sm text-sand-muted bg-bark-700 rounded-lg px-3 py-2 border border-white/5">
                        💬 {lead.message}
                      </p>
                    )}
                    {lead.property && (
                      <p className="text-xs text-terra-light mt-2">
                        🏠 Interesado en: <span className="font-semibold">{lead.property.title}</span> ({lead.property.ref})
                      </p>
                    )}
                  </div>
                  <div className="text-right flex flex-col gap-2">
                    <p className="text-[10px] text-sand-muted">
                      {new Date(lead.createdAt).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    
                      href={`https://wa.me/${lead.phone.replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(lead.name)}%2C%20soy%20de%20Inmobiliaria%20Bardales.%20Vi%20tu%20consulta%20y%20quiero%20darte%20m%C3%A1s%20informaci%C3%B3n.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-900/50 transition-colors"
                    >
                      💬 Responder WA
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}