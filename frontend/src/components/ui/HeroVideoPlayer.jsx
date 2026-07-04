'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

const FALLBACK = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&q=60'
const CROSSFADE_MS = 1200
const SAFETY_MS = 20000

export default function HeroVideoPlayer({ videos = [] }) {
  const active = videos.filter(v => v.active).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const isMulti = active.length > 1

  // A/B slot system: slotA is "front", slotB is "back" preloading next
  const [slotA, setSlotA]     = useState(0)        // index into `active`
  const [slotB, setSlotB]     = useState(1 % (active.length || 1))
  const [front, setFront]     = useState('A')      // which slot is visible
  const [fading, setFading]   = useState(false)
  const [dotsIdx, setDotsIdx] = useState(0)

  const videoA   = useRef(null)
  const videoB   = useRef(null)
  const timerRef = useRef(null)
  const busyRef  = useRef(false)

  const currentIdx = front === 'A' ? slotA : slotB

  // ── Advance to next video ──────────────────────────────────────────────────
  const advance = useCallback((toIdx) => {
    if (!isMulti || busyRef.current) return
    busyRef.current = true
    clearTimeout(timerRef.current)

    const nextIdx = toIdx !== undefined
      ? toIdx
      : (currentIdx + 1) % active.length

    // Stage next video in the *back* slot before crossfade
    if (front === 'A') {
      setSlotB(nextIdx)
    } else {
      setSlotA(nextIdx)
    }

    // Let the staged video load for one frame, then crossfade
    requestAnimationFrame(() => {
      // Force the back video to start playing (muted)
      const backRef = front === 'A' ? videoB : videoA
      if (backRef.current) {
        backRef.current.load()
        backRef.current.play().catch(() => {})
      }

      // Start crossfade after a tiny delay so back slot is painted
      setTimeout(() => {
        setFading(true)
        setTimeout(() => {
          setFront(f => f === 'A' ? 'B' : 'A')
          setDotsIdx(nextIdx)
          setFading(false)
          busyRef.current = false
        }, CROSSFADE_MS)
      }, 80)
    })
  }, [isMulti, front, currentIdx, active.length])

  // ── Safety timer & ended listener ─────────────────────────────────────────
  useEffect(() => {
    if (!isMulti) return
    const frontRef = front === 'A' ? videoA : videoB
    const v = frontRef.current
    if (!v) return

    const onEnded = () => advance()
    v.addEventListener('ended', onEnded)
    timerRef.current = setTimeout(advance, SAFETY_MS)

    return () => {
      v.removeEventListener('ended', onEnded)
      clearTimeout(timerRef.current)
    }
  }, [front, isMulti, advance])

  // ── Play front video when it becomes front ────────────────────────────────
  useEffect(() => {
    const frontRef = front === 'A' ? videoA : videoB
    const v = frontRef.current
    if (!v) return
    v.play().catch(() => {})
  }, [front])

  // ── Manual dot navigation ─────────────────────────────────────────────────
  const goTo = useCallback((idx) => {
    if (idx === currentIdx || busyRef.current) return
    advance(idx)
  }, [currentIdx, advance])

  // ── No active videos ──────────────────────────────────────────────────────
  if (!active.length) {
    return (
      <Image
        src={FALLBACK}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ opacity: 0.22 }}
      />
    )
  }

  const videoForSlot = (idx) => active[idx] || active[0]
  const vA = videoForSlot(slotA)
  const vB = videoForSlot(slotB)

  // Opacity values for the two slots
  const opacityA = front === 'A'
    ? (fading ? 0 : 1)
    : (fading ? 1 : 0)
  const opacityB = front === 'B'
    ? (fading ? 0 : 1)
    : (fading ? 1 : 0)

  return (
    <>
      {/* ── Slot A ──────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: opacityA * 0.48,
          transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
          zIndex: front === 'A' ? 1 : 0,
        }}
      >
        <video
          ref={videoA}
          src={vA.videoUrl}
          poster={vA.thumbnail || FALLBACK}
          autoPlay={vA.autoplay !== false}
          muted
          loop={!isMulti && vA.loop !== false}
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { e.currentTarget.style.visibility = 'hidden' }}
        />
      </div>

      {/* ── Slot B ──────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: opacityB * 0.48,
          transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
          zIndex: front === 'B' ? 1 : 0,
        }}
      >
        <video
          ref={videoB}
          src={vB.videoUrl}
          poster={vB.thumbnail || FALLBACK}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { e.currentTarget.style.visibility = 'hidden' }}
        />
      </div>

      {/* ── Cinematic vignette ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: `
            radial-gradient(ellipse 120% 80% at 50% 100%, rgba(0,0,0,0.72) 0%, transparent 70%),
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,0,0,0.40) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Dot indicators ──────────────────────────────────────────────── */}
      {isMulti && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 items-center"
          style={{ zIndex: 10 }}
        >
          {active.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Video ${i + 1}`}
              style={{
                transition: 'all 0.35s ease',
                width:  i === dotsIdx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === dotsIdx ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.28)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}
