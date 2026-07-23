'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import api from '@/lib/api'

const uid = () => Math.random().toString(36).slice(2, 9)

function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function IconVideo({ color = '#9A8268' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  )
}

function IconPdf({ color = '#F87171' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

/**
 * Uploader multi-archivo (video o PDF) — mismo patrón que ImageUploader
 * pero reutilizando el endpoint /upload/media (usado por MediaUploader).
 * Cada item: { id, url, name, size, status: uploading|done|error, progress, file }
 */
export default function MultiMediaUploader({
  initialItems = [],   // [{ url, name }]
  onChange,             // (items) => void  -> [{ url, name }]
  mode = 'video',       // 'video' | 'pdf'
  maxMB = 200,
  label = 'archivos',
}) {
  const [items, setItems] = useState(() =>
    initialItems
      .filter(it => it?.url?.trim())
      .map(it => ({ id: uid(), url: it.url, name: it.name || '', status: 'done', progress: 100 }))
  )
  const [dropActive, setDropActive] = useState(false)
  const fileRef = useRef(null)
  const busyRef = useRef(new Set())
  const cbRef   = useRef(onChange)
  useEffect(() => { cbRef.current = onChange }, [onChange])

  useEffect(() => {
    const done = items
      .filter(it => it.status === 'done')
      .map(it => ({ url: it.url, name: it.name }))
    cbRef.current(done)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const patch = useCallback((id, updates) =>
    setItems(p => p.map(it => it.id === id ? { ...it, ...updates } : it))
  , [])

  const upload = useCallback(async (id, file) => {
    if (busyRef.current.has(id)) return
    if (file.size > maxMB * 1024 * 1024) {
      patch(id, { status: 'error', progress: 0, error: `Máximo ${maxMB} MB` })
      return
    }
    busyRef.current.add(id)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/upload/media', fd, {
        onUploadProgress: ({ loaded, total }) =>
          total && patch(id, { progress: Math.round(loaded / total * 100) }),
      })
      const { url } = res.data
      patch(id, { url, status: 'done', progress: 100 })
    } catch (err) {
      patch(id, { status: 'error', progress: 0, error: err.response?.data?.message || 'Error al subir' })
    } finally {
      busyRef.current.delete(id)
    }
  }, [patch, maxMB])

  const addFiles = useCallback((files) => {
    const accept = mode === 'video' ? f => f.type.startsWith('video/') : f => f.type === 'application/pdf'
    const valid = Array.from(files).filter(accept)
    if (!valid.length) return
    const newItems = valid.map(file => ({
      id: uid(), file, name: file.name, size: file.size,
      url: '', status: 'uploading', progress: 0,
    }))
    setItems(p => [...p, ...newItems])
    newItems.forEach(it => upload(it.id, it.file))
  }, [upload, mode])

  const onEnter = e => { e.preventDefault(); setDropActive(true) }
  const onLeave = e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropActive(false) }
  const onOver  = e => e.preventDefault()
  const onDrop  = e => { e.preventDefault(); setDropActive(false); addFiles(e.dataTransfer.files) }

  const remove = id => setItems(p => p.filter(it => it.id !== id))
  const retryUpload = id => {
    const it = items.find(it => it.id === id)
    if (it?.file) { patch(id, { status: 'uploading', progress: 0 }); upload(id, it.file) }
  }

  const uploadingCount = items.filter(it => it.status === 'uploading').length
  const accept = mode === 'video' ? 'video/*' : 'application/pdf'

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={onEnter} onDragLeave={onLeave} onDragOver={onOver} onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className="relative cursor-pointer rounded-2xl transition-all"
        style={{
          border: `2px dashed ${dropActive ? 'rgba(201,179,126,0.60)' : 'rgba(255,255,255,0.09)'}`,
          background: dropActive ? 'rgba(201,179,126,0.05)' : 'rgba(21,15,7,0.55)',
          padding: '26px 22px',
          transition: 'border-color 0.18s ease, background 0.18s ease',
        }}
      >
        <div className="flex flex-col items-center gap-2.5 select-none">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(42,30,16,0.85)', border: `1px solid ${dropActive ? 'rgba(201,179,126,0.30)' : 'rgba(255,255,255,0.06)'}` }}>
            {mode === 'video' ? <IconVideo color={dropActive ? '#D8C48D' : '#9A8268'} /> : <IconPdf color={dropActive ? '#D8C48D' : '#F87171'} />}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: dropActive ? '#D8C48D' : '#9A8268' }}>
              {dropActive ? `Suelta ${label} aquí` : `Arrastra ${label} aquí o haz clic para seleccionar`}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(154,130,104,0.50)' }}>
              {mode === 'video' ? 'MP4, MOV, WEBM' : 'PDF'} · máx. {maxMB} MB por archivo
            </p>
          </div>
          {items.length > 0 && (
            <div className="mt-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ background: 'rgba(201,179,126,0.10)', color: '#D8C48D' }}>
              + Agregar más {label}
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept={accept} multiple className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
      </div>

      {uploadingCount > 0 && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
          style={{ background: 'rgba(201,179,126,0.06)', border: '1px solid rgba(201,179,126,0.18)' }}>
          <svg className="animate-spin flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D8C48D" strokeWidth="2.5">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.22"/>
            <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
          </svg>
          <span className="text-xs font-semibold" style={{ color: '#D8C48D' }}>
            Subiendo {uploadingCount} {uploadingCount === 1 ? 'archivo' : 'archivos'}…
          </span>
        </div>
      )}

      {/* List */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="rounded-xl border border-white/8 bg-bark-700 overflow-hidden">
              {item.status === 'done' && mode === 'video' && (
                <video src={item.url} controls preload="metadata" className="w-full" style={{ maxHeight: 220, background: '#000', display: 'block' }} />
              )}
              <div className="flex items-center gap-3 p-3">
                {item.status === 'uploading' && (
                  <svg className="animate-spin flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8C48D" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2"/>
                    <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
                  </svg>
                )}
                {item.status === 'done' && mode === 'pdf' && (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.18)' }}>
                    <IconPdf />
                  </div>
                )}
                {item.status === 'error' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sand truncate">{item.name || (mode === 'video' ? 'Video' : 'Documento')}</p>
                  {item.status === 'uploading' && (
                    <div className="h-1 rounded-full overflow-hidden mt-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%`, background: 'linear-gradient(90deg, #C9B37E, #D8C48D)' }} />
                    </div>
                  )}
                  {item.status === 'error' && <p className="text-[11px] text-red-400/90 mt-0.5">{item.error}</p>}
                  {item.status === 'done' && item.size && <p className="text-[10px] text-sand-muted/50 mt-0.5">{fmtSize(item.size)}</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.status === 'done' && mode === 'pdf' && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                      style={{ background: 'rgba(201,179,126,0.10)', color: '#D8C48D', border: '1px solid rgba(201,179,126,0.20)' }}>
                      Abrir ↗
                    </a>
                  )}
                  {item.status === 'error' && (
                    <button type="button" onClick={() => retryUpload(item.id)}
                      className="text-[11px] font-semibold text-terra-light">
                      Reintentar
                    </button>
                  )}
                  <button type="button" onClick={() => remove(item.id)}
                    className="text-[11px] font-semibold text-red-400/60 hover:text-red-400 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
