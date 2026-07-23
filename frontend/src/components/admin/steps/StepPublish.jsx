'use client'
import { TIPOS, ESTADOS } from '@/lib/propertySchema'

export default function StepPublish({ watch, setValue, errors, register, isEdit }) {
  const featured   = watch('featured')
  const status     = watch('status')
  const title      = watch('title')
  const type       = watch('type')
  const operation  = watch('operation')
  const price      = watch('price')
  const area       = watch('area')
  const district   = watch('district')
  const address    = watch('address')
  const images     = watch('images') || []
  const videos     = watch('videos') || []
  const documents  = watch('documents') || []
  const videoUrl   = watch('videoUrl')
  const coverImg   = images.find(i => i.url?.trim())
  const hasVideo   = videos.length > 0 || !!videoUrl

  const tipoLabel   = TIPOS.find(t => t.value === type)?.label ?? type
  const estadoLabel = ESTADOS.find(e => e.value === status)?.label ?? status
  const opLabel     = operation === 'RENT' ? 'Alquiler' : 'Venta'

  const statusColor = {
    AVAILABLE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    RESERVED:  'text-amber-400  bg-amber-500/10  border-amber-500/30',
    SOLD:      'text-red-400    bg-red-500/10    border-red-500/30',
    HIDDEN:    'text-zinc-400   bg-zinc-500/10   border-zinc-500/30',
    DRAFT:     'text-blue-400   bg-blue-500/10   border-blue-500/30',
  }[status] || 'text-sand-muted'

  const checks = [
    { ok: !!title && title.length >= 3, label: 'Título (mín. 3 car.)' },
    { ok: !!address && address.length >= 3, label: 'Dirección completa' },
    { ok: !!district,                    label: 'Distrito definido' },
    { ok: !!price && price > 0,          label: 'Precio definido' },
    { ok: !!area && area > 0,            label: 'Área definida' },
    { ok: images.some(i => i.url?.trim()), label: 'Al menos 1 foto' },
  ]
  const allOk = checks.every(c => c.ok)

  return (
    <div className="space-y-6">

      {/* ── Destacado ─────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-bark-700/70 border border-white/8 rounded-2xl hover:border-white/12 transition-colors">
        <div>
          <p className="text-sm font-semibold text-sand leading-tight">Propiedad destacada</p>
          <p className="text-[11px] text-sand-muted/55 mt-0.5">Aparece en la sección premium del inicio</p>
        </div>
        <button type="button"
          onClick={() => setValue('featured', !featured, { shouldDirty: true })}
          className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${featured ? 'bg-terra shadow-[0_0_10px_rgba(201,162,39,0.35)]' : 'bg-bark-600 border border-white/12'}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${featured ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* ── Notas internas ────────────────────────────── */}
      <div>
        <label className="text-[11px] uppercase tracking-[0.12em] font-bold text-sand-muted/70 block mb-2">
          Notas internas <span className="normal-case font-normal text-sand-muted/40">(solo admin)</span>
        </label>
        <textarea {...register('notes')} rows={3}
          placeholder="Estado de negociación, recordatorios, contactos clave..."
          className="w-full px-3.5 py-3 bg-bark-700 border border-white/8 rounded-xl text-sm text-sand placeholder-sand-muted/30 focus:outline-none focus:border-terra/60 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.09)] resize-none transition-all leading-relaxed" />
      </div>

      {/* ── Vista previa tarjeta ───────────────────────── */}
      <div className="border border-white/8 rounded-2xl overflow-hidden bg-bark-700/30">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-sand-muted/50">
            Vista previa de tarjeta
          </p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/8 text-sand-muted/50">
            {opLabel}
          </span>
        </div>
        <div className="p-4 flex gap-4">
          {/* Thumbnail */}
          <div className="w-28 h-[76px] rounded-xl overflow-hidden flex-shrink-0 bg-bark-700 border border-white/8">
            {coverImg ? (
              <img src={coverImg.url} alt="" className="w-full h-full object-cover" draggable={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sand-muted/20 text-3xl">⌂</div>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                {estadoLabel}
              </span>
              <span className="text-[10px] text-sand-muted/45 font-medium">{tipoLabel}</span>
            </div>
            <p className="text-sm font-bold text-sand truncate leading-tight">{title || 'Sin título aún'}</p>
            <div className="flex items-center gap-2.5 text-[11px] text-sand-muted/65 flex-wrap">
              {price > 0   && <span className="font-semibold text-terra-light">S/ {Number(price).toLocaleString()}</span>}
              {area > 0    && <span>· {area} m²</span>}
              {district    && <span>· {district}</span>}
            </div>
          </div>
        </div>
        {(hasVideo || documents.length > 0) && (
          <div className="px-4 pb-3 flex items-center gap-3">
            {hasVideo && (
              <span className="text-[10px] font-semibold text-sand-muted/40 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                {videos.length > 1 ? `${videos.length} videos` : 'Video incluido'}
              </span>
            )}
            {documents.length > 0 && (
              <span className="text-[10px] font-semibold text-sand-muted/40 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {documents.length > 1 ? `${documents.length} documentos` : 'Documento incluido'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Verificación ──────────────────────────────── */}
      <div className="rounded-2xl border border-white/7 bg-bark-700/25 p-4 space-y-2.5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-sand-muted/65">
            Verificación pre-publicación
          </p>
          {allOk && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              ✓ Listo
            </span>
          )}
        </div>
        {checks.map(({ ok, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-xs">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
              ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/12 text-red-400'
            }`}>
              {ok ? '✓' : '✕'}
            </span>
            <span className={ok ? 'text-sand-muted/75' : 'text-red-400/80 font-medium'}>{label}</span>
          </div>
        ))}
        {!allOk && (
          <p className="text-[10px] text-sand-muted/40 pt-1 border-t border-white/5">
            Completa los campos marcados antes de publicar. Puedes publicar igualmente como borrador.
          </p>
        )}
      </div>

    </div>
  )
}
