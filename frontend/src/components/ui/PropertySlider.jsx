'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

/* Normalize any image entry to { type, url, alt }
   Supports: string URLs, { url } objects, Prisma Image objects { id, url, alt, order, ... } */
function normalizeImages(images) {
  if (!Array.isArray(images)) return []
  return images
    .map(i => (typeof i === 'string' ? { url: i, alt: '' } : i))
    .filter(i => i?.url?.trim())
    .map(i => ({ type: 'image', url: i.url, alt: i.alt || '' }))
}

/* Auto-generates Cloudinary video thumbnail from a video URL */
function cloudinaryThumb(videoUrl) {
  if (!videoUrl || !/\/video\/upload\//.test(videoUrl)) return null
  return videoUrl
    .replace('/video/upload/', '/video/upload/so_0,w_640,h_360,c_fill,q_auto,f_jpg/')
    .replace(/\.(mp4|webm|mov|avi|mkv)$/i, '.jpg')
}

function isCloudinaryVideo(url) {
  return !!url && /\/video\//.test(url)
}

/* ── No-media placeholder ─────────────────────── */
function EmptySlide({ height }) {
  return (
    <div
      style={{ height, background: 'linear-gradient(160deg,rgba(28,19,8,0.95),rgba(15,10,4,0.98))' }}
      className="flex flex-col items-center justify-center gap-2"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
        stroke="rgba(196,98,45,0.25)" strokeWidth="1.2" strokeLinecap="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
      <span style={{ fontSize: 9, color: 'rgba(154,130,104,0.28)', letterSpacing: '0.1em', fontWeight: 600 }}>
        SIN FOTOS
      </span>
    </div>
  )
}

/* ── Main component ───────────────────────────── */
export default function PropertySlider({
  images   = [],
  videoUrl = '',
  height   = 216,
  autoPlay = true,
  interval = 3000,
}) {
  const media = [
    ...normalizeImages(images),
    ...(isCloudinaryVideo(videoUrl) ? [{ type: 'video', url: videoUrl, thumb: cloudinaryThumb(videoUrl) }] : []),
  ]

  const count               = media.length
  const [idx, setIdx]       = useState(0)
  const [hovered, setHovered] = useState(false)
  const [playing, setPlaying] = useState(false)
  const touchX              = useRef(null)
  // Ref-based flag so go() doesn't depend on transitioning state (prevents interval reset bug)
  const inTransition        = useRef(false)

  const go = useCallback((delta) => {
    if (count <= 1 || inTransition.current) return
    inTransition.current = true
    setPlaying(false)
    setIdx(i => ((i + delta) % count + count) % count)
    setTimeout(() => { inTransition.current = false }, 520)
  }, [count])

  const goTo = useCallback((n) => {
    if (inTransition.current) return
    inTransition.current = true
    setPlaying(false)
    setIdx(((n % count) + count) % count)
    setTimeout(() => { inTransition.current = false }, 520)
  }, [count])

  /* Auto-advance — stable: go() only changes when count changes, not on every transition.
     Pauses while a video slide is actually playing. */
  useEffect(() => {
    if (!autoPlay || count <= 1 || hovered || playing) return
    const id = setInterval(() => go(1), interval)
    return () => clearInterval(id)
  }, [autoPlay, count, hovered, playing, go, interval])

  /* Touch / swipe */
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchX.current === null) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 44) go(diff > 0 ? 1 : -1)
    touchX.current = null
  }

  if (count === 0) return <EmptySlide height={height} />

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Slides (fade transition) ── */}
      {media.map((m, i) => {
        const active = i === idx
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              opacity: active ? 1 : 0,
              zIndex: active ? 1 : 0,
              transition: 'opacity 0.50s cubic-bezier(0.4,0,0.2,1)',
              pointerEvents: active ? 'auto' : 'none',
            }}
          >
            {m.type === 'video' ? (
              /* Video slide — thumbnail + play button; click plays the real <video> inline */
              <div className="w-full h-full relative">
                {active && playing ? (
                  <video
                    src={m.url}
                    poster={m.thumb || undefined}
                    controls
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    onClick={e => { e.preventDefault(); e.stopPropagation() }}
                    onError={e => console.warn('[PropertySlider] fallo al cargar video', e.currentTarget.currentSrc)}
                  />
                ) : (
                  <>
                    {m.thumb ? (
                      <Image src={m.thumb} alt="Video" fill draggable={false}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: '#0F0A04' }} />
                    )}
                    <button
                      type="button"
                      aria-label="Reproducir video"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); setPlaying(true) }}
                      className="absolute inset-0 flex items-center justify-center w-full"
                      style={{ background: 'rgba(0,0,0,0.28)', border: 'none', cursor: 'pointer' }}
                    >
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(196,98,45,0.88)',
                          boxShadow: '0 4px 20px rgba(196,98,45,0.45)',
                          border: '2px solid rgba(255,255,255,0.18)',
                        }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      </div>
                    </button>
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(4px)', zIndex: 3 }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: '0.1em' }}>VIDEO</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Image slide — Ken Burns zoom on active slide */
              <Image
                src={m.url}
                alt={m.alt}
                fill
                draggable={false}
                priority={i === 0}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                style={{
                  transform: active ? 'scale(1.04)' : 'scale(1)',
                  transition: 'transform 700ms cubic-bezier(0.4,0,0.2,1)',
                  willChange: 'transform',
                }}
              />
            )}
          </div>
        )
      })}

      {/* ── Bottom gradient ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, transparent 45%, rgba(8,4,1,0.65) 100%)',
        }} />

      {/* ── Prev / Next arrows (visible on hover) ── */}
      {count > 1 && (
        <>
          <button type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); go(-1) }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              zIndex: 5,
              background: 'rgba(0,0,0,0.52)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.14)',
              opacity: hovered ? 1 : 0,
              transform: `translateY(-50%) scale(${hovered ? 1 : 0.8})`,
              transition: 'opacity 0.20s ease, transform 0.20s ease',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); go(1) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              zIndex: 5,
              background: 'rgba(0,0,0,0.52)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.14)',
              opacity: hovered ? 1 : 0,
              transform: `translateY(-50%) scale(${hovered ? 1 : 0.8})`,
              transition: 'opacity 0.20s ease, transform 0.20s ease',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {count > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5" style={{ zIndex: 5 }}>
          {media.map((_, i) => (
            <button key={i} type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(i) }}
              style={{
                width: i === idx ? 20 : 5,
                height: 5,
                borderRadius: 99,
                background: i === idx ? '#E07840' : 'rgba(255,255,255,0.38)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width 0.32s cubic-bezier(0.4,0,0.2,1), background 0.25s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Slide counter (top-left) ── */}
      {count > 1 && (
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
          style={{
            zIndex: 5,
            background: 'rgba(0,0,0,0.52)',
            backdropFilter: 'blur(4px)',
            fontSize: 9,
            color: 'rgba(255,255,255,0.72)',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          {idx + 1}/{count}
        </div>
      )}
    </div>
  )
}
