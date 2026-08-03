'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAdminAuth } from '@/lib/useAdminAuth'

const EMPTY = { title: '', videoUrl: '', thumbnail: '', active: true, autoplay: true, loop: true, muted: true, order: 0 }

// ── Inline toast ──────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null
  const isOk = toast.type === 'success'
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-5 py-4 rounded-2xl border shadow-2xl max-w-sm
      ${isOk ? 'bg-emerald-950/95 border-emerald-500/25 text-emerald-300' : 'bg-red-950/95 border-red-500/25 text-red-300'}`}>
      <span className="text-lg mt-0.5 flex-shrink-0">{isOk ? '✓' : '⚠'}</span>
      <p className="text-sm leading-snug flex-1">{toast.msg}</p>
      <button onClick={onClose} className="text-xs opacity-40 hover:opacity-80 mt-0.5 flex-shrink-0">✕</button>
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className={`flex flex-col gap-1.5 rounded-xl border px-3 py-3 cursor-pointer transition-all select-none
      ${checked ? 'border-terra/40 bg-terra/8' : 'border-white/10 bg-bark-700 hover:border-white/20'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-sand">{label}</span>
        <div className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${checked ? 'bg-terra' : 'bg-white/15'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${checked ? 'left-4' : 'left-0.5'}`} />
        </div>
      </div>
      {hint && <span className="text-[10px] text-sand-muted">{hint}</span>}
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    </label>
  )
}

export default function AdminHeroVideos() {
  const { loading: authLoading } = useAdminAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)
  const timerRef = useRef(null)

  // ── Toast helper ──────────────────────────────────────────────────────────
  const notify = useCallback((type, msg) => {
    clearTimeout(timerRef.current)
    setToast({ type, msg })
    timerRef.current = setTimeout(() => setToast(null), 4500)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  // ── Load videos ───────────────────────────────────────────────────────────
  useEffect(() => { if (!authLoading) load() }, [authLoading])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/hero-videos', { params: { all: 'true' } })
      setVideos(res.data.data || [])
    } catch { notify('error', 'Error al cargar videos') }
    finally { setLoading(false) }
  }

  // ── Form helpers ──────────────────────────────────────────────────────────
  const openNew  = () => { setForm(EMPTY); setEditing(null); setShowForm(true) }
  const openEdit = (v) => {
    setForm({ title: v.title, videoUrl: v.videoUrl, thumbnail: v.thumbnail || '',
      active: v.active, autoplay: v.autoplay, loop: v.loop, muted: v.muted, order: v.order })
    setEditing(v.id); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); setUploadPct(0) }
  const setField  = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(p => ({ ...p, [f]: val }))
  }

  // ── File upload ───────────────────────────────────────────────────────────
  const processFile = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      return notify('error', 'Solo se permiten archivos de video o imagen (MP4, WebM, MOV…)')
    }
    if (file.size > 100 * 1024 * 1024) {
      return notify('error', `Archivo demasiado grande (${(file.size/1024/1024).toFixed(0)} MB). Máximo 100 MB (límite del plan gratuito de Cloudinary).`)
    }

    setUploading(true); setUploadPct(1)
    try {
      const fd = new FormData()
      fd.append('file', file)
      // Note: Content-Type header is intentionally NOT set here.
      // The api.js interceptor removes it for FormData so the browser
      // can set multipart/form-data with the correct boundary automatically.
      const res = await api.post('/hero-videos/upload', fd, {
        timeout: 180000,
        onUploadProgress: (e) => {
          if (e.total) setUploadPct(Math.round((e.loaded * 100) / e.total))
        },
      })
      const { videoUrl, thumbnail } = res.data.data
      setForm(p => ({ ...p, videoUrl, thumbnail: thumbnail || p.thumbnail }))
      notify('success', '✓ Video subido a Cloudinary')
    } catch (err) {
      const msg = err.response?.data?.message
      notify('error', msg || 'Error al subir. ¿Están configuradas las variables CLOUDINARY_* en el .env?')
    } finally {
      setUploading(false); setUploadPct(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [notify])

  const onFileChange  = (e) => processFile(e.target.files?.[0])
  const onDragOver    = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave   = () => setDragging(false)
  const onDrop        = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files?.[0]) }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim())    return notify('error', 'El título es obligatorio')
    if (!form.videoUrl.trim()) return notify('error', 'La URL del video es obligatoria')
    setSaving(true)
    try {
      if (editing) {
        const res = await api.put(`/hero-videos/${editing}`, form)
        setVideos(v => v.map(x => x.id === editing ? res.data.data : x))
        notify('success', 'Video actualizado')
      } else {
        const res = await api.post('/hero-videos', form)
        setVideos(v => [...v, res.data.data])
        notify('success', 'Video publicado en el hero')
      }
      closeForm()
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const toggleActive = async (v) => {
    try {
      const res = await api.put(`/hero-videos/${v.id}`, { active: !v.active })
      setVideos(vs => vs.map(x => x.id === v.id ? res.data.data : x))
      notify('success', v.active ? 'Video desactivado' : 'Video activado en el hero')
    } catch { notify('error', 'Error al cambiar estado') }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este video del hero? Esta acción no se puede deshacer.')) return
    try {
      await api.delete(`/hero-videos/${id}`)
      setVideos(v => v.filter(x => x.id !== id))
      notify('success', 'Video eliminado')
    } catch { notify('error', 'Error al eliminar') }
  }

  const moveOrder = async (v, dir) => {
    try {
      const res = await api.put(`/hero-videos/${v.id}`, { order: v.order + dir })
      setVideos(vs => vs.map(x => x.id === v.id ? res.data.data : x).sort((a, b) => a.order - b.order))
    } catch { notify('error', 'Error al reordenar') }
  }

  const sorted = [...videos].sort((a, b) => a.order - b.order)
  const activeCount = videos.filter(v => v.active).length

  if (authLoading) return (
    <div className="min-h-screen bg-bark-900 flex items-center justify-center">
      <p className="text-sand-muted text-sm">Verificando sesión...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-bark-900">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Nav ── */}
      <nav className="bg-bark-800 border-b border-terra/20 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-sm">EE</div>
          <span className="font-display text-lg tracking-wide">Videos del Hero</span>
          {!loading && (
            <span className="text-[10px] text-sand-muted hidden sm:block">
              · {activeCount} activo{activeCount !== 1 ? 's' : ''} / {videos.length} total
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openNew}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-terra/20 border border-terra/30 text-terra-light hover:bg-terra/30 transition-colors">
            + Agregar video
          </button>
          <Link href="/admin/dashboard" className="text-sand-muted text-sm hover:text-sand">← Panel</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div className="bg-bark-800 border border-terra/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-terra-light tracking-wide">
                {editing ? 'Editar video' : 'Nuevo video hero'}
              </h2>
              <button onClick={closeForm} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-sand-muted text-xs">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">

              {/* Title */}
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">Título *</label>
                <input required value={form.title} onChange={setField('title')}
                  placeholder="Vista aérea de Chepén — Hero principal"
                  className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60" />
              </div>

              {/* Drag & Drop Zone */}
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">Subir archivo desde tu laptop</label>
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => !uploading && fileRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                    dragging  ? 'border-terra bg-terra/10 scale-[1.01]' :
                    uploading ? 'border-white/10 cursor-wait' :
                    'border-white/10 hover:border-terra/40 hover:bg-terra/5'
                  }`}
                >
                  {uploading ? (
                    <div className="space-y-4">
                      <div className="text-3xl">☁️</div>
                      <p className="text-sm font-semibold text-terra-light">Subiendo a Cloudinary…</p>
                      <div className="max-w-xs mx-auto">
                        <div className="h-2 bg-bark-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-terra to-terra-light rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadPct}%` }} />
                        </div>
                        <p className="text-[11px] text-sand-muted mt-1.5">{uploadPct}% completado</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">{dragging ? '📥' : '🎬'}</div>
                      <p className="text-sm font-semibold text-sand">
                        {dragging ? 'Suelta el video aquí' : 'Arrastra un video o haz clic para seleccionar'}
                      </p>
                      <p className="text-[11px] text-sand-muted">MP4 · WebM · MOV · Máximo 100 MB</p>
                      <p className="text-[10px] text-terra-light/70">Recomendado: horizontal 16:9 (1920×1080) para que se vea completo sin franjas</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="video/*,image/*" className="sr-only" onChange={onFileChange} />
              </div>

              {/* Video URL */}
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">URL del video *</label>
                <input required value={form.videoUrl} onChange={setField('videoUrl')}
                  placeholder="https://res.cloudinary.com/…/video.mp4  (auto-rellenado al subir)"
                  className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60" />
              </div>

              {/* Thumbnail */}
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">Thumbnail / portada</label>
                <input value={form.thumbnail} onChange={setField('thumbnail')}
                  placeholder="Auto-generado desde Cloudinary — o pega una URL de imagen"
                  className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60" />
                {form.thumbnail && (
                  <img src={form.thumbnail} alt="preview"
                    className="mt-2 h-28 w-full object-cover rounded-xl border border-white/10"
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                )}
              </div>

              {/* Order */}
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">Orden de reproducción</label>
                <input type="number" min="0" value={form.order} onChange={setField('order')}
                  className="w-28 px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60" />
              </div>

              {/* Toggles */}
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-2">Configuración</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Toggle checked={!!form.active}   onChange={setField('active')}   label="Activo"     hint="Visible en el hero" />
                  <Toggle checked={!!form.autoplay} onChange={setField('autoplay')} label="Autoplay"   hint="Inicia automático" />
                  <Toggle checked={!!form.loop}     onChange={setField('loop')}     label="Loop"       hint="Repite al terminar" />
                  <Toggle checked={!!form.muted}    onChange={setField('muted')}    label="Silenciado" hint="Sin sonido (recomendado)" />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeForm}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-sand-muted text-sm hover:border-white/20 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving || uploading}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-br from-terra to-terra-light text-bark-900 font-bold text-sm shadow-lg shadow-terra/30 disabled:opacity-50 hover:shadow-terra/50 transition-all">
                  {saving ? 'Guardando…' : editing ? '💾 Guardar cambios' : '🚀 Publicar en el hero'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Video list ── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-bark-800 border border-white/5 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-24 h-14 rounded-lg bg-bark-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-bark-700 rounded w-1/3" />
                  <div className="h-2 bg-bark-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎬</div>
            <p className="font-display text-2xl tracking-wide text-sand mb-2">Sin videos aún</p>
            <p className="text-sand-muted text-sm mb-6">Agrega el primer video cinematográfico para el hero de la home</p>
            <button onClick={openNew}
              className="px-6 py-3 rounded-xl bg-terra/20 border border-terra/30 text-terra-light text-sm font-bold hover:bg-terra/30 transition-colors">
              + Subir primer video
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(v => (
              <div key={v.id}
                className="group bg-bark-800 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-terra/20 transition-all flex-wrap">

                {/* Thumbnail preview */}
                <div className="relative w-24 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-bark-700 border border-white/10 cursor-pointer"
                  onClick={() => setPreview(v)}>
                  {v.thumbnail
                    ? <img src={v.thumbnail} alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.currentTarget.style.display = 'none' }} />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                  }
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-2xl drop-shadow">▶</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-sand truncate">{v.title}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                      v.active ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400'
                               : 'bg-zinc-800 border-zinc-600/30 text-zinc-400'
                    }`}>
                      {v.active ? '● Activo' : '○ Inactivo'}
                    </span>
                  </div>
                  <p className="text-[10px] text-sand-muted truncate max-w-xs">{v.videoUrl}</p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {v.autoplay && <span className="text-[9px] bg-terra/10 border border-terra/20 text-terra-light/70 px-1.5 py-0.5 rounded">autoplay</span>}
                    {v.loop     && <span className="text-[9px] bg-terra/10 border border-terra/20 text-terra-light/70 px-1.5 py-0.5 rounded">loop</span>}
                    {v.muted    && <span className="text-[9px] bg-terra/10 border border-terra/20 text-terra-light/70 px-1.5 py-0.5 rounded">muted</span>}
                  </div>
                </div>

                {/* Order controls */}
                <div className="flex flex-col gap-0.5 items-center flex-shrink-0">
                  <button onClick={() => moveOrder(v, -1)}
                    className="w-7 h-6 rounded-md bg-bark-700 border border-white/10 text-sand-muted hover:text-sand flex items-center justify-center text-[10px] transition-colors">▲</button>
                  <span className="text-[10px] text-sand-muted font-mono text-center w-7 py-0.5">{v.order}</span>
                  <button onClick={() => moveOrder(v, 1)}
                    className="w-7 h-6 rounded-md bg-bark-700 border border-white/10 text-sand-muted hover:text-sand flex items-center justify-center text-[10px] transition-colors">▼</button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(v)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      v.active ? 'bg-emerald-900/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/40'
                               : 'bg-bark-700 border-white/10 text-sand-muted hover:border-emerald-500/30 hover:text-emerald-400'
                    }`}>
                    {v.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => openEdit(v)}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 text-sand-muted hover:text-sand hover:border-white/20 transition-colors">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(v.id)}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 hover:bg-red-900/40 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Cloudinary config hint ── */}
        <div className="mt-10 bg-bark-800/60 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-wide text-terra-light font-bold mb-2">⚙ Configuración Cloudinary</p>
          <p className="text-xs text-sand-muted mb-3 leading-relaxed">
            Para subir videos directamente desde el panel, añade estas variables al <code className="text-terra-light bg-bark-900 px-1 py-0.5 rounded">.env</code> del backend y reinicia:
          </p>
          <pre className="bg-bark-900 border border-white/5 rounded-xl px-4 py-3 text-[11px] text-sand-muted font-mono leading-relaxed select-all">
{`CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret`}
          </pre>
          <p className="text-[10px] text-sand-muted mt-3">
            Sin Cloudinary, puedes pegar URLs de videos directos (.mp4, .webm) en el campo URL.
          </p>
        </div>
      </div>

      {/* ── Preview modal ── */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}>
          <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sand">{preview.title}</p>
              <button onClick={() => setPreview(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors">
                ✕
              </button>
            </div>
            <video src={preview.videoUrl} poster={preview.thumbnail || undefined}
              controls autoPlay muted={preview.muted}
              className="w-full rounded-2xl border border-white/10 shadow-2xl bg-black" />
            <div className="flex gap-2 mt-3 justify-center flex-wrap">
              {[
                preview.active   && { l: 'Activo en hero', c: 'emerald' },
                preview.autoplay && { l: 'autoplay', c: 'terra' },
                preview.loop     && { l: 'loop', c: 'terra' },
                preview.muted    && { l: 'muted', c: 'terra' },
              ].filter(Boolean).map(({ l, c }, i) => (
                <span key={i} className={`text-[10px] px-2 py-1 rounded-lg border ${
                  c === 'emerald' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400'
                                  : 'bg-terra/10 border-terra/20 text-terra-light'
                }`}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
