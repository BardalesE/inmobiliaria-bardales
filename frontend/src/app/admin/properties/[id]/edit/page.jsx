'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const TIPOS = [
  { value: 'URBAN_LOT', label: 'Lote Urbano' },
  { value: 'RURAL_LOT', label: 'Lote Rural' },
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT', label: 'Departamento' },
  { value: 'COMMERCIAL', label: 'Local Comercial' },
]

const ESTADOS = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'RESERVED', label: 'Separado' },
  { value: 'SOLD', label: 'Vendido' },
]

const FEATURES_SUGERIDAS = [
  'Título saneado','Habilitación urbana','Agua y desagüe',
  'Luz eléctrica','Vía asfaltada','Esquinero','Cerca al mercado',
  'Zona residencial','Garaje','Patio amplio','Cerca a colegio','Riego disponible',
]

export default function EditProperty() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState([{ url: '', alt: '' }])
  const [features, setFeatures] = useState([])
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') !== 'true') {
      router.push('/admin'); return
    }
    axios.get(`${API}/properties/${id}`)
      .then(res => {
        const p = res.data.data
        setForm({
          ref: p.ref || '', title: p.title || '', description: p.description || '',
          price: p.price || '', area: p.area || '',
          frontage: p.frontage || '', depth: p.depth || '',
          sector: p.sector || '', block: p.block || '', lot: p.lot || '',
          address: p.address || '', district: p.district || '',
          province: p.province || '', department: p.department || '',
          latitude: p.latitude || '', longitude: p.longitude || '',
          status: p.status || 'AVAILABLE', type: p.type || 'URBAN_LOT',
        })
        setFeatures(Array.isArray(p.features) ? p.features : [])
        if (p.images?.length > 0) {
          setImages(p.images.map(img => ({ url: img.url, alt: img.alt || '' })))
        }
      })
      .catch(() => router.push('/admin/dashboard'))
      .finally(() => setFetching(false))
  }, [id, router])

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))
  const toggleFeature = (f) => setFeatures(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f])
  const addImage = () => setImages(p => [...p, { url: '', alt: '' }])
  const removeImage = (i) => setImages(p => p.filter((_, idx) => idx !== i))
  const setImg = (i, field, val) => setImages(p => { const n=[...p]; n[i]={...n[i],[field]:val}; return n })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.put(`${API}/properties/${id}`, { ...form, features })
      // Actualizar imágenes si cambiaron
      const validImages = images.filter(img => img.url.trim())
      if (validImages.length > 0) {
        // Eliminar imágenes viejas y crear nuevas
        await axios.put(`${API}/properties/${id}/images`, { images: validImages }).catch(() => {})
      }
      alert('✅ Propiedad actualizada')
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta propiedad? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    try {
      await axios.delete(`${API}/properties/${id}`)
      alert('🗑️ Propiedad eliminada')
      router.push('/admin/dashboard')
    } catch (err) {
      alert('Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  if (fetching) return (
    <div className="min-h-screen bg-bark-900 flex items-center justify-center">
      <div className="text-sand-muted text-sm">Cargando propiedad...</div>
    </div>
  )

  if (!form) return null

  const F = ({ label, name, type='text', placeholder, required }) => (
    <div>
      <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">
        {label}{required && <span className="text-terra-light"> *</span>}
      </label>
      <input type={type} required={required} placeholder={placeholder}
        value={form[name]} onChange={set(name)}
        className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60" />
    </div>
  )

  return (
    <div className="min-h-screen bg-bark-900">
      <nav className="bg-bark-800 border-b border-terra/20 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terra to-terra-light flex items-center justify-center text-white font-display text-sm">EE</div>
          <span className="font-display text-lg tracking-wide">Editar — {form.ref}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleDelete} disabled={deleting}
            className="text-red-400 text-xs hover:text-red-300 transition-colors disabled:opacity-50">
            {deleting ? 'Eliminando...' : '🗑️ Eliminar'}
          </button>
          <Link href="/admin/dashboard" className="text-sand-muted text-sm hover:text-sand">← Panel</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Identificación */}
          <div className="bg-bark-800 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-terra-light">Identificación</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F label="Referencia" name="ref" placeholder="EE-2025-001" required />
              <F label="Título" name="title" placeholder="Casa en Chepén" required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">Descripción</label>
              <textarea rows={3} value={form.description} onChange={set('description')}
                className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">Estado</label>
                <select value={form.status} onChange={set('status')} className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60">
                  {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-sand-muted block mb-1.5">Tipo</label>
                <select value={form.type} onChange={set('type')} className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand focus:outline-none focus:border-terra/60">
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Precio */}
          <div className="bg-bark-800 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-terra-light">Precio y dimensiones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <F label="Precio (S/)" name="price" type="number" placeholder="45000" required />
              <F label="Área (m²)" name="area" type="number" placeholder="200" required />
              <F label="Frente (m)" name="frontage" type="number" placeholder="10" />
              <F label="Fondo (m)" name="depth" type="number" placeholder="20" />
              <F label="Manzana" name="block" placeholder="82" />
              <F label="Lote" name="lot" placeholder="3B" />
            </div>
            <F label="Sector / Urb." name="sector" placeholder="Urb. El Milagro" />
          </div>

          {/* Ubicación */}
          <div className="bg-bark-800 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-terra-light">Ubicación</h2>
            <F label="Dirección" name="address" placeholder="Jr. Independencia 345" required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <F label="Distrito" name="district" placeholder="Chepén" required />
              <F label="Provincia" name="province" placeholder="Chepén" required />
              <F label="Departamento" name="department" placeholder="La Libertad" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <F label="Latitud" name="latitude" type="number" placeholder="-7.2281" />
              <F label="Longitud" name="longitude" type="number" placeholder="-79.4328" />
            </div>
          </div>

          {/* Características */}
          <div className="bg-bark-800 border border-white/5 rounded-2xl p-6">
            <h2 className="font-display text-xl tracking-wide text-terra-light mb-4">Características</h2>
            <div className="flex flex-wrap gap-2">
              {FEATURES_SUGERIDAS.map(f => (
                <button key={f} type="button" onClick={() => toggleFeature(f)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    features.includes(f) ? 'bg-terra/20 border-terra text-terra-light' : 'bg-bark-700 border-white/10 text-sand-muted hover:border-terra/30'
                  }`}>
                  {features.includes(f) ? '✓ ' : '+ '}{f}
                </button>
              ))}
            </div>
            {features.length > 0 && <p className="text-xs text-emerald-400 mt-3">✓ {features.length} seleccionadas</p>}
          </div>

          {/* Fotos */}
          <div className="bg-bark-800 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl tracking-wide text-terra-light">Fotos</h2>
              <button type="button" onClick={addImage}
                className="px-3 py-2 rounded-lg bg-terra/20 border border-terra/30 text-terra-light text-xs font-bold hover:bg-terra/30">
                + Agregar
              </button>
            </div>
            <div className="space-y-3">
              {images.map((img, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input placeholder={`URL foto ${i+1}`} value={img.url}
                      onChange={e => setImg(i, 'url', e.target.value)}
                      className="w-full px-3 py-2.5 bg-bark-700 border border-white/10 rounded-lg text-sm text-sand placeholder-sand-muted/40 focus:outline-none focus:border-terra/60" />
                    {img.url && (
                      <img src={img.url} alt="preview" className="mt-2 h-24 w-full rounded-lg object-cover border border-white/10"
                        onError={e => { e.target.style.display='none' }} />
                    )}
                  </div>
                  {images.length > 1 && (
                    <button type="button" onClick={() => removeImage(i)}
                      className="w-9 h-9 rounded-lg bg-red-900/30 border border-red-500/20 text-red-400 hover:bg-red-900/50 flex items-center justify-center text-lg">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">⚠️ {error}</div>}

          <div className="flex gap-3 pb-8">
            <Link href="/admin/dashboard" className="flex-1 py-3 rounded-xl border border-white/10 text-sand-muted text-sm font-semibold text-center hover:border-white/20">
              Cancelar
            </Link>
            <button type="submit" disabled={loading}
              className="flex-[2] py-3 rounded-xl bg-gradient-to-br from-terra to-terra-light text-white font-bold text-sm shadow-lg shadow-terra/30 disabled:opacity-50">
              {loading ? 'Guardando...' : '💾 Guardar cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
