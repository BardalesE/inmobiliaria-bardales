'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { getPropertyById } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function EditProperty() {
  const router = useRouter()
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin')
      return
    }
    getPropertyById(id).then(res => {
      const p = res.data
      setForm({
        ref: p.ref || '',
        title: p.title || '',
        description: p.description || '',
        price: p.price || '',
        area: p.area || '',
        frontage: p.frontage || '',
        depth: p.depth || '',
        sector: p.sector || '',
        block: p.block || '',
        lot: p.lot || '',
        address: p.address || '',
        district: p.district || '',
        province: p.province || '',
        department: p.department || '',
        latitude: p.latitude || '',
        longitude: p.longitude || '',
        status: p.status || 'AVAILABLE',
        type: p.type || 'URBAN_LOT',
        features: p.features?.join(', ') || '',
        imageUrl: p.images?.[0]?.url || ''
      })
    }).catch(() => router.push('/admin/dashboard'))
    .finally(() => setFetching(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        area: parseFloat(form.area),
        frontage: form.frontage ? parseFloat(form.frontage) : null,
        depth: form.depth ? parseFloat(form.depth) : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
      }
      await axios.put(`${API}/properties/${id}`, payload)
      alert('✅ Lote actualizado!')
      router.push('/admin/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div>
      <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">{label} {required && '*'}</label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={form[name]}
        onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
        className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/50 focus:outline-none focus:border-terra/60"
      />
    </div>
  )

  if (fetching) return (
    <div className="min-h-screen bg-bark-900 flex items-center justify-center">
      <p className="text-sand-muted">Cargando...</p>
    </div>
  )

  if (!form) return null

  return (
    <div className="min-h-screen bg-bark-900">
      <nav className="bg-bark-800 border-b border-terra/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-sm">IB</div>
          <span className="font-display text-lg tracking-wide">Editar Lote</span>
        </div>
        <Link href="/admin/dashboard" className="text-sand-muted text-sm hover:text-sand">← Volver</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-bark-800 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-terra-light">Información básica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Referencia" name="ref" placeholder="IB-2025-081-6C" required />
              <Field label="Título" name="title" placeholder="Lote 6C — Manzana 81" required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Descripción</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60 resize-none"
              />
            </div>
          </div>

          <div className="bg-bark-800 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-terra-light">Dimensiones y precio</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Precio (S/)" name="price" type="number" placeholder="30000" required />
              <Field label="Área (m²)" name="area" type="number" placeholder="180" required />
              <Field label="Frente (m)" name="frontage" type="number" placeholder="10" />
              <Field label="Fondo (m)" name="depth" type="number" placeholder="18" />
              <Field label="Manzana" name="block" placeholder="81" />
              <Field label="Lote" name="lot" placeholder="6C" />
            </div>
            <Field label="Sector" name="sector" placeholder="Sector I" />
          </div>

          <div className="bg-bark-800 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-terra-light">Ubicación</h2>
            <Field label="Dirección" name="address" placeholder="Mz. 81, Lote 6C, Sector I" required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Distrito" name="district" placeholder="Trujillo" required />
              <Field label="Provincia" name="province" placeholder="Trujillo" required />
              <Field label="Departamento" name="department" placeholder="La Libertad" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitud" name="latitude" type="number" placeholder="-7.972028" />
              <Field label="Longitud" name="longitude" type="number" placeholder="-79.046415" />
            </div>
          </div>

          <div className="bg-bark-800 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-terra-light">Estado e imagen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Estado</label>
                <select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60"
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="RESERVED">Separado</option>
                  <option value="SOLD">Vendido</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60"
                >
                  <option value="URBAN_LOT">Lote Urbano</option>
                  <option value="RURAL_LOT">Lote Rural</option>
                  <option value="HOUSE">Casa</option>
                  <option value="APARTMENT">Departamento</option>
                </select>
              </div>
            </div>
            <Field label="URL de imagen" name="imageUrl" placeholder="https://images.unsplash.com/..." />
            <div>
              <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1">Características (separadas por coma)</label>
              <input
                type="text"
                value={form.features}
                onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
                placeholder="Luz eléctrica, Agua y desagüe, Vía asfaltada"
                className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/50 focus:outline-none focus:border-terra/60"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}

          <div className="flex gap-3">
            <Link href="/admin/dashboard" className="flex-1 py-3 rounded-xl bg-bark-800 border border-white/10 text-sand text-sm font-semibold text-center hover:bg-bark-700 transition-colors">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold text-sm shadow-lg shadow-terra/30 disabled:opacity-60"
            >
              {loading ? 'Guardando...' : '💾 Actualizar Lote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}