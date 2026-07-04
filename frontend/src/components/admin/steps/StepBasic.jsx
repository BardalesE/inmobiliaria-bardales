'use client'
import { TIPOS, ESTADOS } from '@/lib/propertySchema'

const F = ({ label, error, children, required }) => (
  <div>
    <label className="text-[10px] uppercase tracking-widest font-bold text-sand-muted/70 block mb-1.5">
      {label}{required && <span className="text-terra-light ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><span>✕</span>{error}</p>}
  </div>
)

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 bg-bark-700 border rounded-xl text-sm text-sand placeholder-sand-muted/35 focus:outline-none transition-all ${
    err ? 'border-red-500/50 focus:border-red-400' : 'border-white/8 focus:border-terra/60 focus:shadow-[0_0_0_3px_rgba(196,98,45,0.10)]'
  }`

export default function StepBasic({ register, watch, setValue, errors }) {
  const type      = watch('type')
  const operation = watch('operation')

  const generateRef = () => {
    const ref = `EE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
    setValue('ref', ref, { shouldValidate: true })
  }

  return (
    <div className="space-y-6">

      {/* Operación */}
      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold text-sand-muted/70 block mb-2">
          Operación
        </label>
        <div className="flex gap-2">
          {[
            { v: 'SALE', l: 'Venta' },
            { v: 'RENT', l: 'Alquiler' },
          ].map(({ v, l }) => (
            <button key={v} type="button"
              onClick={() => setValue('operation', v, { shouldDirty: true })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                operation === v
                  ? 'bg-terra/20 border-terra text-terra-light shadow-[0_0_12px_rgba(196,98,45,0.20)]'
                  : 'bg-bark-700 border-white/8 text-sand-muted hover:border-terra/30'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo de propiedad */}
      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold text-sand-muted/70 block mb-2">
          Tipo de propiedad <span className="text-terra-light">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {TIPOS.map(({ value, label, icon }) => (
            <button key={value} type="button"
              onClick={() => setValue('type', value, { shouldDirty: true })}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
                type === value
                  ? 'bg-terra/15 border-terra text-terra-light shadow-[0_0_14px_rgba(196,98,45,0.18)]'
                  : 'bg-bark-700 border-white/8 text-sand-muted hover:border-terra/25'
              }`}>
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] font-semibold leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ref + Título */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <F label="Referencia" error={errors.ref?.message} required>
          <div className="flex gap-2">
            <input {...register('ref')} placeholder="EE-2025-001"
              className={inputCls(errors.ref) + ' flex-1'} />
            <button type="button" onClick={generateRef}
              className="px-3.5 rounded-xl bg-terra/15 border border-terra/25 text-terra-light text-xs font-bold hover:bg-terra/25 transition-colors whitespace-nowrap">
              Auto
            </button>
          </div>
        </F>
        <F label="Título" error={errors.title?.message} required>
          <input {...register('title')} placeholder="Casa en Chepén — Centro"
            className={inputCls(errors.title)} />
        </F>
      </div>

      {/* Descripción */}
      <F label="Descripción" error={errors.description?.message}>
        <textarea {...register('description')} rows={3}
          placeholder="Describe la propiedad: características, entorno, ventajas..."
          className={inputCls(errors.description) + ' resize-none'} />
      </F>

      {/* Estado */}
      <F label="Estado de la propiedad" error={errors.status?.message}>
        <select {...register('status')}
          className={inputCls(errors.status)}>
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </F>
    </div>
  )
}
