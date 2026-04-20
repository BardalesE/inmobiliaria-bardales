'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import PropertyCard from '@/components/ui/PropertyCard'
import FilterBar from '@/components/ui/FilterBar'
import { getProperties } from '@/lib/api'

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchProperties = async (params = {}) => {
    setLoading(true)
    try {
      const res = await getProperties(params)
      setProperties(res.data)
      setPagination(res.pagination)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProperties() }, [])

  return (
    <div className="min-h-screen bg-bark-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-4xl tracking-wide mb-2">Todos los Lotes</h1>
        <p className="text-sand-muted text-sm mb-6">
          <span className="text-terra-light font-bold">{pagination.total || 0}</span> propiedades disponibles
        </p>
        <FilterBar onFilter={fetchProperties} total={pagination.total} />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-bark-800 rounded-2xl overflow-hidden border border-terra/10">
                <div className="skeleton h-52" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-3 w-24 rounded" />
                  <div className="skeleton h-5 w-3/4 rounded" />
                </div>
              </div>
            ))
          ) : properties.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-sand-muted">
              <div className="text-5xl mb-4">🏚️</div>
              <p className="text-lg font-semibold text-sand">No se encontraron propiedades</p>
            </div>
          ) : (
            properties.map(p => <PropertyCard key={p.id} property={p} />)
          )}
        </div>
      </div>
    </div>
  )
}