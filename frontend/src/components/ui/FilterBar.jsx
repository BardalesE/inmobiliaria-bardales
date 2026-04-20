'use client'
import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'AVAILABLE', label: 'Disponibles' },
  { value: 'RESERVED', label: 'Separados' },
]

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'area_desc', label: 'Mayor área' },
]

export default function FilterBar({ onFilter, total }) {
  const [filters, setFilters] = useState({
    status: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'createdAt',
    order: 'desc'
  })

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value }

    if (key === 'sort') {
      const [sortBy, order] = value.split('_')
      updated.sortBy = sortBy
      updated.order = order
      delete updated.sort
    }

    setFilters(updated)
    onFilter(updated)
  }

  return (
    <div className="bg-bark-800 border-b border-terra/20 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por sector, lote, referencia..."
            value={filters.search}
            onChange={e => handleChange('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted focus:outline-none focus:border-terra/60 transition-colors"
          />
        </div>

        {/* Status pills */}
        <div className="flex gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleChange('status', opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filters.status === opt.value
                  ? 'bg-terra text-white shadow-md shadow-terra/30'
                  : 'bg-bark-700 border border-white/10 text-sand-muted hover:text-sand'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Precio mín"
            value={filters.minPrice}
            onChange={e => handleChange('minPrice', e.target.value)}
            className="w-28 px-3 py-2 bg-bark-700 border border-white/10 rounded-lg text-xs text-sand placeholder-sand-muted focus:outline-none focus:border-terra/60"
          />
          <span className="text-sand-muted text-xs">—</span>
          <input
            type="number"
            placeholder="Precio máx"
            value={filters.maxPrice}
            onChange={e => handleChange('maxPrice', e.target.value)}
            className="w-28 px-3 py-2 bg-bark-700 border border-white/10 rounded-lg text-xs text-sand placeholder-sand-muted focus:outline-none focus:border-terra/60"
          />
        </div>

        {/* Sort */}
        <select
          onChange={e => handleChange('sort', e.target.value)}
          className="px-3 py-2 bg-bark-700 border border-white/10 rounded-lg text-xs text-sand focus:outline-none focus:border-terra/60 cursor-pointer"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Count */}
        {total !== undefined && (
          <span className="text-xs text-sand-muted ml-auto">
            <span className="text-terra-light font-bold">{total}</span> propiedades
          </span>
        )}
      </div>
    </div>
  )
}
