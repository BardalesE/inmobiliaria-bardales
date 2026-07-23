'use client'
import { FEATURES_LIST } from '@/lib/propertySchema'

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 bg-bark-700 border rounded-xl text-sm text-sand placeholder-sand-muted/35 focus:outline-none transition-all ${
    err ? 'border-red-500/50 focus:border-red-400' : 'border-white/8 focus:border-terra/60 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.10)]'
  }`

const F = ({ label, error, children, required }) => (
  <div>
    <label className="text-[10px] uppercase tracking-widest font-bold text-sand-muted/70 block mb-1.5">
      {label}{required && <span className="text-terra-light ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><span>✕</span>{error}</p>}
  </div>
)

const Counter = ({ label, value, onChange }) => (
  <div className="bg-bark-700 border border-white/8 rounded-xl p-3 flex flex-col gap-2">
    <span className="text-[10px] uppercase tracking-widest font-bold text-sand-muted/70">{label}</span>
    <div className="flex items-center justify-between gap-2">
      <button type="button"
        onClick={() => onChange(Math.max(0, (value || 0) - 1))}
        className="w-8 h-8 rounded-lg bg-bark-600 border border-white/8 text-sand text-lg font-bold flex items-center justify-center hover:bg-terra/20 hover:border-terra/30 transition-all">
        −
      </button>
      <span className="text-xl font-bold text-sand w-8 text-center">{value ?? '—'}</span>
      <button type="button"
        onClick={() => onChange((value || 0) + 1)}
        className="w-8 h-8 rounded-lg bg-bark-600 border border-white/8 text-sand text-lg font-bold flex items-center justify-center hover:bg-terra/20 hover:border-terra/30 transition-all">
        +
      </button>
    </div>
  </div>
)

export default function StepDetails({ register, watch, setValue, errors }) {
  const rooms     = watch('rooms')
  const bathrooms = watch('bathrooms')
  const floors    = watch('floors')
  const parking   = watch('parking')
  const features  = watch('features') || []

  const toggle = (f) => {
    const next = features.includes(f) ? features.filter(x => x !== f) : [...features, f]
    setValue('features', next, { shouldDirty: true })
  }

  return (
    <div className="space-y-6">

      {/* Precio y área */}
      <div className="grid grid-cols-2 gap-4">
        <F label="Precio (S/)" error={errors.price?.message} required>
          <input type="number" min="0" step="any"
            {...register('price', { valueAsNumber: true })}
            placeholder="45000" className={inputCls(errors.price)} />
        </F>
        <F label="Área (m²)" error={errors.area?.message} required>
          <input type="number" min="0" step="any"
            {...register('area', { valueAsNumber: true })}
            placeholder="200" className={inputCls(errors.area)} />
        </F>
        <F label="Frente (m)" error={errors.frontage?.message}>
          <input type="number" min="0" step="any"
            {...register('frontage', { setValueAs: v => v === '' ? null : parseFloat(v) })}
            placeholder="10" className={inputCls(errors.frontage)} />
        </F>
        <F label="Fondo (m)" error={errors.depth?.message}>
          <input type="number" min="0" step="any"
            {...register('depth', { setValueAs: v => v === '' ? null : parseFloat(v) })}
            placeholder="20" className={inputCls(errors.depth)} />
        </F>
      </div>

      {/* Contadores */}
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-sand-muted/70 mb-3">Características numéricas</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Counter label="Habitaciones" value={rooms}     onChange={v => setValue('rooms',     v, { shouldDirty: true })} />
          <Counter label="Baños"        value={bathrooms} onChange={v => setValue('bathrooms', v, { shouldDirty: true })} />
          <Counter label="Pisos"        value={floors}    onChange={v => setValue('floors',    v, { shouldDirty: true })} />
          <div className="bg-bark-700 border border-white/8 rounded-xl p-3 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-sand-muted/70">Cochera</span>
            <div className="flex-1 flex items-center justify-center">
              <button type="button"
                onClick={() => setValue('parking', !parking, { shouldDirty: true })}
                className={`relative w-12 h-6 rounded-full transition-all ${parking ? 'bg-terra' : 'bg-bark-600 border border-white/12'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${parking ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Año de construcción */}
      <F label="Año de construcción" error={errors.yearBuilt?.message}>
        <input type="number" min="1900" max={new Date().getFullYear()}
          {...register('yearBuilt', { setValueAs: v => v === '' ? null : parseInt(v) })}
          placeholder={String(new Date().getFullYear())}
          className={inputCls(errors.yearBuilt)} />
      </F>

      {/* Características */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-widest font-bold text-sand-muted/70">Características</p>
          {features.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓ {features.length} seleccionadas
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {FEATURES_LIST.map(f => (
            <button key={f} type="button" onClick={() => toggle(f)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                features.includes(f)
                  ? 'bg-terra/15 border-terra text-terra-light'
                  : 'bg-bark-700 border-white/8 text-sand-muted hover:border-terra/25 hover:text-sand'
              }`}>
              {features.includes(f) ? '✓ ' : '+ '}{f}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
