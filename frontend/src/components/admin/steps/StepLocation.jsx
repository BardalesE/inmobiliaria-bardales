'use client'
import dynamic from 'next/dynamic'

const LocationPickerMap = dynamic(
  () => import('@/components/admin/LocationPickerMap'),
  { ssr: false, loading: () => (
    <div className="h-[320px] rounded-xl bg-bark-700 border border-white/8 flex items-center justify-center">
      <span className="text-sand-muted/50 text-xs">Cargando mapa...</span>
    </div>
  )}
)

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 bg-bark-700 border rounded-xl text-sm text-sand placeholder-sand-muted/35 focus:outline-none transition-all ${
    err ? 'border-red-500/50 focus:border-red-400' : 'border-white/8 focus:border-terra/60 focus:shadow-[0_0_0_3px_rgba(201,179,126,0.10)]'
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

export default function StepLocation({ register, watch, setValue, errors }) {
  const lat = watch('latitude')
  const lng = watch('longitude')

  const handleMapChange = (lat, lng) => {
    setValue('latitude',  lat, { shouldDirty: true })
    setValue('longitude', lng, { shouldDirty: true })
  }

  return (
    <div className="space-y-5">

      <F label="Dirección" error={errors.address?.message} required>
        <input {...register('address')} placeholder="Jr. Independencia 345"
          className={inputCls(errors.address)} />
      </F>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <F label="Distrito" error={errors.district?.message} required>
          <input {...register('district')} placeholder="Chepén"
            className={inputCls(errors.district)} />
        </F>
        <F label="Provincia" error={errors.province?.message} required>
          <input {...register('province')} placeholder="Chepén"
            className={inputCls(errors.province)} />
        </F>
        <F label="Departamento" error={errors.department?.message} required>
          <input {...register('department')} placeholder="La Libertad"
            className={inputCls(errors.department)} />
        </F>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <F label="Sector / Urb." error={errors.sector?.message}>
          <input {...register('sector')} placeholder="Urb. El Milagro"
            className={inputCls(errors.sector)} />
        </F>
        <F label="Manzana" error={errors.block?.message}>
          <input {...register('block')} placeholder="82"
            className={inputCls(errors.block)} />
        </F>
        <F label="Lote" error={errors.lot?.message}>
          <input {...register('lot')} placeholder="3B"
            className={inputCls(errors.lot)} />
        </F>
      </div>

      {/* Coordenadas manuales */}
      <div className="grid grid-cols-2 gap-4">
        <F label="Latitud" error={errors.latitude?.message}>
          <input type="number" step="any"
            {...register('latitude', { setValueAs: v => (v === '' || isNaN(parseFloat(v))) ? null : parseFloat(v) })}
            placeholder="-7.2281" className={inputCls(errors.latitude)} />
        </F>
        <F label="Longitud" error={errors.longitude?.message}>
          <input type="number" step="any"
            {...register('longitude', { setValueAs: v => (v === '' || isNaN(parseFloat(v))) ? null : parseFloat(v) })}
            placeholder="-79.4328" className={inputCls(errors.longitude)} />
        </F>
      </div>

      {/* Mapa interactivo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-sand-muted/70">
            Ubicación en mapa
          </label>
          {lat && lng && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓ {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
            </span>
          )}
        </div>
        <LocationPickerMap lat={lat} lng={lng} onChange={handleMapChange} />
      </div>
    </div>
  )
}
