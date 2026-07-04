'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import api from '@/lib/api'

function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* Build a Cloudinary forced-download URL with a clean filename */
function pdfDownloadUrl(url, originalName = 'documento') {
  if (!url) return url
  const safeName = (originalName || 'documento')
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/\.pdf$/i, '') + '.pdf'
  return url.replace('/upload/', `/upload/fl_attachment:${safeName}/`)
}

function detectType(url, mimeType) {
  if (!url) return null
  if (mimeType?.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf') return 'pdf'
  if (/\/video\//.test(url) || /\.(mp4|webm|mov|avi|mkv)$/i.test(url)) return 'video'
  if (/\/raw\//.test(url) || /\.pdf$/i.test(url)) return 'pdf'
  return 'video' // default assumption for media uploads
}

/* ── Icons ──────────────────────────────────────────────── */
function IconVideo({ color = '#9A8268' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  )
}

function IconPdf({ color = '#F87171' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E07840" strokeWidth="2.5">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2"/>
      <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Main component ─────────────────────────────────────── */
export default function MediaUploader({
  value = '',
  onChange,
  accept = 'video/*,application/pdf',
  label = 'Video o documento',
  maxMB = 200,
  mode = 'video', // 'video' | 'pdf' | 'any'
}) {
  const [status, setStatus]       = useState('idle') // idle | uploading | done | error
  const [progress, setProgress]   = useState(0)
  const [errMsg, setErrMsg]       = useState('')
  const [meta, setMeta]           = useState(null)   // { name, size, mimeType, downloadUrl }
  const [dropActive, setDropActive] = useState(false)
  const fileRef = useRef(null)

  // Sync initial / external value
  useEffect(() => {
    if (value && status === 'idle') setStatus('done')
    else if (!value && status === 'done') { setStatus('idle'); setMeta(null) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const upload = useCallback(async (file) => {
    if (file.size > maxMB * 1024 * 1024) {
      setErrMsg(`El archivo no puede superar los ${maxMB} MB`)
      setStatus('error')
      return
    }
    setStatus('uploading')
    setProgress(0)
    setErrMsg('')
    setMeta({ name: file.name, size: file.size, mimeType: file.type })

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post('/upload/media', fd, {
        onUploadProgress: ({ loaded, total }) =>
          total && setProgress(Math.round(loaded / total * 100)),
      })
      const { url, originalName, size, downloadUrl } = res.data
      setMeta({ name: originalName || file.name, size: size ?? file.size, mimeType: file.type, downloadUrl: downloadUrl || null })
      setStatus('done')
      onChange(url)
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'Error al subir. Inténtalo de nuevo.')
      setStatus('error')
    }
  }, [maxMB, onChange])

  const handleFiles = useCallback((files) => {
    const file = Array.from(files).find(f =>
      f.type.startsWith('video/') || f.type === 'application/pdf'
    )
    if (file) upload(file)
    else setErrMsg('Formato no válido. Usa MP4, MOV, WEBM o PDF.')
  }, [upload])

  const onDrop  = (e) => { e.preventDefault(); setDropActive(false); handleFiles(e.dataTransfer.files) }
  const onOver  = (e) => { e.preventDefault(); setDropActive(true) }
  const onLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDropActive(false) }

  const remove = () => { setStatus('idle'); setMeta(null); setErrMsg(''); setProgress(0); onChange('') }

  const mediaType = detectType(value, meta?.mimeType)

  /* ── Idle / Error → Drop zone ── */
  if (status === 'idle' || status === 'error') return (
    <div className="space-y-2">
      <div
        onDragOver={onOver} onDragLeave={onLeave} onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className="relative cursor-pointer rounded-2xl transition-all"
        style={{
          border: `2px dashed ${dropActive ? 'rgba(196,98,45,0.60)' : 'rgba(255,255,255,0.09)'}`,
          background: dropActive ? 'rgba(196,98,45,0.05)' : 'rgba(21,15,7,0.55)',
          padding: '28px 24px',
          transition: 'border-color 0.18s ease, background 0.18s ease',
        }}
      >
        <div className="flex flex-col items-center gap-3 select-none">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(42,30,16,0.85)', border: `1px solid ${dropActive ? 'rgba(196,98,45,0.30)' : 'rgba(255,255,255,0.06)'}` }}>
            <IconVideo color={dropActive ? '#E07840' : '#9A8268'} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: dropActive ? '#E07840' : '#9A8268' }}>
              {dropActive ? 'Suelta el archivo aquí' : 'Arrastra aquí o haz clic para seleccionar'}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(154,130,104,0.50)' }}>
              MP4, MOV, WEBM · PDF — máx. {maxMB} MB
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold"
            style={{ background: 'rgba(196,98,45,0.10)', color: '#E07840' }}>
            Seleccionar archivo
          </div>
        </div>
        <input ref={fileRef} type="file" accept={accept} className="hidden"
          onChange={e => { handleFiles(e.target.files); e.target.value = '' }} />
      </div>
      {(status === 'error' && errMsg) && (
        <p className="text-xs text-red-400/90 flex items-center gap-1.5 px-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {errMsg}
        </p>
      )}
    </div>
  )

  /* ── Uploading ── */
  if (status === 'uploading') return (
    <div className="rounded-2xl border border-white/8 bg-bark-700 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Spinner />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sand truncate">{meta?.name ?? 'Subiendo...'}</p>
          {meta?.size && <p className="text-[10px] text-sand-muted/55 mt-0.5">{fmtSize(meta.size)}</p>}
        </div>
        <span className="text-sm font-bold text-terra-light tabular-nums">{progress}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #C4622D, #E07840)' }} />
      </div>
      <p className="text-[10px] text-sand-muted/40 text-center">
        No cierres esta página mientras se sube el archivo
      </p>
    </div>
  )

  /* ── Done ── */
  return (
    <div className="rounded-2xl border border-white/8 bg-bark-700 overflow-hidden">
      {/* Video player */}
      {mediaType === 'video' && (
        <video
          src={value}
          controls
          preload="metadata"
          className="w-full"
          style={{ maxHeight: 300, background: '#000', display: 'block' }}
        />
      )}

      {/* PDF row */}
      {mediaType === 'pdf' && (
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.18)' }}>
            <IconPdf />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sand truncate">{meta?.name ?? 'Documento PDF'}</p>
            {meta?.size && <p className="text-[11px] text-sand-muted/55">{fmtSize(meta.size)}</p>}
          </div>
          <div className="flex items-center gap-1.5">
            <a href={value} target="_blank" rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
              style={{ background: 'rgba(196,98,45,0.10)', color: '#E07840', border: '1px solid rgba(196,98,45,0.20)' }}>
              Abrir ↗
            </a>
            {(meta?.downloadUrl || value) && (
              <a
                href={meta?.downloadUrl || pdfDownloadUrl(value, meta?.name)}
                target="_blank" rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(154,130,104,0.75)', border: '1px solid rgba(255,255,255,0.08)' }}>
                ↓ PDF
              </a>
            )}
          </div>
        </div>
      )}

      {/* Footer bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/6">
        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
          {mediaType === 'video' ? 'Video guardado en Cloudinary' : 'PDF guardado en Cloudinary'}
        </span>
        <button type="button" onClick={remove}
          className="text-[11px] font-semibold text-red-400/60 hover:text-red-400 transition-colors">
          Eliminar
        </button>
      </div>
    </div>
  )
}
