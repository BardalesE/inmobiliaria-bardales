'use client'
import { useState } from 'react'
import { createLead } from '@/lib/api'

export default function LeadForm({ propertyId, propertyTitle }) {
  const [form, setForm]     = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')

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
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.22)',
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(16,185,129,0.12)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </div>
        <h3 className="font-display text-xl tracking-wide text-sand mb-1.5">¡Mensaje enviado!</h3>
        <p className="text-sm" style={{ color: 'rgba(154,130,104,0.8)' }}>Nos comunicaremos contigo a la brevedad.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-5 text-xs font-semibold transition-colors"
          style={{ color: '#D8C48D' }}
        >
          Enviar otro mensaje →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {propertyTitle && (
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
          style={{ background: 'rgba(201,179,126,0.07)', border: '1px solid rgba(201,179,126,0.18)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D8C48D" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
          </svg>
          <span style={{ color: 'rgba(154,130,104,0.8)' }}>Consultando: </span>
          <span className="font-semibold text-sand">{propertyTitle}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5" style={{ color: 'rgba(154,130,104,0.7)' }}>
            Nombre *
          </label>
          <input
            required
            type="text"
            placeholder="Tu nombre completo"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="input-premium"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5" style={{ color: 'rgba(154,130,104,0.7)' }}>
            Teléfono *
          </label>
          <input
            required
            type="tel"
            placeholder="Ej: 951 234 567"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="input-premium"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5" style={{ color: 'rgba(154,130,104,0.7)' }}>
          Email <span className="normal-case tracking-normal font-normal opacity-60">(opcional)</span>
        </label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          className="input-premium"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5" style={{ color: 'rgba(154,130,104,0.7)' }}>
          Mensaje <span className="normal-case tracking-normal font-normal opacity-60">(opcional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="¿Tienes alguna pregunta sobre esta propiedad?"
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          className="input-premium resize-none"
        />
      </div>

      {error && (
        <p
          className="text-xs px-3 py-2.5 rounded-xl"
          style={{ color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)' }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="cta-terra w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        style={{ background: 'linear-gradient(135deg, #1F6D45, #2F8557)' }}
      >
        {status === 'loading' ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25"/>
              <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
            </svg>
            Enviando…
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Solicitar información
          </>
        )}
      </button>
    </form>
  )
}
