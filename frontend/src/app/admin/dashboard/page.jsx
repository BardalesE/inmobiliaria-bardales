'use client'
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAdminAuth } from '@/lib/useAdminAuth'

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTS = [
  { value: 'AVAILABLE', label: 'Disponible', color: '#34D399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.24)'  },
  { value: 'RESERVED',  label: 'Separado',   color: '#FACC15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.24)'  },
  { value: 'SOLD',      label: 'Vendido',    color: '#9CA3AF', bg: 'rgba(156,163,175,0.10)', border: 'rgba(156,163,175,0.24)' },
  { value: 'HIDDEN',    label: 'Oculto',     color: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.24)' },
  { value: 'DRAFT',     label: 'Borrador',   color: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.24)'  },
]
const STATUS_MAP = Object.fromEntries(STATUS_OPTS.map(o => [o.value, o]))
const PAGE_SIZE = 12

// ── Toast Container ───────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-[9998] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 340 }}>
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(14,9,3,0.97)',
            border: t.type === 'error'   ? '1px solid rgba(248,113,113,0.32)'
                  : t.type === 'warning' ? '1px solid rgba(250,204,21,0.30)'
                  :                        '1px solid rgba(52,211,153,0.28)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.50)',
            animation: 'slideInRight 0.28s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {t.type === 'error' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          ) : t.type === 'warning' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M20 6 9 17l-5-5"/></svg>
          )}
          <p className="flex-1 text-[13px] leading-snug" style={{ color: '#FDF6E9' }}>{t.msg}</p>
          <button onClick={() => onRemove(t.id)} style={{ color: 'rgba(154,130,104,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.18s ease' }}
      onClick={onCancel}
    >
      <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          background: 'rgba(20,13,5,0.99)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.65)',
          animation: 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.20)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-sand mb-1">Confirmar acción</p>
            <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(154,130,104,0.85)' }}>{msg}</p>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-sand-muted transition-colors hover:text-sand"
            style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            Cancelar
          </button>
          <button onClick={() => { onConfirm(); onCancel() }}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #b91c1c, #ef4444)', boxShadow: '0 4px 16px rgba(239,68,68,0.22)' }}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="bg-bark-800 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="skeleton w-11 h-11 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="skeleton h-2.5 w-14 rounded-full" />
        <div className="skeleton h-3.5 w-44 rounded-full" />
        <div className="skeleton h-2.5 w-28 rounded-full" />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="skeleton h-7 w-24 rounded-lg" />
        <div className="skeleton h-7 w-8 rounded-lg" />
        <div className="skeleton h-7 w-8 rounded-lg" />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-bark-800 border border-white/5 rounded-2xl px-5 py-5 space-y-3">
      <div className="skeleton h-7 w-24 rounded-full" />
      <div className="skeleton h-2.5 w-20 rounded-full" />
      <div className="skeleton h-2.5 w-28 rounded-full" />
    </div>
  )
}

