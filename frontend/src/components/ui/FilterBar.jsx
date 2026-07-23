'use client'
import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: '',          label: 'Todos'       },
  { value: 'AVAILABLE', label: 'Disponibles' },
  { value: 'RESERVED',  label: 'Separados'   },
]

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Más recientes' },
  { value: 'price_asc',      label: 'Menor precio'  },
  { value: 'price_desc',     label: 'Mayor precio'  },
  { value: 'area_desc',      label: 'Mayor área'    },
]

export default function FilterBar({ onFilter, total }) {
  const [filters, setFilters] = useState({
    status: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
  })

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value }
    if (key === 'sort') {
      const [sortBy, order] = value.split('_')
      updated.sortBy = sortBy
      updated.order  = order
      delete updated.sort
    }
    setFilters(updated)
    onFilter(updated)
  }

  return (
    <div
      className="px-4 sm:px-6 py-4"
      style={{
        background: 'rgba(28,19,8,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: 'rgba(154,130,104,0.5)' }}
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por sector, lote, referencia…"
            value={filters.search}
            onChange={e => handleChange('search', e.target.value)}
            className="input-premium pl-9"
            style={{ paddingTop: 9, paddingBottom: 9 }}
          />
        </div>

        {/* Status pills */}
        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map(opt => {
            const active = filters.status === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleChange('status', opt.value)}
                className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  background:  active ? 'rgba(201,179,126,0.85)'      : 'rgba(42,30,16,0.65)',
                  color:        active ? '#FDF6E9'                    : '#9A8268',
                  border:       active ? '1px solid rgba(201,179,126,0.6)' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow:    active ? '0 2px 14px rgba(201,179,126,0.25)' : 'none',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="S/ mín"
            value={filters.minPrice}
            onChange={e => handleChange('minPrice', e.target.value)}
            className="input-premium w-24 text-xs"
            style={{ paddingTop: 9, paddingBottom: 9 }}
          />
          <div className="w-3 h-px flex-shrink-0" style={{ background: 'rgba(154,130,104,0.3)' }} />
          <input
            type="number"
            placeholder="S/ máx"
            value={filters.maxPrice}
            onChange={e => handleChange('maxPrice', e.target.value)}
            className="input-premium w-24 text-xs"
            style={{ paddingTop: 9, paddingBottom: 9 }}
          />
        </div>

        {/* Sort — custom styled wrapper */}
        <div className="relative">
          <select
            onChange={e => handleChange('sort', e.target.value)}
            className="input-premium appearance-none pr-8 text-xs cursor-pointer"
            style={{ paddingTop: 9, paddingBottom: 9, width: 'auto', minWidth: 130 }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} style={{ background: '#1C1308' }}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="rgba(154,130,104,0.6)" strokeWidth="2.5" strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>

        {/* Count */}
        {total !== undefined && (
          <span className="text-xs ml-auto flex-shrink-0" style={{ color: 'rgba(154,130,104,0.6)' }}>
            <span className="font-bold" style={{ color: '#D8C48D' }}>{total}</span>
            <span className="ml-1">propiedades</span>
          </span>
        )}
      </div>
    </div>
  )
}
