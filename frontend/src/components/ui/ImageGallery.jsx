'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function ImageGallery({ images = [], title = '' }) {
  const [current, setCurrent] = useState(0)

  const fallback = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
  const imgs = images.length > 0 ? images : [{ url: fallback, alt: title }]

  const prev = () => setCurrent(c => (c - 1 + imgs.length) % imgs.length)
  const next = () => setCurrent(c => (c + 1) % imgs.length)

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-bark-700 border border-terra/20">
        <Image
          src={imgs[current]?.url || fallback}
          alt={imgs[current]?.alt || title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bark-900/60 to-transparent pointer-events-none" />

        {/* Counter */}
        <span className="absolute top-3 right-3 bg-bark-900/70 backdrop-blur-sm border border-white/10 text-sand text-xs font-semibold px-2.5 py-1 rounded-full">
          {current + 1} / {imgs.length}
        </span>

        {/* Arrows */}
        {imgs.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-bark-900/60 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-terra/60 transition-colors text-lg">‹</button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-bark-900/60 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-terra/60 transition-colors text-lg">›</button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-terra shadow-md shadow-terra/30' : 'border-white/10 opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img.url || fallback} alt={img.alt || ''} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