// ── WaBtn ─────────────────────────────────────────────────────────────────────
function WaBtn({ phone, name, compact }) {
  return (
    <a
      href={`https://wa.me/${(phone||'').replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(name)}%2C%20soy%20de%20EE-Stars.`}
      target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold transition-colors"
      style={{
        background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)', color: '#34D399',
        padding: compact ? '5px 10px' : '6px 12px',
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      {compact ? 'WA' : 'WhatsApp'}
    </a>
  )
}

// ── PropRow ───────────────────────────────────────────────────────────────────
const PropRow = memo(function PropRow({ p, onStatus, onFeatured, onDuplicate, onDelete }) {
  const [hov, setHov] = useState(false)
  const s = STATUS_MAP[p.status] || STATUS_MAP.DRAFT

  return (
    <div
      className="prop-row bg-bark-800 rounded-xl px-4 py-3 flex items-center gap-3"
      style={{ border: `1px solid ${hov ? 'rgba(196,98,45,0.22)' : 'rgba(255,255,255,0.05)'}` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Thumbnail */}
      <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(42,30,16,0.80)' }}>
        {p.images?.[0]?.url
          ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(154,130,104,0.30)" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[10px] font-bold tracking-wide" style={{ color: '#E07840' }}>{p.ref}</span>
          {p.featured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(250,204,21,0.12)', color: '#FACC15', border: '1px solid rgba(250,204,21,0.22)' }}>
              ★ Destacado
            </span>
          )}
        </div>
        <p className="text-[13px] font-semibold text-sand truncate leading-tight">{p.title}</p>
        <p className="text-[11px] truncate" style={{ color: 'rgba(154,130,104,0.65)' }}>
          {p.district} · S/ {Number(p.price || 0).toLocaleString('es-PE')} · {p.area} m²
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Status select */}
        <div className="relative">
          <select value={p.status} onChange={e => onStatus(p.id, e.target.value)}
            className="appearance-none pl-2.5 pr-5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer focus:outline-none transition-all"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            {STATUS_OPTS.map(o => (
              <option key={o.value} value={o.value} style={{ background: '#1C1308', color: '#FDF6E9' }}>{o.label}</option>
            ))}
          </select>
          <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
        </div>

        {/* Featured star */}
        <button onClick={() => onFeatured(p.id, p.featured)} title={p.featured ? 'Quitar destacado' : 'Destacar'}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: p.featured ? 'rgba(250,204,21,0.12)' : 'transparent',
            border: `1px solid ${p.featured ? 'rgba(250,204,21,0.25)' : 'rgba(255,255,255,0.06)'}`,
            color: p.featured ? '#FACC15' : 'rgba(154,130,104,0.40)',
          }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={p.featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>

        {/* Edit */}
        <Link href={`/admin/properties/${p.id}/edit`} title="Editar"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:text-sand"
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(154,130,104,0.50)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </Link>

        {/* View on site */}
        <a href={`/properties/${p.id}`} target="_blank" rel="noopener noreferrer" title="Ver en sitio"
          className="w-8 h-8 rounded-lg items-center justify-center transition-all hover:text-sand hidden sm:flex"
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(154,130,104,0.50)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>

        {/* Duplicate */}
        <button onClick={() => onDuplicate(p)} title="Duplicar como borrador"
          className="w-8 h-8 rounded-lg items-center justify-center transition-all hover:text-sand hidden md:flex"
          style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(154,130,104,0.50)', opacity: hov ? 1 : 0.35,
            transition: 'opacity 0.18s ease, color 0.18s ease',
          }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>

        {/* Delete */}
        <button onClick={() => onDelete(p.id, p.ref)} title="Eliminar propiedad"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: 'transparent', border: '1px solid rgba(248,113,113,0.16)',
            color: 'rgba(248,113,113,0.50)', opacity: hov ? 1 : 0.35,
            transition: 'opacity 0.18s ease',
          }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>
  )
})

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAdminAuth()

  // Data
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [properties, setProperties] = useState([])
  const [leads, setLeads] = useState([])
  const [sellers, setSellers] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [companies, setCompanies] = useState([])
  const [commissions, setCommissions] = useState([])
  const [commStats, setCommStats] = useState(null)

  // Forms
  const [newTestimonial, setNewTestimonial] = useState(null)
  const [newCompany, setNewCompany] = useState(null)
  const [showCommForm, setShowCommForm] = useState(false)
  const [commForm, setCommForm] = useState({ propertyId: '', salePrice: '', percentage: '3', notes: '' })

  // Toast system
  const [toasts, setToasts] = useState([])
  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4200)
  }, [])
  const removeToast = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), [])

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState(null)
  const confirm = useCallback((msg, onConfirm) => setConfirmModal({ msg, onConfirm }), [])

  // Property list filters
  const [propSearch, setPropSearch] = useState('')
  const [propStatus, setPropStatus] = useState('')
  const [propPage, setPropPage] = useState(0)
  const searchRef = useRef(null)
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Reset pagination on filter change
  useEffect(() => { setPropPage(0) }, [propSearch, propStatus])

  // Keyboard shortcut: press "/" to focus search in properties tab
  useEffect(() => {
    if (tab !== 'properties') return
    const handler = e => {
      if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault(); searchRef.current?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [tab])

  useEffect(() => {
    if (user) loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, p, l, t, c, comm] = await Promise.all([
        api.get('/properties/stats'),
        api.get('/properties', { params: { limit: 200, sortBy: 'createdAt', order: 'desc' } }),
        api.get('/leads', { params: { limit: 200 } }),
        api.get('/testimonials'),
        api.get('/companies'),
        api.get('/commissions'),
      ])
      setStats(s.data.data)
      setProperties(p.data.data || [])
      const allLeads = l.data.data || []
      setLeads(allLeads.filter(x => x.source !== 'seller'))
      setSellers(allLeads.filter(x => x.source === 'seller'))
      setTestimonials(t.data.data || [])
      setCompanies(c.data.data || [])
      setCommissions(comm.data.data || [])
      setCommStats(comm.data.stats || null)
    } catch { toast('Error al cargar datos del panel', 'error') }
    finally { setLoading(false) }
  }

  // Chart
  useEffect(() => {
    if (tab !== 'overview' || !stats || typeof window === 'undefined') return
    const render = () => {
      if (!chartRef.current || !window.Chart) return
      if (chartInstance.current) chartInstance.current.destroy()
      const counts = { AVAILABLE: 0, RESERVED: 0, SOLD: 0, HIDDEN: 0, DRAFT: 0 }
      properties.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++ })
      chartInstance.current = new window.Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: ['Disponibles', 'Separadas', 'Vendidas', 'Ocultas', 'Borradores'],
          datasets: [{
            label: 'Propiedades',
            data: Object.values(counts),
            backgroundColor: ['rgba(52,211,153,0.65)', 'rgba(250,204,21,0.65)', 'rgba(156,163,175,0.65)', 'rgba(248,113,113,0.65)', 'rgba(96,165,250,0.65)'],
            borderColor: ['#34D399', '#FACC15', '#9CA3AF', '#F87171', '#60A5FA'],
            borderWidth: 1.5, borderRadius: 8, borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(154,130,104,0.7)', font: { family: 'Outfit', size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(154,130,104,0.7)', stepSize: 1, font: { family: 'Outfit', size: 11 } }, beginAtZero: true },
          },
        },
      })
    }
    if (!window.Chart) {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js'
      s.onload = render; document.head.appendChild(s)
    } else { render() }
  }, [tab, stats, properties])

  // Memoized filtered/paginated properties
  const filteredProps = useMemo(() => {
    let r = properties
    if (propSearch) {
      const q = propSearch.toLowerCase()
      r = r.filter(p =>
        p.ref?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.sector?.toLowerCase().includes(q) ||
        String(p.price).includes(q)
      )
    }
    if (propStatus) r = r.filter(p => p.status === propStatus)
    return r
  }, [properties, propSearch, propStatus])

  const pagedProps  = useMemo(() => filteredProps.slice(propPage * PAGE_SIZE, (propPage + 1) * PAGE_SIZE), [filteredProps, propPage])
  const totalPages  = Math.ceil(filteredProps.length / PAGE_SIZE)

  // ── Actions ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    router.push('/admin')
  }

  const changeStatus = useCallback(async (id, status) => {
    const prev = properties.find(p => p.id === id)?.status
    setProperties(p => p.map(x => x.id === id ? { ...x, status } : x))  // optimistic
    try {
      await api.put(`/properties/${id}`, { status })
      toast(`Estado → ${STATUS_MAP[status]?.label || status}`)
    } catch {
      setProperties(p => p.map(x => x.id === id ? { ...x, status: prev } : x))
      toast('Error al cambiar estado', 'error')
    }
  }, [properties, toast])

  const toggleFeatured = useCallback(async (id, featured) => {
    setProperties(p => p.map(x => x.id === id ? { ...x, featured: !featured } : x))  // optimistic
    try {
      await api.put(`/properties/${id}`, { featured: !featured })
      toast(featured ? 'Quitado de destacados' : 'Marcado como destacado')
    } catch {
      setProperties(p => p.map(x => x.id === id ? { ...x, featured } : x))
      toast('Error al actualizar', 'error')
    }
  }, [toast])

  const deleteProperty = useCallback((id, ref) => {
    confirm(`¿Eliminar "${ref}"? Esta acción no se puede deshacer.`, async () => {
      try {
        await api.delete(`/properties/${id}`)
        setProperties(p => p.filter(x => x.id !== id))
        toast('Propiedad eliminada')
      } catch { toast('Error al eliminar', 'error') }
    })
  }, [confirm, toast])

  const duplicateProperty = useCallback(async (p) => {
    try {
      const res = await api.post('/properties', {
        ref: `${p.ref}-2`, title: `${p.title} (copia)`,
        description: p.description || '', price: p.price, area: p.area,
        frontage: p.frontage, depth: p.depth, sector: p.sector || '',
        block: p.block || '', lot: p.lot || '', address: p.address,
        district: p.district, province: p.province, department: p.department,
        latitude: p.latitude, longitude: p.longitude,
        status: 'DRAFT', type: p.type, features: p.features || [], images: [],
      })
      const newProp = res.data?.data
      if (newProp) setProperties(prev => [newProp, ...prev])
      toast('Duplicada como borrador — puedes editarla ahora')
    } catch { toast('Error al duplicar', 'error') }
  }, [toast])

  const deleteLead = useCallback((id) => {
    confirm('¿Eliminar esta consulta?', async () => {
      await api.delete(`/leads/${id}`).catch(console.error)
      setLeads(p => p.filter(x => x.id !== id))
      setSellers(p => p.filter(x => x.id !== id))
      toast('Consulta eliminada')
    })
  }, [confirm, toast])

  const deleteTestimonial = useCallback((id) => {
    confirm('¿Eliminar este testimonio?', async () => {
      await api.delete(`/testimonials/${id}`).catch(console.error)
      setTestimonials(p => p.filter(x => x.id !== id))
      toast('Testimonio eliminado')
    })
  }, [confirm, toast])

  const deleteCompany = useCallback((id) => {
    confirm('¿Eliminar esta empresa aliada?', async () => {
      await api.delete(`/companies/${id}`).catch(console.error)
      setCompanies(p => p.filter(x => x.id !== id))
      toast('Empresa eliminada')
    })
  }, [confirm, toast])

  const deleteCommission = useCallback((id) => {
    confirm('¿Eliminar esta comisión? No podrás recuperarla.', async () => {
      await api.delete(`/commissions/${id}`).catch(console.error)
      setCommissions(p => p.filter(x => x.id !== id))
      const res = await api.get('/commissions')
      setCommStats(res.data.stats)
      toast('Comisión eliminada')
    })
  }, [confirm, toast])

  const saveTestimonial = async () => {
    if (!newTestimonial?.name || !newTestimonial?.comment) return toast('Nombre y comentario son requeridos', 'warning')
    try {
      const res = await api.post('/testimonials', newTestimonial)
      if (res?.data?.data) { setTestimonials(p => [...p, res.data.data]); setNewTestimonial(null) }
      toast('Testimonio guardado')
    } catch { toast('Error al guardar', 'error') }
  }

  const saveCompany = async () => {
    if (!newCompany?.name) return toast('El nombre es requerido', 'warning')
    try {
      const res = await api.post('/companies', newCompany)
      if (res?.data?.data) { setCompanies(p => [...p, res.data.data]); setNewCompany(null) }
      toast('Empresa guardada')
    } catch { toast('Error al guardar', 'error') }
  }

  const saveCommission = async () => {
    if (!commForm.propertyId || !commForm.salePrice) return toast('Completa propiedad y precio', 'warning')
    try {
      await api.post('/commissions', commForm)
      const amount = Math.round(parseFloat(commForm.salePrice) * parseFloat(commForm.percentage) / 100)
      toast(`Comisión registrada: S/ ${amount.toLocaleString('es-PE')}`)
      setShowCommForm(false)
      setCommForm({ propertyId: '', salePrice: '', percentage: '3', notes: '' })
      const [comm, props] = await Promise.all([api.get('/commissions'), api.get('/properties', { params: { limit: 200 } })])
      setCommissions(comm.data.data || [])
      setCommStats(comm.data.stats)
      setProperties(props.data.data || [])
    } catch (e) { toast(e.response?.data?.message || 'Error al registrar', 'error') }
  }

  // ── Tab config ───────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'overview',     label: 'Resumen' },
    { id: 'properties',   label: `Propiedades (${properties.length})` },
    { id: 'commissions',  label: `Comisiones (${commissions.length})` },
    { id: 'sellers',      label: `Vendedores (${sellers.length})` },
    { id: 'leads',        label: `Consultas (${leads.length})` },
    { id: 'testimonials', label: `Testimonios (${testimonials.length})` },
    { id: 'companies',    label: `Aliados (${companies.length})` },
  ]

  // ── Auth guard ───────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div className="min-h-screen bg-bark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(196,98,45,0.6)" strokeWidth="2.5">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2"/>
          <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
        </svg>
        <p className="text-sand-muted text-xs">Verificando sesión...</p>
      </div>
    </div>
  )

  // ── KPI card data ────────────────────────────────────────────────────────────
  const kpis = stats ? [
    {
      value: stats.total, label: 'Total', sub: `${stats.available ?? 0} disponibles`,
      color: '#FDF6E9', border: 'rgba(255,255,255,0.07)', bg: 'transparent',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(253,246,233,0.30)" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      value: stats.available ?? 0, label: 'Disponibles', sub: `${stats.reserved ?? 0} separadas`,
      color: '#34D399', border: 'rgba(52,211,153,0.16)', bg: 'rgba(52,211,153,0.04)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.40)" strokeWidth="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    },
    {
      value: `S/ ${commStats?.totalCommissions?.toLocaleString('es-PE') || '0'}`,
      label: 'Comisiones', sub: `${commStats?.count ?? 0} ventas cerradas`,
      color: '#E07840', border: 'rgba(196,98,45,0.16)', bg: 'rgba(196,98,45,0.04)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(224,120,64,0.40)" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    },
    {
      value: leads.length + sellers.length, label: 'Leads totales',
      sub: `${leads.length} consultas · ${sellers.length} propietarios`,
      color: '#60A5FA', border: 'rgba(96,165,250,0.16)', bg: 'rgba(96,165,250,0.04)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(96,165,250,0.40)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.74"/></svg>,
    },
  ] : []

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bark-900">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-5 h-14"
        style={{ background: 'rgba(20,13,5,0.96)', borderBottom: '1px solid rgba(196,98,45,0.14)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 0 rgba(196,98,45,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-display text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C4622D, #E07840)', boxShadow: '0 2px 12px rgba(196,98,45,0.35)' }}>
            EE
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-display text-[14px] tracking-widest text-sand">EE-Stars</span>
            <span className="text-[8px] tracking-[0.20em] uppercase" style={{ color: 'rgba(224,120,64,0.55)' }}>Panel Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/hero-videos"
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-lg transition-colors"
            style={{ background: 'rgba(42,30,16,0.70)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(154,130,104,0.80)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 10l-4 2.5V7.5L15 10z"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
            Hero
          </Link>
          <Link href="/admin/properties/new"
            className="flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-2 rounded-lg transition-all"
            style={{ background: 'rgba(196,98,45,0.18)', border: '1px solid rgba(196,98,45,0.30)', color: '#E07840' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva propiedad
          </Link>
          <button onClick={logout}
            className="text-[11px] font-semibold px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'rgba(154,130,104,0.65)' }}>
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : kpis.map((k, i) => (
                <div key={i} className="rounded-2xl px-5 py-4"
                  style={{ background: `rgba(28,19,8,0.80)`, border: `1px solid ${k.border}` }}>
                  <div className="flex items-start justify-between mb-2">
                    {k.icon}
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: 'rgba(154,130,104,0.50)' }}>{k.label}</span>
                  </div>
                  <div className="font-display text-2xl tracking-wide" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-[10px] mt-1" style={{ color: 'rgba(154,130,104,0.55)' }}>{k.sub}</div>
                </div>
              ))
          }
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-bark-800 border border-white/5 rounded-xl p-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`admin-tab${tab === t.id ? ' active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Chart */}
                  <div className="bg-bark-800 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-display text-[17px] tracking-wide mb-4" style={{ color: 'rgba(253,246,233,0.90)' }}>Propiedades por estado</h3>
                    <div className="h-44"><canvas ref={chartRef} /></div>
                  </div>
                  {/* Commission summary */}
                  <div className="bg-bark-800 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-display text-[17px] tracking-wide mb-4" style={{ color: 'rgba(253,246,233,0.90)' }}>Comisiones generadas</h3>
                    {commStats ? (
                      <div className="space-y-2.5">
                        {[
                          { label: 'Total comisiones', value: `S/ ${commStats.totalCommissions?.toLocaleString('es-PE')}`, color: '#E07840' },
                          { label: 'Total en ventas', value: `S/ ${commStats.totalSales?.toLocaleString('es-PE')}`, color: '#FDF6E9' },
                          { label: 'Ventas cerradas', value: commStats.count, color: '#34D399' },
                        ].map(({ label, value, color }, i) => (
                          <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                            <span className="text-sm" style={{ color: 'rgba(154,130,104,0.80)' }}>{label}</span>
                            <span className="font-bold text-sm" style={{ color }}>{value}</span>
                          </div>
                        ))}
                        <button onClick={() => setTab('commissions')}
                          className="w-full mt-1 py-2 rounded-xl text-xs font-bold transition-colors"
                          style={{ background: 'rgba(196,98,45,0.12)', border: '1px solid rgba(196,98,45,0.22)', color: '#E07840' }}>
                          Ver todas las comisiones →
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <p className="text-sm text-sand-muted">Sin comisiones registradas</p>
                        <button onClick={() => { setTab('commissions'); setShowCommForm(true) }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(196,98,45,0.12)', border: '1px solid rgba(196,98,45,0.22)', color: '#E07840' }}>
                          + Registrar primera venta
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent activity row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Recent properties */}
                  <div className="bg-bark-800 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-[17px] tracking-wide" style={{ color: 'rgba(253,246,233,0.90)' }}>Últimas propiedades</h3>
                      <button onClick={() => setTab('properties')} className="text-[11px] font-bold" style={{ color: '#E07840' }}>Ver todas →</button>
                    </div>
                    {properties.slice(0, 5).length === 0
                      ? <p className="text-sand-muted text-sm text-center py-8">Sin propiedades aún</p>
                      : properties.slice(0, 5).map(p => (
                          <div key={p.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.045)' }}>
                            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(42,30,16,0.80)' }}>
                              {p.images?.[0]?.url
                                ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                : <div className="w-full h-full flex items-center justify-center"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(154,130,104,0.30)" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-sand truncate">{p.title}</p>
                              <p className="text-[10px]" style={{ color: 'rgba(154,130,104,0.60)' }}>{p.ref} · S/ {Number(p.price || 0).toLocaleString('es-PE')}</p>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                              style={{ background: STATUS_MAP[p.status]?.bg, color: STATUS_MAP[p.status]?.color, border: `1px solid ${STATUS_MAP[p.status]?.border}` }}>
                              {STATUS_MAP[p.status]?.label}
                            </span>
                          </div>
                        ))
                    }
                  </div>

                  {/* Recent leads */}
                  <div className="bg-bark-800 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-[17px] tracking-wide" style={{ color: 'rgba(253,246,233,0.90)' }}>Últimas consultas</h3>
                      <button onClick={() => setTab('leads')} className="text-[11px] font-bold" style={{ color: '#E07840' }}>Ver todas →</button>
                    </div>
                    {leads.slice(0, 5).length === 0
                      ? (
                        <div className="text-center py-8">
                          <p className="text-sand-muted text-sm">Sin consultas recientes</p>
                          <p className="text-[11px] text-sand-muted mt-1 opacity-60">Aparecerán cuando alguien llene el formulario</p>
                        </div>
                      )
                      : leads.slice(0, 5).map(l => (
                          <div key={l.id} className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.045)' }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-sand">{l.name}</p>
                              <p className="text-[10px]" style={{ color: 'rgba(154,130,104,0.60)' }}>{l.phone}{l.property ? ` · ${l.property.ref}` : ''}</p>
                            </div>
                            <WaBtn phone={l.phone} name={l.name} compact />
                          </div>
                        ))
                    }
                    {sellers.slice(0, 3).length > 0 && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] mt-4 mb-2" style={{ color: 'rgba(154,130,104,0.50)' }}>Quieren publicar</p>
                        {sellers.slice(0, 3).map(s => (
                          <div key={s.id} className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-sand">{s.name}</p>
                              <p className="text-[10px]" style={{ color: 'rgba(154,130,104,0.60)' }}>{s.phone}</p>
                            </div>
                            <WaBtn phone={s.phone} name={s.name} compact />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── PROPERTIES ── */}
            {tab === 'properties' && (
              <div className="space-y-3">
                {/* Search + filter bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1" style={{ minWidth: 200 }}>
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(154,130,104,0.45)' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                    </svg>
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder='Buscar por ref, título, distrito… (presiona / para enfocar)'
                      value={propSearch}
                      onChange={e => setPropSearch(e.target.value)}
                      className="input-admin pl-9 pr-9"
                    />
                    {propSearch && (
                      <button onClick={() => setPropSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(154,130,104,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>

                  {/* Status filter pills */}
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => setPropStatus('')}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                      style={{
                        background: !propStatus ? 'rgba(196,98,45,0.18)' : 'rgba(42,30,16,0.65)',
                        color: !propStatus ? '#E07840' : 'rgba(154,130,104,0.70)',
                        border: !propStatus ? '1px solid rgba(196,98,45,0.32)' : '1px solid rgba(255,255,255,0.06)',
                      }}>
                      Todos
                    </button>
                    {STATUS_OPTS.slice(0, 3).map(o => (
                      <button key={o.value} onClick={() => setPropStatus(propStatus === o.value ? '' : o.value)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                        style={{
                          background: propStatus === o.value ? o.bg : 'rgba(42,30,16,0.65)',
                          color: propStatus === o.value ? o.color : 'rgba(154,130,104,0.70)',
                          border: propStatus === o.value ? `1px solid ${o.border}` : '1px solid rgba(255,255,255,0.06)',
                        }}>
                        {o.label}
                      </button>
                    ))}
                  </div>

                  {/* Count */}
                  <span className="text-[11px] ml-auto flex-shrink-0" style={{ color: 'rgba(154,130,104,0.55)' }}>
                    {filteredProps.length < properties.length
                      ? <><span className="font-bold" style={{ color: '#E07840' }}>{filteredProps.length}</span> de {properties.length}</>
                      : <><span className="font-bold" style={{ color: '#E07840' }}>{properties.length}</span> propiedades</>
                    }
                  </span>

                  <Link href="/admin/properties/new"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(196,98,45,0.18)', border: '1px solid rgba(196,98,45,0.28)', color: '#E07840' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Nueva
                  </Link>
                </div>

                {/* Property rows */}
                {pagedProps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(154,130,104,0.25)" strokeWidth="1.2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                    <p className="text-sand-muted text-sm">Sin resultados para &quot;{propSearch}&quot;</p>
                    <button onClick={() => { setPropSearch(''); setPropStatus('') }} className="text-xs font-bold" style={{ color: '#E07840' }}>Limpiar filtros</button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {pagedProps.map(p => (
                      <PropRow key={p.id} p={p} onStatus={changeStatus} onFeatured={toggleFeatured} onDuplicate={duplicateProperty} onDelete={deleteProperty} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-2">
                    <button
                      disabled={propPage === 0}
                      onClick={() => setPropPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                      style={{ background: 'rgba(42,30,16,0.65)', border: '1px solid rgba(255,255,255,0.07)', color: '#9A8268' }}>
                      ← Ant.
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const page = totalPages <= 7 ? i : (propPage < 4 ? i : propPage - 3 + i)
                      if (page >= totalPages) return null
                      return (
                        <button key={page} onClick={() => setPropPage(page)}
                          className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: propPage === page ? 'rgba(196,98,45,0.85)' : 'rgba(42,30,16,0.65)',
                            color: propPage === page ? '#FDF6E9' : '#9A8268',
                            border: propPage === page ? '1px solid rgba(196,98,45,0.50)' : '1px solid rgba(255,255,255,0.07)',
                          }}>
                          {page + 1}
                        </button>
                      )
                    })}
                    <button
                      disabled={propPage >= totalPages - 1}
                      onClick={() => setPropPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                      style={{ background: 'rgba(42,30,16,0.65)', border: '1px solid rgba(255,255,255,0.07)', color: '#9A8268' }}>
                      Sig. →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── COMMISSIONS ── */}
            {tab === 'commissions' && (
              <div>
                {commStats && (
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { n: `S/ ${commStats.totalCommissions?.toLocaleString('es-PE')}`, l: 'Total ganado', c: '#E07840' },
                      { n: `S/ ${commStats.totalSales?.toLocaleString('es-PE')}`, l: 'En ventas', c: '#34D399' },
                      { n: commStats.count, l: 'Ventas cerradas', c: '#60A5FA' },
                    ].map((s, i) => (
                      <div key={i} className="bg-bark-800 border border-white/5 rounded-2xl px-5 py-4">
                        <div className="font-display text-2xl tracking-wide" style={{ color: s.c }}>{s.n}</div>
                        <div className="text-[10px] uppercase tracking-wide mt-1" style={{ color: 'rgba(154,130,104,0.55)' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                  <p className="text-sm text-sand-muted">Registra cada venta para calcular tu comisión automáticamente.</p>
                  <button onClick={() => setShowCommForm(true)}
                    className="text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(196,98,45,0.18)', border: '1px solid rgba(196,98,45,0.28)', color: '#E07840' }}>
                    + Registrar venta
                  </button>
                </div>

                {showCommForm && (
                  <div className="bg-bark-800 border border-terra/30 rounded-2xl p-5 mb-5 space-y-4">
                    <h3 className="font-display text-xl text-terra-light">Registrar venta y comisión</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'salePrice', label: 'Precio de venta (S/) *', type: 'number', placeholder: '85000' },
                        { key: 'percentage', label: '% Comisión', type: 'number', placeholder: '3' },
                        { key: 'notes', label: 'Notas', type: 'text', placeholder: 'Observaciones...' },
                      ].map(({ key, label, type, placeholder }) => (
                        <div key={key}>
                          <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">{label}</label>
                          <input type={type} value={commForm[key]} onChange={e => setCommForm(p => ({ ...p, [key]: e.target.value }))}
                            placeholder={placeholder} className="input-admin" />
                        </div>
                      ))}
                      <div>
                        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">Propiedad *</label>
                        <select value={commForm.propertyId} onChange={e => setCommForm(p => ({ ...p, propertyId: e.target.value }))}
                          className="input-admin">
                          <option value="">Seleccionar propiedad...</option>
                          {properties.filter(p => p.status !== 'SOLD').map(p => (
                            <option key={p.id} value={p.id}>{p.ref} — {p.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {commForm.salePrice && commForm.percentage && (
                      <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(196,98,45,0.08)', border: '1px solid rgba(196,98,45,0.18)' }}>
                        <p className="text-xs text-sand-muted mb-0.5">Comisión calculada</p>
                        <p className="font-display text-2xl text-terra-light">
                          S/ {Math.round(parseFloat(commForm.salePrice || 0) * parseFloat(commForm.percentage || 0) / 100).toLocaleString('es-PE')}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => setShowCommForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sand-muted text-sm">Cancelar</button>
                      <button onClick={saveCommission} className="flex-[2] py-2.5 rounded-xl text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #C4622D, #E07840)' }}>
                        Registrar venta
                      </button>
                    </div>
                  </div>
                )}

                {commissions.length === 0 ? (
                  <div className="text-center py-20 text-sand-muted">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(154,130,104,0.25)" strokeWidth="1.2" className="mx-auto mb-4"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    <p>Sin ventas registradas aún</p>
                    <p className="text-xs mt-1 opacity-60">Cuando cierres una venta, regístrala aquí</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {commissions.map(c => (
                      <div key={c.id} className="bg-bark-800 border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap hover:border-terra/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold" style={{ color: '#E07840' }}>{c.property?.ref}</p>
                          <p className="text-[13px] font-semibold text-sand">{c.property?.title}</p>
                          {c.notes && <p className="text-xs text-sand-muted mt-0.5">{c.notes}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-sand-muted">Precio venta</p>
                          <p className="text-sm font-bold text-sand">S/ {c.salePrice?.toLocaleString('es-PE')}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-sand-muted">Comisión ({c.percentage}%)</p>
                          <p className="font-display text-xl text-terra-light">S/ {c.amount?.toLocaleString('es-PE')}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                          <p className="text-[10px] text-sand-muted">{new Date(c.createdAt).toLocaleDateString('es-PE')}</p>
                          <button onClick={() => deleteCommission(c.id)} className="text-[10px] font-bold transition-colors" style={{ color: 'rgba(248,113,113,0.60)' }}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SELLERS ── */}
            {tab === 'sellers' && (
              <div className="space-y-3">
                <p className="text-sm text-sand-muted">Personas que quieren publicar su propiedad.</p>
                {sellers.length === 0 ? (
                  <div className="text-center py-20 text-sand-muted">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(154,130,104,0.25)" strokeWidth="1.2" className="mx-auto mb-4"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                    <p>Sin solicitudes aún</p>
                  </div>
                ) : sellers.map(s => {
                    const city = s.message?.match(/Ciudad: ([^|]+)/)?.[1]?.trim()
                    const type = s.message?.match(/Tipo: ([^|]+)/)?.[1]?.trim()
                    return (
                      <div key={s.id} className="bg-bark-800 border border-white/5 rounded-2xl p-5 hover:border-terra/20 transition-colors flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-sand text-sm">{s.name}</h3>
                            {type && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(196,98,45,0.10)', border: '1px solid rgba(196,98,45,0.20)', color: '#E07840' }}>{type}</span>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-sand-muted">
                            <a href={`tel:${s.phone}`} className="hover:text-terra-light transition-colors">{s.phone}</a>
                            {city && <span>{city}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <WaBtn phone={s.phone} name={s.name} />
                          <Link href="/admin/properties/new"
                            className="text-[10px] font-bold px-3 py-1.5 rounded-lg"
                            style={{ background: 'rgba(196,98,45,0.12)', border: '1px solid rgba(196,98,45,0.22)', color: '#E07840' }}>
                            + Publicar propiedad
                          </Link>
                          <button onClick={() => deleteLead(s.id)} className="text-[10px] font-bold transition-colors" style={{ color: 'rgba(248,113,113,0.60)' }}>Eliminar</button>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            )}

            {/* ── LEADS ── */}
            {tab === 'leads' && (
              <div className="space-y-3">
                {leads.length === 0 ? (
                  <div className="text-center py-20 text-sand-muted">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(154,130,104,0.25)" strokeWidth="1.2" className="mx-auto mb-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <p>Sin consultas aún</p>
                  </div>
                ) : leads.map(l => (
                    <div key={l.id} className="bg-bark-800 border border-white/5 rounded-2xl p-5 hover:border-terra/20 transition-colors flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sand text-sm mb-1">{l.name}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-sand-muted mb-2">
                          <a href={`tel:${l.phone}`} className="hover:text-terra-light transition-colors">{l.phone}</a>
                          {l.email && <a href={`mailto:${l.email}`} className="hover:text-terra-light transition-colors">{l.email}</a>}
                        </div>
                        {l.message && (
                          <p className="text-xs text-sand-muted px-3 py-2 rounded-lg" style={{ background: 'rgba(42,30,16,0.60)', border: '1px solid rgba(255,255,255,0.05)' }}>{l.message}</p>
                        )}
                        {l.property && <p className="text-[11px] mt-2 font-semibold" style={{ color: '#E07840' }}>{l.property.title} ({l.property.ref})</p>}
                      </div>
                      <div className="flex flex-col gap-2 items-end flex-shrink-0">
                        <p className="text-[10px] text-sand-muted">{new Date(l.createdAt).toLocaleDateString('es-PE', { day:'2-digit', month:'short' })}</p>
                        <WaBtn phone={l.phone} name={l.name} />
                        <button onClick={() => deleteLead(l.id)} className="text-[10px] font-bold transition-colors" style={{ color: 'rgba(248,113,113,0.60)' }}>Eliminar</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ── TESTIMONIALS ── */}
            {tab === 'testimonials' && (
              <div>
                <div className="flex justify-between mb-4">
                  <p className="text-sm text-sand-muted">Aparecen en la página principal.</p>
                  <button onClick={() => setNewTestimonial({ name:'', role:'', city:'', comment:'', rating:5, avatar:'' })}
                    className="text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(196,98,45,0.18)', border: '1px solid rgba(196,98,45,0.28)', color: '#E07840' }}>
                    + Agregar
                  </button>
                </div>

                {newTestimonial && (
                  <div className="bg-bark-800 border border-terra/25 rounded-2xl p-5 mb-4 space-y-3">
                    <h3 className="font-display text-lg text-terra-light">Nuevo testimonio</h3>
                    {[['name','Nombre *'],['role','Cargo / Rol'],['city','Ciudad'],['avatar','URL foto (opcional)']].map(([f,l]) => (
                      <div key={f}>
                        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">{l}</label>
                        <input value={newTestimonial[f]||''} onChange={e => setNewTestimonial(p => ({ ...p, [f]: e.target.value }))} className="input-admin" />
                      </div>
                    ))}
                    <div>
                      <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">Comentario *</label>
                      <textarea rows={3} value={newTestimonial.comment||''} onChange={e => setNewTestimonial(p => ({ ...p, comment: e.target.value }))}
                        className="input-admin resize-none" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setNewTestimonial(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sand-muted text-sm">Cancelar</button>
                      <button onClick={saveTestimonial} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #C4622D, #E07840)' }}>Guardar</button>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  {testimonials.length === 0
                    ? <div className="text-center py-16 text-sand-muted">Sin testimonios</div>
                    : testimonials.map(t => (
                        <div key={t.id} className="bg-bark-800 border border-white/5 rounded-2xl p-4 flex items-start gap-3 hover:border-terra/20 transition-colors">
                          {t.avatar
                            ? <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            : <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: 'rgba(196,98,45,0.18)', color: '#E07840' }}>{t.name[0]}</div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sand text-sm">{t.name}</p>
                            <p className="text-[11px] text-sand-muted">{t.role}{t.city ? ` · ${t.city}` : ''}</p>
                            <p className="text-xs text-sand-muted mt-1">&quot;{t.comment}&quot;</p>
                          </div>
                          <button onClick={() => deleteTestimonial(t.id)} className="text-[10px] font-bold flex-shrink-0 transition-colors" style={{ color: 'rgba(248,113,113,0.55)' }}>Eliminar</button>
                        </div>
                      ))
                  }
                </div>
              </div>
            )}

            {/* ── COMPANIES ── */}
            {tab === 'companies' && (
              <div>
                <div className="flex justify-between mb-4">
                  <p className="text-sm text-sand-muted">Aparecen en &quot;Empresas que confían&quot;.</p>
                  <button onClick={() => setNewCompany({ name:'', logo:'', comment:'', type:'' })}
                    className="text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(196,98,45,0.18)', border: '1px solid rgba(196,98,45,0.28)', color: '#E07840' }}>
                    + Agregar
                  </button>
                </div>

                {newCompany && (
                  <div className="bg-bark-800 border border-terra/25 rounded-2xl p-5 mb-4 space-y-3">
                    <h3 className="font-display text-lg text-terra-light">Nueva empresa aliada</h3>
                    {[['name','Nombre *'],['logo','URL logo'],['comment','Descripción'],['type','Tipo']].map(([f,l]) => (
                      <div key={f}>
                        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">{l}</label>
                        <input value={newCompany[f]||''} onChange={e => setNewCompany(p => ({ ...p, [f]: e.target.value }))} className="input-admin" />
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <button onClick={() => setNewCompany(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sand-muted text-sm">Cancelar</button>
                      <button onClick={saveCompany} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #C4622D, #E07840)' }}>Guardar</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {companies.length === 0
                    ? <div className="text-center py-16 text-sand-muted col-span-2">Sin empresas aliadas</div>
                    : companies.map(c => (
                        <div key={c.id} className="bg-bark-800 border border-white/5 rounded-2xl p-4 flex items-center gap-3 hover:border-terra/20 transition-colors">
                          {c.logo
                            ? <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            : <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: 'rgba(196,98,45,0.18)', color: '#E07840' }}>{c.name[0]}</div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sand text-sm">{c.name}</p>
                            {c.comment && <p className="text-[11px] text-sand-muted">{c.comment}</p>}
                          </div>
                          <button onClick={() => deleteCompany(c.id)} className="text-[10px] font-bold flex-shrink-0 transition-colors" style={{ color: 'rgba(248,113,113,0.55)' }}>Eliminar</button>
                        </div>
                      ))
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Confirm modal ── */}
      {confirmModal && (
        <ConfirmModal
          msg={confirmModal.msg}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}
