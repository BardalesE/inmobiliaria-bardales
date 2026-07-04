'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { WHATSAPP } from '@/lib/site'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const PROPERTY_TYPES = [
  { value: 'Casa', label: '🏠 Casa' },
  { value: 'Terreno urbano', label: '📐 Terreno urbano' },
  { value: 'Terreno rural', label: '🌾 Terreno rural' },
  { value: 'Departamento', label: '🏢 Departamento' },
  { value: 'Local comercial', label: '🏪 Local comercial' },
]

const STEPS = ['Tus datos', 'Tu propiedad', 'Listo']

export default function PublicarPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    propertyType: '',
    description: '',
  })

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const canNext0 = form.name.trim() && form.phone.trim()
  const canNext1 = form.city.trim() && form.propertyType

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/sellers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setDone(true)
      setStep(2)
    } catch (err) {
      setError('Hubo un problema. Intenta de nuevo o escríbenos por WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />

      <section className="max-w-lg mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-terra/30 bg-terra/10 text-terra-light text-[10px] font-bold tracking-[0.2em] uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-terra-light animate-pulse" />
            Publica gratis hoy
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-3"
            style={{ background: 'linear-gradient(135deg,#FDF6E9 40%,#E07840 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PUBLICA TU<br />PROPIEDAD
          </h1>
          <p className="text-sand-muted text-sm leading-relaxed">
            Miles de compradores buscan en EE-Stars.<br />
            Llena el formulario y nosotros te contactamos para publicarla.
          </p>
        </div>

        {/* Stepper */}
        {!done && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.slice(0, 2).map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-bold transition-all ${step === i ? 'text-terra-light' : step > i ? 'text-emerald-400' : 'text-sand-muted'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
                    step > i ? 'bg-emerald-500 border-emerald-500 text-white' :
                    step === i ? 'bg-terra border-terra text-white' :
                    'border-white/20 text-sand-muted'
                  }`}>
                    {step > i ? '✓' : i + 1}
                  </div>
                  {label}
                </div>
                {i < 1 && <div className={`w-8 h-px ${step > i ? 'bg-emerald-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Card principal */}
        <div className="bg-bark-800 border border-terra/20 rounded-2xl p-6 shadow-xl">

          {/* PASO 0 — Datos del vendedor */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-sand-muted mb-1">Nombre completo *</p>
                <input
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Ej: Juan Rodríguez Pérez"
                  className="w-full px-4 py-3 bg-bark-700 border border-white/10 rounded-xl text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60 text-sm"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-sand-muted mb-1">Teléfono / WhatsApp *</p>
                <input
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="Ej: 987654321"
                  type="tel"
                  className="w-full px-4 py-3 bg-bark-700 border border-white/10 rounded-xl text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60 text-sm"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-sand-muted mb-1">Correo electrónico <span className="text-sand-muted/50">(opcional)</span></p>
                <input
                  value={form.email}
                  onChange={set('email')}
                  placeholder="tucorreo@gmail.com"
                  type="email"
                  className="w-full px-4 py-3 bg-bark-700 border border-white/10 rounded-xl text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60 text-sm"
                />
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!canNext0}
                className="w-full py-3 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold tracking-wide shadow-lg shadow-terra/30 hover:shadow-terra/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          )}

          {/* PASO 1 — Datos de la propiedad */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-sand-muted mb-1">Ciudad / Distrito *</p>
                <input
                  value={form.city}
                  onChange={set('city')}
                  placeholder="Ej: Chepén, Trujillo, Pacasmayo..."
                  className="w-full px-4 py-3 bg-bark-700 border border-white/10 rounded-xl text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60 text-sm"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-sand-muted mb-2">Tipo de propiedad *</p>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm({ ...form, propertyType: t.value })}
                      className={`px-3 py-2.5 rounded-xl border text-sm font-semibold text-left transition-all ${
                        form.propertyType === t.value
                          ? 'bg-terra/20 border-terra text-terra-light'
                          : 'bg-bark-700 border-white/10 text-sand-muted hover:border-terra/40'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-sand-muted mb-1">Cuéntanos sobre tu propiedad <span className="text-sand-muted/50">(opcional)</span></p>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Ej: Terreno de 200m², en esquina, con título en regla, precio negociable..."
                  rows={3}
                  className="w-full px-4 py-3 bg-bark-700 border border-white/10 rounded-xl text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60 text-sm resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-sand-muted text-sm font-bold hover:border-white/20 transition-colors"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canNext1 || loading}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold tracking-wide shadow-lg shadow-terra/30 hover:shadow-terra/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar solicitud 🚀'}
                </button>
              </div>
            </div>
          )}

          {/* PASO 2 — Confirmación */}
          {step === 2 && done && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto mb-5">
                ✓
              </div>
              <h2 className="font-display text-3xl tracking-wide text-sand mb-2">¡Recibido!</h2>
              <p className="text-sand-muted text-sm leading-relaxed mb-6">
                Hola <strong className="text-sand">{form.name}</strong>, recibimos tu solicitud.<br />
                Te contactaremos al <strong className="text-terra-light">{form.phone}</strong> en menos de 24 horas para publicar tu propiedad.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP}?text=Hola,%20acabo%20de%20registrar%20mi%20propiedad%20en%20EE-Stars.%20Soy%20${encodeURIComponent(form.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-gradient-to-br from-[#25D366] to-[#1aad52] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-900/30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Confirmar por WhatsApp
                </a>
                <Link
                  href="/"
                  className="w-full py-3 rounded-xl border border-white/10 text-sand-muted text-sm font-bold text-center hover:border-white/20 transition-colors"
                >
                  Ver propiedades disponibles
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Trust signals */}
        {step < 2 && (
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '🔒', text: 'Datos seguros' },
              { icon: '⚡', text: 'Respuesta en 24h' },
              { icon: '💰', text: 'Publicación gratis' },
            ].map((item, i) => (
              <div key={i} className="bg-bark-800 border border-white/5 rounded-xl py-3 px-2">
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="text-[10px] text-sand-muted">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
