'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { propertySchema, STEP_FIELDS, FIELD_TO_STEP } from '@/lib/propertySchema'
import StepBasic    from './steps/StepBasic'
import StepLocation from './steps/StepLocation'
import StepDetails  from './steps/StepDetails'
import StepMedia    from './steps/StepMedia'
import StepPublish  from './steps/StepPublish'

const STEPS = [
  { id: 'basic',    label: 'Básico',     short: '1' },
  { id: 'location', label: 'Ubicación',  short: '2' },
  { id: 'details',  label: 'Detalles',   short: '3' },
  { id: 'media',    label: 'Multimedia', short: '4' },
  { id: 'publish',  label: 'Publicar',   short: '5' },
]

const DRAFT_KEY = (id) => `ee_wizard_draft_${id ?? 'new'}`

/* ── Toast ─────────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [onClose])
  const colors = {
    success: 'bg-emerald-500/12 border-emerald-500/30 text-emerald-300',
    error:   'bg-red-500/12     border-red-500/30     text-red-300',
    info:    'bg-terra/12       border-terra/30       text-terra-light',
  }[type] || 'bg-bark-700 border-white/10 text-sand'
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold shadow-2xl max-w-sm animate-fade-up ${colors}`}>
      <span className="flex-shrink-0">{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 text-xs">✕</button>
    </div>
  )
}

/* ── Main wizard ─────────────────────────────────────────────────────────── */
export default function PropertyFormWizard({ initialData, propertyId, mode = 'create' }) {
  const router      = useRouter()
  const [step, setStep]         = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [toast, setToast]       = useState(null)
  const [draftSaved, setDraftSaved] = useState(false)
  const saveTimer   = useRef(null)
  const initialized = useRef(false)

  const showToast = useCallback((msg, type = 'info') => setToast({ msg, type }), [])

  const defaultValues = {
    ref: '', title: '', description: '', type: 'URBAN_LOT', operation: 'SALE',
    status: 'AVAILABLE', address: '', district: 'Chepén', province: 'Chepén',
    department: 'La Libertad', sector: '', block: '', lot: '',
    latitude: null, longitude: null,
    price: undefined, area: undefined, frontage: null, depth: null,
    rooms: null, bathrooms: null, floors: null, yearBuilt: null, parking: false,
    features: [], images: [], videoUrl: '', documentUrl: '', featured: false, notes: '',
    ...(initialData || {}),
  }

  const {
    register, handleSubmit, watch, setValue, trigger, reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues,
    mode: 'onChange',
  })

  // Restore draft on mount (only for new properties)
  useEffect(() => {
    if (mode === 'edit' || initialData) return
    try {
      const saved = localStorage.getItem(DRAFT_KEY(propertyId))
      if (saved) {
        const parsed = JSON.parse(saved)
        reset({ ...defaultValues, ...parsed })
        showToast('Borrador restaurado', 'info')
      }
    } catch {}
  }, [])

  // Autosave
  const values = watch()
  useEffect(() => {
    if (!initialized.current) { initialized.current = true; return }
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY(propertyId), JSON.stringify(values))
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 2000)
      } catch {}
    }, 2000)
    return () => clearTimeout(saveTimer.current)
  }, [JSON.stringify(values)])

  const goNext = async () => {
    const fields = STEP_FIELDS[step]
    const valid = fields.length ? await trigger(fields) : true
    if (valid) setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const goPrev = () => setStep(s => Math.max(s - 1, 0))

  // Navigate to the first step that contains a validation error
  const onInvalid = (fieldErrors) => {
    const errorFields = Object.keys(fieldErrors)
    const steps = errorFields
      .map(f => FIELD_TO_STEP[f] ?? 0)
      .filter(n => n !== undefined)
    if (steps.length) {
      setStep(Math.min(...steps))
      showToast('Hay campos incompletos. Revisa los campos marcados en rojo.', 'error')
    } else {
      showToast('Hay errores en el formulario', 'error')
    }
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const images = (data.images || []).filter(i => i.url?.trim())
      if (mode === 'create') {
        await api.post('/properties', { ...data, images })
        localStorage.removeItem(DRAFT_KEY(null))
        showToast('Propiedad publicada con éxito', 'success')
      } else {
        await api.put(`/properties/${propertyId}`, data)
        // Always sync images (even empty array clears them)
        await api.put(`/properties/${propertyId}/images`, { images }).catch(() => {})
        localStorage.removeItem(DRAFT_KEY(propertyId))
        showToast('Cambios guardados', 'success')
      }
      setTimeout(() => router.push('/admin/dashboard'), 900)
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const formProps = { register, watch, setValue, errors }

  return (
    <div className="min-h-screen bg-bark-900">

      {/* Sticky Nav */}
      <nav className="sticky top-0 z-20 bg-bark-800/95 backdrop-blur-md border-b border-terra/15 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-sm shadow-lg shadow-terra/20">EE</div>
          <div>
            <span className="font-display text-base tracking-wider text-sand">
              {mode === 'create' ? 'Nueva Propiedad' : `Editar — ${watch('ref') || '...'}`}
            </span>
            {draftSaved && (
              <span className="ml-3 text-[10px] font-semibold text-emerald-400/80 inline-flex items-center gap-1">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                Guardado
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {mode === 'edit' && (
            <button type="button" disabled={deleting}
              onClick={async () => {
                if (!confirm('¿Eliminar esta propiedad? No se puede deshacer.')) return
                setDeleting(true)
                try {
                  await api.delete(`/properties/${propertyId}`)
                  localStorage.removeItem(DRAFT_KEY(propertyId))
                  router.push('/admin/dashboard')
                } catch { showToast('Error al eliminar', 'error'); setDeleting(false) }
              }}
              className="text-red-400/70 text-xs hover:text-red-300 disabled:opacity-40 transition-colors">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          )}
          <button type="button" onClick={() => router.push('/admin/dashboard')}
            className="text-sand-muted/70 text-xs hover:text-sand transition-colors">
            ← Panel
          </button>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="sticky top-[57px] z-10 bg-bark-800/95 backdrop-blur-md border-b border-white/6 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button type="button"
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 transition-all ${i < step ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all ${
                  i === step
                    ? 'bg-terra text-white shadow-[0_0_16px_rgba(196,98,45,0.50)] scale-110'
                    : i < step
                    ? 'bg-emerald-500/18 text-emerald-400 border-2 border-emerald-500/45'
                    : 'bg-bark-700 text-sand-muted/40 border border-white/8'
                }`}>
                  {i < step ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                  ) : s.short}
                </div>
                <span className={`text-[11px] font-bold hidden sm:block transition-colors ${
                  i === step ? 'text-sand' : i < step ? 'text-sand-muted/55' : 'text-sand-muted/30'
                }`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3">
                  <div className="h-[2px] rounded-full transition-all duration-500"
                    style={{ background: i < step ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.07)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-bark-800 border border-white/6 rounded-2xl p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">

            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl tracking-wide text-terra-light leading-none">
                  {STEPS[step].label}
                </h2>
                <div className="w-8 h-0.5 bg-gradient-to-r from-terra to-terra-light rounded-full mt-2" />
              </div>
              <span className="text-[11px] font-semibold text-sand-muted/35 mt-1">
                {step + 1} / {STEPS.length}
              </span>
            </div>

            {step === 0 && <StepBasic    {...formProps} />}
            {step === 1 && <StepLocation {...formProps} />}
            {step === 2 && <StepDetails  {...formProps} />}
            {step === 3 && <StepMedia    {...formProps} initialImages={watch('images')} videoUrl={watch('videoUrl')} documentUrl={watch('documentUrl')} />}
            {step === 4 && <StepPublish  {...formProps} isEdit={mode === 'edit'} />}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-5 pb-14">
            {step > 0 ? (
              <button type="button" onClick={goPrev}
                className="flex-1 py-3.5 rounded-xl border border-white/10 text-sand-muted/80 text-sm font-semibold hover:border-white/22 hover:text-sand hover:bg-white/3 active:scale-[0.98] transition-all">
                ← Anterior
              </button>
            ) : (
              <button type="button" onClick={() => router.push('/admin/dashboard')}
                className="flex-1 py-3.5 rounded-xl border border-white/10 text-sand-muted/80 text-sm font-semibold hover:border-white/22 hover:text-sand hover:bg-white/3 active:scale-[0.98] transition-all">
                Cancelar
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={goNext}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold text-sm shadow-lg shadow-terra/25 hover:shadow-terra/45 hover:-translate-y-0.5 active:scale-[0.98] transition-all">
                Siguiente →
              </button>
            ) : (
              <button type="submit" disabled={submitting}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold text-sm shadow-lg shadow-terra/25 hover:shadow-terra/45 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:transform-none disabled:shadow-none transition-all">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25"/>
                      <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  mode === 'create' ? 'Publicar propiedad' : 'Guardar cambios'
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
