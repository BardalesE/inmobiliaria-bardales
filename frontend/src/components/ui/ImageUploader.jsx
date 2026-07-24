'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import api from '@/lib/api'

const uid = () => Math.random().toString(36).slice(2, 9)

async function compress(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const blobUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(blobUrl)
      const MAX = 1400
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > MAX || h > MAX) {
        if (w >= h) { h = Math.round(h * MAX / w); w = MAX }
        else        { w = Math.round(w * MAX / h); h = MAX }
      }
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      c.toBlob(blob => resolve(blob ?? file), 'image/jpeg', 0.82)
    }
    img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file) }
    img.src = blobUrl
  })
}

export default function ImageUploader({ initialImages = [], onChange }) {
  const [items, setItems] = useState(() =>
    initialImages
      .filter(img => img?.url?.trim())
      .map(img => ({ id: uid(), url: img.url, alt: img.alt || '', status: 'done', progress: 100 }))
  )
  const [dropActive, setDropActive] = useState(false)
  const [dragIdx, setDragIdx]       = useState(null)
  const [overIdx, setOverIdx]       = useState(null)
  const [lightbox, setLightbox]     = useState(null)
  const fileRef  = useRef(null)
  const busyRef  = useRef(new Set())
  const cbRef    = useRef(onChange)
  useEffect(() => { cbRef.current = onChange }, [onChange])

  // Sync items → parent (skip onChange dep to avoid stale closure issues)
  useEffect(() => {
    const done = items
      .filter(it => it.status === 'done')
      .map(it => ({ url: it.url, alt: it.alt }))
    cbRef.current(done.length > 0 ? done : [{ url: '', alt: '' }])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const patch = useCallback((id, updates) =>
    setItems(p => p.map(it => it.id === id ? { ...it, ...updates } : it))
  , [])

  const upload = useCallback(async (id, file) => {
    if (busyRef.current.has(id)) return
    busyRef.current.add(id)
    try {
      const blob  = await compress(file)
      const fd    = new FormData()
      fd.append('image', blob, file.name.replace(/\.[^.]+$/, '') + '.jpg')
      const res  = await api.post('/upload', fd, {
        onUploadProgress: ({ loaded, total }) =>
          total && patch(id, { progress: Math.round(loaded / total * 100) }),
      })
      const url = res.data?.url ?? res.data?.data?.url ?? ''
      patch(id, { url, status: 'done', progress: 100 })
    } catch {
      patch(id, { status: 'error', progress: 0 })
    } finally {
      busyRef.current.delete(id)
    }
  }, [patch])

  const addFiles = useCallback((files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return
    const newItems = imgs.map(file => ({
      id: uid(), file,
      url: URL.createObjectURL(file),
      alt: '', status: 'uploading', progress: 0,
    }))
    setItems(p => [...p, ...newItems])
    newItems.forEach(it => upload(it.id, it.file))
  }, [upload])

  // Drop zone handlers
  const onEnter = e => { e.preventDefault(); setDropActive(true) }
  const onLeave = e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropActive(false) }
  const onOver  = e => e.preventDefault()
  const onDrop  = e => { e.preventDefault(); setDropActive(false); addFiles(e.dataTransfer.files) }

  // Reorder drag handlers
  const startDrag = (e, i) => { setDragIdx(i); e.dataTransfer.effectAllowed = 'move' }
  const overCard  = (e, i) => { e.preventDefault(); setOverIdx(i) }
  const dropCard  = (e, i) => {
    e.preventDefault()
    if (dragIdx == null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return }
    setItems(p => {
      const n = [...p]; const [m] = n.splice(dragIdx, 1); n.splice(i, 0, m); return n
    })
    setDragIdx(null); setOverIdx(null)
  }
  const endDrag = () => { setDragIdx(null); setOverIdx(null) }

  const remove    = id => setItems(p => p.filter(it => it.id !== id))
  const makeCover = id => setItems(p => {
    const i = p.findIndex(it => it.id === id)
    if (i <= 0) return p
    const n = [...p]; n.unshift(...n.splice(i, 1)); return n
  })
  const retryUpload = id => {
    const it = items.find(it => it.id === id)
    if (it?.file) { patch(id, { status: 'uploading', progress: 0 }); upload(id, it.file) }
  }

  const uploadingCount = items.filter(it => it.status === 'uploading').length

  return (
    <div className="space-y-3">

      {/* ── Drop zone ── */}
      <div
        onDragEnter={onEnter} onDragLeave={onLeave} onDragOver={onOver} onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className="relative cursor-pointer overflow-hidden rounded-2xl"
        style={{
          border: `2px dashed ${dropActive ? 'rgba(201,164,78,0.65)' : 'rgba(255,255,255,0.09)'}`,
          background: dropActive ? 'rgba(201,164,78,0.06)' : 'rgba(28,19,8,0.60)',
          padding: '30px 20px',
          transition: 'border-color 0.18s ease, background 0.18s ease',
        }}
      >
        {dropActive && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,164,78,0.09), transparent)',
          }} />
        )}
        <div className="relative flex flex-col items-center gap-2.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: dropActive ? 'rgba(201,164,78,0.16)' : 'rgba(42,30,16,0.85)',
              border: `1px solid ${dropActive ? 'rgba(201,164,78,0.38)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.18s ease',
            }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
              stroke={dropActive ? '#D9BC7A' : '#9A8268'} strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'stroke 0.18s ease' }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{
              color: dropActive ? '#D9BC7A' : '#9A8268',
              transition: 'color 0.18s ease',
            }}>
              {dropActive ? 'Suelta las fotos aquí' : 'Arrastra fotos aquí o haz clic para seleccionar'}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'rgba(154,130,104,0.50)' }}>
              JPG, PNG, WEBP — compresión automática a 1400 px máx
            </p>
          </div>
          {items.length > 0 && (
            <div
              className="mt-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ background: 'rgba(201,164,78,0.10)', color: '#D9BC7A' }}
            >
              + Agregar más fotos
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
      </div>

      {/* ── Upload progress banner ── */}
      {uploadingCount > 0 && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
          style={{ background: 'rgba(201,164,78,0.06)', border: '1px solid rgba(201,164,78,0.18)' }}>
          <svg className="animate-spin flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D9BC7A" strokeWidth="2.5">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.22"/>
            <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
          </svg>
          <span className="text-xs font-semibold" style={{ color: '#D9BC7A' }}>
            Subiendo {uploadingCount} {uploadingCount === 1 ? 'foto' : 'fotos'}…
          </span>
        </div>
      )}

      {/* ── Preview grid ── */}
      {items.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-[0.14em] font-bold" style={{ color: 'rgba(154,130,104,0.55)' }}>
            {items.filter(it => it.status === 'done').length} foto{items.filter(it => it.status === 'done').length !== 1 ? 's' : ''} · Arrastra para reordenar
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {items.map((item, idx) => (
              <ImageCard
                key={item.id}
                item={item}
                idx={idx}
                isDragging={dragIdx === idx}
                isDragOver={overIdx === idx && dragIdx !== idx}
                onDragStart={e => startDrag(e, idx)}
                onDragOver={e => overCard(e, idx)}
                onDrop={e => dropCard(e, idx)}
                onDragEnd={endDrag}
                onRemove={() => remove(item.id)}
                onMakeCover={() => makeCover(item.id)}
                onRetry={() => retryUpload(item.id)}
                onLightbox={() => setLightbox(item.url)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox} alt="Vista previa"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 16, boxShadow: '0 40px 120px rgba(0,0,0,0.7)' }}
            onClick={e => e.stopPropagation()}
            draggable={false}
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

function ImageCard({ item, idx, isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd, onRemove, onMakeCover, onRetry, onLightbox }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-xl"
      style={{
        border: isDragOver
          ? '2px dashed rgba(201,164,78,0.65)'
          : '1px solid rgba(255,255,255,0.07)',
        background: '#1C1308',
        opacity: isDragging ? 0.40 : 1,
        cursor: 'grab',
        transition: 'opacity 0.15s ease, border-color 0.15s ease',
        boxShadow: isDragOver ? '0 0 0 4px rgba(201,164,78,0.12)' : 'none',
      }}
    >
      {/* Thumbnail */}
      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#2A1E10' }}>
        <img
          src={item.url}
          alt={item.alt || `Foto ${idx + 1}`}
          className="w-full h-full object-cover select-none"
          draggable={false}
          style={{ transition: 'transform 0.25s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>

      {/* Cover badge */}
      {idx === 0 && item.status === 'done' && (
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded-md"
          style={{
            background: 'rgba(201,164,78,0.92)',
            backdropFilter: 'blur(4px)',
            fontSize: 9, fontWeight: 700, color: '#FDF6E9',
            letterSpacing: '0.10em', textTransform: 'uppercase',
          }}
        >
          Portada
        </div>
      )}

      {/* Uploading overlay */}
      {item.status === 'uploading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: 'rgba(15,10,4,0.78)', backdropFilter: 'blur(2px)' }}>
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9BC7A" strokeWidth="2.5">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.22"/>
            <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
          </svg>
          <div style={{ width: '68%', height: 3, background: 'rgba(255,255,255,0.10)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, #C9A44E, #D9BC7A)',
              width: `${item.progress}%`,
              transition: 'width 0.25s ease',
            }} />
          </div>
          <span style={{ fontSize: 10, color: 'rgba(253,246,233,0.65)', fontWeight: 600 }}>
            {item.progress}%
          </span>
        </div>
      )}

      {/* Error overlay */}
      {item.status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: 'rgba(15,10,4,0.84)', backdropFilter: 'blur(2px)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="13"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: 10, color: '#F87171', fontWeight: 600 }}>Error al subir</span>
          {item.file && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRetry() }}
              style={{
                fontSize: 10, color: '#D9BC7A', fontWeight: 700,
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 10px',
              }}
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Hover action bar */}
      {item.status === 'done' && (
        <div
          className="absolute bottom-0 left-0 right-0 flex justify-end gap-1.5 px-2 pb-2"
          style={{
            paddingTop: 22,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.78))',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.18s ease',
          }}
        >
          {idx > 0 && (
            <button
              type="button"
              title="Hacer portada"
              onClick={e => { e.stopPropagation(); onMakeCover() }}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(201,164,78,0.88)', border: 'none', cursor: 'pointer' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          )}
          <button
            type="button"
            title="Ver imagen completa"
            onClick={e => { e.stopPropagation(); onLightbox() }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.14)', border: 'none', cursor: 'pointer' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </button>
          <button
            type="button"
            title="Eliminar"
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(248,113,113,0.22)', border: 'none', cursor: 'pointer' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
