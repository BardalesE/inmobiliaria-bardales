'use client'
import { useState } from 'react'
import { createLead } from '@/lib/api'

export default function LeadForm({ propertyId, propertyTitle }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await createLead({ ...form, propertyId, source: 'website' })
      setStatus('success')
      setForm({ name: '', phone: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.message || 'Error al enviar. Intenta de nuevo.')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-display text-xl tracking-wide text-sand mb-2">¡Mensaje enviado!</h3>
        <p className="text-sm text-sand-muted">Nos comunicaremos contigo a la brevedad.</p>
        <button onClick={() => setStatus('idle')} className="mt-4 text-terra-light text-sm underline">
          Enviar otro mensaje
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {propertyTitle && (
        <p className="text-xs text-sand-muted bg-bark-700 px-3 py-2 rounded-lg border border-white/5">
          Consultando: <span className="text-sand font-semibold">{propertyTitle}</span>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Nombre *</label>
          <input
            required
            type="text"
            placeholder="Tu nombre completo"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/50 focus:outline-none focus:border-terra/60 transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Teléfono *</label>
          <input
            required
            type="tel"
            placeholder="Ej: 951234567"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/50 focus:outline-none focus:border-terra/60 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Email (opcional)</label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/50 focus:outline-none focus:border-terra/60 transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Mensaje</label>
        <textarea
          rows={3}
          placeholder="¿Tienes alguna pregunta sobre esta propiedad?"
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/50 focus:outline-none focus:border-terra/60 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold text-sm tracking-wide shadow-lg shadow-terra/30 hover:shadow-terra/50 transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Enviando...' : '📩 Solicitar información'}
      </button>
    </form>
  )
}
