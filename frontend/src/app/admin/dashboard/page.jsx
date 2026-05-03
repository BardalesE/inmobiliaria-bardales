'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const STATUS_OPTS = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'RESERVED',  label: 'Separado' },
  { value: 'SOLD',      label: 'Vendido' },
  { value: 'HIDDEN',    label: 'Oculto' },
  { value: 'DRAFT',     label: 'Borrador' },
]

export default function AdminDashboard() {
  const router = useRouter()
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
  const [newTestimonial, setNewTestimonial] = useState(null)
  const [newCompany, setNewCompany] = useState(null)
  const [showCommForm, setShowCommForm] = useState(false)
  const [commForm, setCommForm] = useState({ propertyId: '', salePrice: '', percentage: '3', notes: '' })
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin'); return
    }
    loadAll()
  }, [router])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, p, l, t, c, comm] = await Promise.all([
        axios.get(`${API}/properties/stats`),
        axios.get(`${API}/properties?limit=100&sortBy=createdAt&order=desc`),
        axios.get(`${API}/leads?limit=100`),
        axios.get(`${API}/testimonials`),
        axios.get(`${API}/companies`),
        axios.get(`${API}/commissions`),
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
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Gráfico de barras con Chart.js CDN
  useEffect(() => {
    if (tab !== 'overview' || !stats || typeof window === 'undefined') return
    const loadChart = async () => {
      if (!window.Chart) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js'
        script.onload = () => renderChart()
        document.head.appendChild(script)
      } else {
        renderChart()
      }
    }
    loadChart()
  }, [tab, stats, properties])

  const renderChart = () => {
    if (!chartRef.current || !window.Chart) return
    if (chartInstance.current) { chartInstance.current.destroy() }
    const statusCounts = { AVAILABLE: 0, RESERVED: 0, SOLD: 0, HIDDEN: 0, DRAFT: 0 }
    properties.forEach(p => { if (statusCounts[p.status] !== undefined) statusCounts[p.status]++ })
    chartInstance.current = new window.Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Disponibles', 'Separadas', 'Vendidas', 'Ocultas', 'Borradores'],
        datasets: [{
          label: 'Propiedades',
          data: Object.values(statusCounts),
          backgroundColor: ['rgba(34,197,94,0.7)', 'rgba(234,179,8,0.7)', 'rgba(161,161,170,0.7)', 'rgba(239,68,68,0.7)', 'rgba(96,165,250,0.7)'],
          borderColor: ['#22c55e', '#eab308', '#a1a1aa', '#ef4444', '#60a5fa'],
          borderWidth: 2, borderRadius: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9A8268' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9A8268', stepSize: 1 }, beginAtZero: true }
        }
      }
    })
  }

  const logout = () => { localStorage.removeItem('admin_auth'); router.push('/admin') }

  const changeStatus = async (id, status) => {
    await axios.put(`${API}/properties/${id}`, { status }).catch(console.error)
    setProperties(p => p.map(x => x.id === id ? { ...x, status } : x))
  }

  const toggleFeatured = async (id, featured) => {
    await axios.put(`${API}/properties/${id}`, { featured: !featured }).catch(console.error)
    setProperties(p => p.map(x => x.id === id ? { ...x, featured: !featured } : x))
  }

  const deleteLead = async (id) => {
    if (!confirm('¿Eliminar?')) return
    await axios.delete(`${API}/leads/${id}`).catch(console.error)
    setLeads(p => p.filter(x => x.id !== id))
    setSellers(p => p.filter(x => x.id !== id))
  }

  const deleteTestimonial = async (id) => {
    if (!confirm('¿Eliminar?')) return
    await axios.delete(`${API}/testimonials/${id}`).catch(console.error)
    setTestimonials(p => p.filter(x => x.id !== id))
  }

  const deleteCompany = async (id) => {
    if (!confirm('¿Eliminar?')) return
    await axios.delete(`${API}/companies/${id}`).catch(console.error)
    setCompanies(p => p.filter(x => x.id !== id))
  }

  const deleteCommission = async (id) => {
    if (!confirm('¿Eliminar comisión?')) return
    await axios.delete(`${API}/commissions/${id}`).catch(console.error)
    setCommissions(p => p.filter(x => x.id !== id))
    const res = await axios.get(`${API}/commissions`)
    setCommStats(res.data.stats)
  }

  const saveTestimonial = async () => {
    if (!newTestimonial?.name || !newTestimonial?.comment) return
    const res = await axios.post(`${API}/testimonials`, newTestimonial).catch(console.error)
    if (res?.data?.data) { setTestimonials(p => [...p, res.data.data]); setNewTestimonial(null) }
  }

  const saveCompany = async () => {
    if (!newCompany?.name) return
    const res = await axios.post(`${API}/companies`, newCompany).catch(console.error)
    if (res?.data?.data) { setCompanies(p => [...p, res.data.data]); setNewCompany(null) }
  }

  const saveCommission = async () => {
    if (!commForm.propertyId || !commForm.salePrice) return alert('Completa propiedad y precio')
    try {
      await axios.post(`${API}/commissions`, commForm)
      alert(`✅ Comisión registrada: S/ ${Math.round(parseFloat(commForm.salePrice) * parseFloat(commForm.percentage) / 100).toLocaleString()}`)
      setShowCommForm(false)
      setCommForm({ propertyId: '', salePrice: '', percentage: '3', notes: '' })
      const [comm, props] = await Promise.all([axios.get(`${API}/commissions`), axios.get(`${API}/properties?limit=100`)])
      setCommissions(comm.data.data || [])
      setCommStats(comm.data.stats)
      setProperties(props.data.data || [])
    } catch (e) { alert(e.response?.data?.message || 'Error') }
  }

  const TABS = [
    { id: 'overview',     label: 'Resumen' },
    { id: 'properties',   label: `Propiedades (${properties.length})` },
    { id: 'commissions',  label: `Comisiones (${commissions.length})` },
    { id: 'sellers',      label: `Vendedores (${sellers.length})` },
    { id: 'leads',        label: `Consultas (${leads.length})` },
    { id: 'testimonials', label: `Testimonios (${testimonials.length})` },
    { id: 'companies',    label: `Aliados (${companies.length})` },
  ]

  const WaBtn = ({ phone, name }) => (
    <a href={`https://wa.me/${(phone||'').replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(name)}%2C%20soy%20de%20EE-Stars.`}
      target="_blank" rel="noopener noreferrer"
      className="px-3 py-1.5 rounded-lg bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-900/50">
      💬 WA
    </a>
  )

  return (
    <div className="min-h-screen bg-bark-900">
      <nav className="bg-bark-800 border-b border-terra/20 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-sm">EE</div>
          <span className="font-display text-lg tracking-wide">Panel Admin</span>
          <span className="text-sand-muted text-xs hidden sm:block">EE-Stars</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/properties/new" className="text-xs font-bold px-4 py-2 rounded-lg bg-terra/20 border border-terra/30 text-terra-light hover:bg-terra/30">
            + Nueva propiedad
          </Link>
          <button onClick={logout} className="text-sand-muted text-xs hover:text-sand">Salir</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { n: stats.total, label: 'Total props.', color: 'text-sand' },
              { n: stats.available, label: 'Disponibles', color: 'text-emerald-400' },
              { n: `S/ ${commStats?.totalCommissions?.toLocaleString() || 0}`, label: 'Comisiones total', color: 'text-terra-light' },
              { n: leads.length + sellers.length, label: 'Leads totales', color: 'text-blue-400' },
            ].map((s, i) => (
              <div key={i} className="bg-bark-800 border border-white/5 rounded-2xl px-5 py-4">
                <div className={`font-display text-3xl tracking-wide ${s.color}`}>{s.n}</div>
                <div className="text-[10px] uppercase tracking-wide text-sand-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bark-800 border border-white/5 rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-terra text-white shadow-md shadow-terra/30' : 'text-sand-muted hover:text-sand'
              }`}>{t.label}</button>
          ))}
        </div>

        {loading ? <div className="text-center py-20 text-sand-muted">Cargando...</div> : (
          <>
            {/* ── OVERVIEW con gráfico ── */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gráfico */}
                  <div className="bg-bark-800 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-display text-xl tracking-wide mb-4">Propiedades por estado</h3>
                    <div className="h-48">
                      <canvas ref={chartRef} />
                    </div>
                  </div>

                  {/* Resumen comisiones */}
                  <div className="bg-bark-800 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-display text-xl tracking-wide mb-4">Comisiones generadas</h3>
                    {commStats ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                          <span className="text-sand-muted text-sm">Total comisiones</span>
                          <span className="font-bold text-terra-light">S/ {commStats.totalCommissions?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                          <span className="text-sand-muted text-sm">Total en ventas</span>
                          <span className="font-bold text-sand">S/ {commStats.totalSales?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sand-muted text-sm">Ventas registradas</span>
                          <span className="font-bold text-emerald-400">{commStats.count}</span>
                        </div>
                        <button onClick={() => setTab('commissions')} className="w-full mt-2 py-2 rounded-lg bg-terra/20 border border-terra/30 text-terra-light text-xs font-bold hover:bg-terra/30">
                          Ver todas las comisiones →
                        </button>
                      </div>
                    ) : (
                      <p className="text-sand-muted text-sm text-center py-6">Sin comisiones registradas aún</p>
                    )}
                  </div>
                </div>

                {/* Resumen vendedores y leads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-bark-800 border border-white/5 rounded-2xl p-5">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-display text-xl tracking-wide">Quieren publicar</h3>
                      <button onClick={() => setTab('sellers')} className="text-xs text-terra-light hover:underline">Ver todos</button>
                    </div>
                    {sellers.slice(0,4).length === 0
                      ? <p className="text-sand-muted text-sm text-center py-6">Sin solicitudes aún</p>
                      : sellers.slice(0,4).map(s => (
                        <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                          <div><p className="text-sm font-semibold">{s.name}</p><p className="text-[11px] text-sand-muted">{s.phone}</p></div>
                          <WaBtn phone={s.phone} name={s.name} />
                        </div>
                      ))
                    }
                  </div>
                  <div className="bg-bark-800 border border-white/5 rounded-2xl p-5">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-display text-xl tracking-wide">Últimas consultas</h3>
                      <button onClick={() => setTab('leads')} className="text-xs text-terra-light hover:underline">Ver todas</button>
                    </div>
                    {leads.slice(0,4).length === 0
                      ? <p className="text-sand-muted text-sm text-center py-6">Sin consultas aún</p>
                      : leads.slice(0,4).map(l => (
                        <div key={l.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                          <div><p className="text-sm font-semibold">{l.name}</p><p className="text-[11px] text-sand-muted">{l.phone}</p></div>
                          <WaBtn phone={l.phone} name={l.name} />
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {/* ── PROPIEDADES ── */}
            {tab === 'properties' && (
              <div className="space-y-2">
                {properties.map(p => (
                  <div key={p.id} className="bg-bark-800 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-4 hover:border-terra/20 flex-wrap">
                    {p.images?.[0] && <img src={p.images[0].url} alt={p.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-terra-light font-bold">{p.ref}</p>
                        {p.featured && <span className="text-[9px] bg-yellow-900/30 border border-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">★</span>}
                      </div>
                      <p className="text-sm font-semibold text-sand truncate">{p.title}</p>
                      <p className="text-xs text-sand-muted">{p.district} · S/ {p.price?.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      <select value={p.status} onChange={e => changeStatus(p.id, e.target.value)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-bark-700 border border-white/10 text-sand focus:outline-none">
                        {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <button onClick={() => toggleFeatured(p.id, p.featured)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                          p.featured ? 'bg-yellow-900/30 border-yellow-500/20 text-yellow-400' : 'bg-bark-700 border-white/10 text-sand-muted hover:border-yellow-500/20'
                        }`}>
                        {p.featured ? '★' : '☆'}
                      </button>
                      <Link href={`/admin/properties/${p.id}/edit`} className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 text-sand-muted hover:text-sand">
                        Editar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── COMISIONES ── */}
            {tab === 'commissions' && (
              <div>
                {/* KPIs comisiones */}
                {commStats && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { n: `S/ ${commStats.totalCommissions?.toLocaleString()}`, label: 'Total ganado', color: 'text-terra-light' },
                      { n: `S/ ${commStats.totalSales?.toLocaleString()}`, label: 'En ventas', color: 'text-emerald-400' },
                      { n: commStats.count, label: 'Ventas cerradas', color: 'text-blue-400' },
                    ].map((s, i) => (
                      <div key={i} className="bg-bark-800 border border-white/5 rounded-2xl px-5 py-4">
                        <div className={`font-display text-3xl tracking-wide ${s.color}`}>{s.n}</div>
                        <div className="text-[10px] uppercase tracking-wide text-sand-muted mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <p className="text-sand-muted text-sm">Registra aquí cada venta cerrada para calcular tu comisión automáticamente.</p>
                  <button onClick={() => setShowCommForm(true)}
                    className="text-xs font-bold px-4 py-2 rounded-lg bg-terra/20 border border-terra/30 text-terra-light hover:bg-terra/30">
                    + Registrar venta
                  </button>
                </div>

                {showCommForm && (
                  <div className="bg-bark-800 border border-terra/30 rounded-2xl p-5 mb-5 space-y-4">
                    <h3 className="font-display text-xl text-terra-light">Registrar venta y calcular comisión</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Propiedad *</label>
                        <select value={commForm.propertyId} onChange={e => setCommForm(p => ({...p, propertyId: e.target.value}))}
                          className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60">
                          <option value="">Seleccionar propiedad...</option>
                          {properties.filter(p => p.status !== 'SOLD').map(p => (
                            <option key={p.id} value={p.id}>{p.ref} — {p.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Precio de venta (S/) *</label>
                        <input type="number" value={commForm.salePrice} onChange={e => setCommForm(p => ({...p, salePrice: e.target.value}))}
                          placeholder="85000"
                          className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">% Comisión</label>
                        <input type="number" value={commForm.percentage} onChange={e => setCommForm(p => ({...p, percentage: e.target.value}))}
                          className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Notas</label>
                        <input value={commForm.notes} onChange={e => setCommForm(p => ({...p, notes: e.target.value}))}
                          placeholder="Observaciones..."
                          className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60" />
                      </div>
                    </div>
                    {commForm.salePrice && commForm.percentage && (
                      <div className="bg-terra/10 border border-terra/20 rounded-xl px-4 py-3">
                        <p className="text-sm text-sand-muted">Comisión calculada:</p>
                        <p className="font-display text-2xl text-terra-light">
                          S/ {Math.round(parseFloat(commForm.salePrice || 0) * parseFloat(commForm.percentage || 0) / 100).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => setShowCommForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sand-muted text-sm">Cancelar</button>
                      <button onClick={saveCommission} className="flex-[2] py-2.5 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold text-sm">
                        💰 Registrar venta
                      </button>
                    </div>
                  </div>
                )}

                {commissions.length === 0
                  ? <div className="text-center py-20 text-sand-muted"><div className="text-5xl mb-4">💰</div><p>Sin ventas registradas aún</p><p className="text-xs mt-1">Cuando cierres una venta, regístrala aquí</p></div>
                  : (
                    <div className="space-y-2">
                      {commissions.map(c => (
                        <div key={c.id} className="bg-bark-800 border border-white/5 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap hover:border-terra/20">
                          <div className="flex-1">
                            <p className="text-[10px] text-terra-light font-bold">{c.property?.ref}</p>
                            <p className="text-sm font-semibold text-sand">{c.property?.title}</p>
                            {c.notes && <p className="text-xs text-sand-muted mt-0.5">{c.notes}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-sand-muted">Precio venta</p>
                            <p className="text-sm font-bold text-sand">S/ {c.salePrice?.toLocaleString()}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-sand-muted">Comisión ({c.percentage}%)</p>
                            <p className="font-display text-xl text-terra-light">S/ {c.amount?.toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <p className="text-[10px] text-sand-muted">{new Date(c.createdAt).toLocaleDateString('es-PE')}</p>
                            <button onClick={() => deleteCommission(c.id)} className="text-[10px] text-red-400 hover:text-red-300">Eliminar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            )}

            {/* ── VENDEDORES ── */}
            {tab === 'sellers' && (
              <div className="space-y-3">
                <p className="text-sand-muted text-sm mb-4">Personas que quieren publicar su propiedad.</p>
                {sellers.length === 0
                  ? <div className="text-center py-20 text-sand-muted"><div className="text-5xl mb-4">🏡</div><p>Sin solicitudes aún</p></div>
                  : sellers.map(s => {
                    const msg = s.message || ''
                    const city = msg.match(/Ciudad: ([^|]+)/)?.[1]?.trim()
                    const type = msg.match(/Tipo: ([^|]+)/)?.[1]?.trim()
                    return (
                      <div key={s.id} className="bg-bark-800 border border-white/5 rounded-2xl p-5 hover:border-terra/20 flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-sand">{s.name}</h3>
                            {type && <span className="text-[10px] bg-terra/10 border border-terra/20 text-terra-light px-2 py-0.5 rounded-full">{type}</span>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-sand-muted">
                            <a href={`tel:${s.phone}`} className="hover:text-terra-light">📞 {s.phone}</a>
                            {city && <span>📍 {city}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <WaBtn phone={s.phone} name={s.name} />
                          <Link href="/admin/properties/new" className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-terra/20 border border-terra/30 text-terra-light">+ Publicar</Link>
                          <button onClick={() => deleteLead(s.id)} className="text-[10px] text-red-400">Eliminar</button>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            )}

            {/* ── CONSULTAS ── */}
            {tab === 'leads' && (
              <div className="space-y-3">
                {leads.length === 0
                  ? <div className="text-center py-20 text-sand-muted"><div className="text-5xl mb-4">📭</div><p>Sin consultas aún</p></div>
                  : leads.map(l => (
                    <div key={l.id} className="bg-bark-800 border border-white/5 rounded-2xl p-5 hover:border-terra/20 flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <p className="font-semibold text-sand mb-1">{l.name}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-sand-muted mb-2">
                          <a href={`tel:${l.phone}`} className="hover:text-terra-light">📞 {l.phone}</a>
                          {l.email && <a href={`mailto:${l.email}`} className="hover:text-terra-light">✉️ {l.email}</a>}
                        </div>
                        {l.message && <p className="text-xs text-sand-muted bg-bark-700 rounded-lg px-3 py-2 border border-white/5">{l.message}</p>}
                        {l.property && <p className="text-xs text-terra-light mt-2">🏠 {l.property.title}</p>}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <p className="text-[10px] text-sand-muted">{new Date(l.createdAt).toLocaleDateString('es-PE')}</p>
                        <WaBtn phone={l.phone} name={l.name} />
                        <button onClick={() => deleteLead(l.id)} className="text-[10px] text-red-400">Eliminar</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* ── TESTIMONIOS ── */}
            {tab === 'testimonials' && (
              <div>
                <div className="flex justify-between mb-4">
                  <p className="text-sand-muted text-sm">Aparecen en la página principal.</p>
                  <button onClick={() => setNewTestimonial({ name:'', role:'', city:'', comment:'', rating:5, avatar:'' })}
                    className="text-xs font-bold px-4 py-2 rounded-lg bg-terra/20 border border-terra/30 text-terra-light hover:bg-terra/30">+ Agregar</button>
                </div>
                {newTestimonial && (
                  <div className="bg-bark-800 border border-terra/30 rounded-2xl p-5 mb-4 space-y-3">
                    <h3 className="font-display text-lg text-terra-light">Nuevo testimonio</h3>
                    {[['name','Nombre *'],['role','Cargo / Rol'],['city','Ciudad'],['avatar','URL foto (opcional)']].map(([f,l]) => (
                      <div key={f}>
                        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">{l}</label>
                        <input value={newTestimonial[f]||''} onChange={e => setNewTestimonial(p=>({...p,[f]:e.target.value}))}
                          className="w-full px-3 py-2 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60" />
                      </div>
                    ))}
                    <div>
                      <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Comentario *</label>
                      <textarea rows={3} value={newTestimonial.comment||''} onChange={e => setNewTestimonial(p=>({...p,comment:e.target.value}))}
                        className="w-full px-3 py-2 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand resize-none focus:outline-none focus:border-terra/60" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setNewTestimonial(null)} className="flex-1 py-2 rounded-lg border border-white/10 text-sand-muted text-sm">Cancelar</button>
                      <button onClick={saveTestimonial} className="flex-1 py-2 rounded-lg bg-terra text-white text-sm font-bold">Guardar</button>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {testimonials.length === 0
                    ? <div className="text-center py-16 text-sand-muted">Sin testimonios</div>
                    : testimonials.map(t => (
                      <div key={t.id} className="bg-bark-800 border border-white/5 rounded-2xl p-5 flex items-start justify-between gap-4 hover:border-terra/20">
                        <div className="flex gap-3 flex-1">
                          {t.avatar ? <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            : <div className="w-10 h-10 rounded-full bg-terra/20 flex items-center justify-center text-terra-light font-bold flex-shrink-0">{t.name[0]}</div>}
                          <div>
                            <p className="font-semibold text-sand text-sm">{t.name}</p>
                            <p className="text-[11px] text-sand-muted">{t.role}{t.city ? ` · ${t.city}` : ''}</p>
                            <p className="text-xs text-sand-muted mt-1">"{t.comment}"</p>
                          </div>
                        </div>
                        <button onClick={() => deleteTestimonial(t.id)} className="text-[10px] text-red-400 flex-shrink-0">Eliminar</button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* ── EMPRESAS ── */}
            {tab === 'companies' && (
              <div>
                <div className="flex justify-between mb-4">
                  <p className="text-sand-muted text-sm">Aparecen en "Empresas que confían".</p>
                  <button onClick={() => setNewCompany({ name:'', logo:'', comment:'', type:'' })}
                    className="text-xs font-bold px-4 py-2 rounded-lg bg-terra/20 border border-terra/30 text-terra-light hover:bg-terra/30">+ Agregar</button>
                </div>
                {newCompany && (
                  <div className="bg-bark-800 border border-terra/30 rounded-2xl p-5 mb-4 space-y-3">
                    <h3 className="font-display text-lg text-terra-light">Nueva empresa aliada</h3>
                    {[['name','Nombre *'],['logo','URL logo'],['comment','Descripción'],['type','Tipo']].map(([f,l]) => (
                      <div key={f}>
                        <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">{l}</label>
                        <input value={newCompany[f]||''} onChange={e => setNewCompany(p=>({...p,[f]:e.target.value}))}
                          className="w-full px-3 py-2 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60" />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button onClick={() => setNewCompany(null)} className="flex-1 py-2 rounded-lg border border-white/10 text-sand-muted text-sm">Cancelar</button>
                      <button onClick={saveCompany} className="flex-1 py-2 rounded-lg bg-terra text-white text-sm font-bold">Guardar</button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {companies.length === 0
                    ? <div className="text-center py-16 text-sand-muted col-span-2">Sin empresas aliadas</div>
                    : companies.map(c => (
                      <div key={c.id} className="bg-bark-800 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-terra/20">
                        {c.logo ? <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-full bg-terra/20 flex items-center justify-center text-terra-light font-bold flex-shrink-0">{c.name[0]}</div>}
                        <div className="flex-1">
                          <p className="font-semibold text-sand text-sm">{c.name}</p>
                          {c.comment && <p className="text-[11px] text-sand-muted">{c.comment}</p>}
                        </div>
                        <button onClick={() => deleteCompany(c.id)} className="text-[10px] text-red-400">Eliminar</button>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
