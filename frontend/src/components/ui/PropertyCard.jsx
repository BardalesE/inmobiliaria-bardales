'use client'
import Image from 'next/image'
import Link from 'next/link'

const STATUS_LABEL = { AVAILABLE: 'Disponible', RESERVED: 'Separado', SOLD: 'Vendido' }
const STATUS_COLOR = {
  AVAILABLE: 'bg-emerald-500 text-emerald-950',
  RESERVED: 'bg-yellow-400 text-yellow-950',
  SOLD: 'bg-zinc-500 text-zinc-100'
}

export default function PropertyCard({ property }) {
  const image = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
  const priceM2 = property.area ? Math.round(property.price / property.area) : null

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <div className="bg-bark-800 border border-terra/20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-black/50 group-hover:border-terra/60">

        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-bark-700">
          <Image
            src={image}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bark-900/80 to-transparent" />

          {/* Status badge */}
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${STATUS_COLOR[property.status]}`}>
            {STATUS_LABEL[property.status]}
          </span>

          {/* Area badge */}
          <span className="absolute bottom-3 right-3 bg-bark-900/80 backdrop-blur-sm border border-white/10 text-sand text-[11px] font-bold px-2.5 py-1 rounded-lg">
            {property.area} m²
          </span>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-terra-light font-semibold mb-1">
            {property.ref}
          </p>
          <h3 className="font-display text-lg tracking-wide text-sand leading-tight mb-1.5">
            {property.title}
          </h3>
          <p className="flex items-center gap-1.5 text-[11px] text-sand-muted mb-3">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {property.address}, {property.district}
          </p>

          {/* Specs chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-0.5 bg-bark-700 border border-white/5 rounded text-[10px] font-semibold text-sand">
              📐 {property.area} m²
            </span>
            {property.block && (
              <span className="px-2 py-0.5 bg-bark-700 border border-white/5 rounded text-[10px] font-semibold text-sand">
                Mz {property.block}
              </span>
            )}
            {property.lot && (
              <span className="px-2 py-0.5 bg-bark-700 border border-white/5 rounded text-[10px] font-semibold text-sand">
                Lt {property.lot}
              </span>
            )}
          </div>

          {/* Price row */}
          <div className="flex items-end justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-sand-muted">Precio</p>
              <p className="font-display text-2xl text-terra-light tracking-wide leading-none">
                S/ {property.price.toLocaleString()}
              </p>
              {priceM2 && (
                <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Negociable</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white text-xs font-bold shadow-md shadow-terra/30 group-hover:shadow-terra/50 transition-shadow">
              Ver más
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
