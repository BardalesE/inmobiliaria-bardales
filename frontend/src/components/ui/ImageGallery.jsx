'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'

const FALLBACK = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80'

function cloudinaryThumb(url) {
  if (!url || !/\/video\/upload\//.test(url)) return null
  return url
    .replace('/video/upload/', '/video/upload/so_0,w_800,h_520,c_fill,q_auto,f_jpg/')
    .replace(/\.(mp4|webm|mov|avi|mkv)$/i, '.jpg')
}
function isCloudinaryVideo(url) { return !!url && /\/video\//.test(url) }

function buildSlides(images, videos, videoUrl, title) {
  const imgs = images.length > 0 ? images : [{ url: FALLBACK, alt: title }]
  const slides = imgs.map(img => ({ type: 'image', url: img.url || FALLBACK, alt: img.alt || title }))

  const videoList = videos.length
    ? videos.map(v => (typeof v === 'string' ? { url: v } : v)).filter(v => v?.url?.trim())
    : (isCloudinaryVideo(videoUrl) ? [{ url: videoUrl }] : [])

  videoList
    .filter(v => isCloudinaryVideo(v.url))
    .forEach(v => slides.push({ type: 'video', url: v.url, thumb: v.thumbnail || cloudinaryThumb(v.url) }))

  return slides
}

export default function ImageGallery({ images = [], videos = [], videoUrl = '', title = '' }) {
  const slides = buildSlides(images, videos, videoUrl, title)
  const [current, setCurrent]   = useState(0)
  const [fading, setFading]     = useState(false)
  const [playing, setPlaying]   = useState(false)

  const goTo = useCallback((n) => {
    if (fading || n === current) return
    setFading(true)
    setPlaying(false)
    setTimeout(() => { setCurrent(n); setFading(false) }, 240)
  }, [fading, current])

  const prev = () => goTo((current - 1 + slides.length) % slides.length)
  const next = () => goTo((current + 1) % slides.length)

  const slide = slides[current]

  return (
    <div className="space-y-3">

      {/* ── Hero viewer ── */}
      <div
        className="relative rounded-2xl overflow-hidden bg-bark-900 group"
        style={{
          height: 480,
          boxShadow: '0 24px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Slide content */}
        <div
          className="absolute inset-0 transition-opacity duration-[240ms] ease-in-out"
          style={{ opacity: fading ? 0 : 1 }}
        >
          {slide.type === 'video' ? (
            /* Video slide — click plays the real <video> inline */
            <div className="w-full h-full relative">
              {playing ? (
                <>
                  {slide.thumb && (
                    <Image src={slide.thumb} alt="" aria-hidden="true" fill sizes="100vw"
                      className="object-cover"
                      style={{ filter: 'blur(40px)', transform: 'scale(1.15)', opacity: 0.5 }} />
                  )}
                  <video
                    src={slide.url}
                    poster={slide.thumb || undefined}
                    controls
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                    onError={e => console.warn('[ImageGallery] fallo al cargar video', e.currentTarget.currentSrc)}
                  />
                </>
              ) : (
                <>
                  {slide.thumb ? (
                    <Image src={slide.thumb} alt="Video" fill className="object-cover" sizes="100vw" priority />
                  ) : (
                    <div className="w-full h-full" style={{ background: '#0F0A04' }} />
                  )}
                  <button
                    type="button"
                    aria-label="Reproducir video"
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center w-full"
                    style={{ background: 'rgba(0,0,0,0.32)', border: 'none', cursor: 'pointer' }}
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: 'rgba(201,164,78,0.90)',
                        boxShadow: '0 8px 36px rgba(201,164,78,0.55), 0 0 0 1px rgba(255,255,255,0.15)',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}>
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Image slide — fondo difuminado + foto completa sin recorte */
            <>
              <Image
                src={slide.url}
                alt=""
                aria-hidden="true"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
                style={{ filter: 'blur(40px)', transform: 'scale(1.15)', opacity: 0.5 }}
              />
              <Image
                src={slide.url}
                alt={slide.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority={current === 0}
              />
            </>
          )}
        </div>

        {/* Cinematic overlays */}
        {/* Top vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(8,4,1,0.42) 0%, transparent 28%)' }} />
        {/* Bottom gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(8,4,1,0.80) 0%, rgba(8,4,1,0.20) 40%, transparent 65%)' }} />
        {/* Side vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.38) 100%)' }} />

        {/* Counter badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {slide.type === 'video' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(201,164,78,0.80)', backdropFilter: 'blur(8px)' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span style={{ fontSize: 9, color: 'white', fontWeight: 700, letterSpacing: '0.1em' }}>VIDEO</span>
            </div>
          )}
          <span className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.52)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)',
            }}>
            {current + 1} / {slides.length}
          </span>
        </div>

        {/* Nav arrows */}
        {slides.length > 1 && (
          <>
            {[[-1, prev, 'left-4', 'M15 18l-6-6 6-6'], [1, next, 'right-4', 'M9 18l6-6-6-6']].map(([, fn, pos, d]) => (
              <button
                key={pos}
                onClick={fn}
                className={`absolute ${pos} top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-all duration-200`}
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,164,78,0.75)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d={d}/>
                </svg>
              </button>
            ))}
          </>
        )}

        {/* Bottom dot indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{
                  width: i === current ? 24 : 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === current ? '#D9BC7A' : 'rgba(255,255,255,0.35)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), background 0.25s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {slides.map((s, i) => {
            const active = i === current
            const thumbSrc = s.type === 'video' ? s.thumb : s.url
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative flex-shrink-0 overflow-hidden transition-all duration-250"
                style={{
                  width: 96,
                  height: 68,
                  borderRadius: 10,
                  border: active ? '2px solid #D9BC7A' : '2px solid rgba(255,255,255,0.07)',
                  boxShadow: active ? '0 0 0 1px rgba(217,188,122,0.3), 0 4px 16px rgba(201,164,78,0.25)' : 'none',
                  transform: active ? 'scale(1.04)' : 'scale(1)',
                  opacity: active ? 1 : 0.55,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = '0.55' }}
              >
                {thumbSrc ? (
                  <Image src={thumbSrc} alt={s.alt || ''} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full" style={{ background: '#0F0A04' }} />
                )}
                {s.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.35)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
