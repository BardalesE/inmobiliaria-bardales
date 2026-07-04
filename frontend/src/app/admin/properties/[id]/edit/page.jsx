'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { useAdminAuth } from '@/lib/useAdminAuth'
import PropertyFormWizard from '@/components/admin/PropertyFormWizard'

export default function EditProperty() {
  const router  = useRouter()
  const { id }  = useParams()
  const { loading: authLoading } = useAdminAuth()
  const [data, setData]     = useState(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (authLoading) return
    api.get(`/properties/${id}`)
      .then(res => {
        const p = res.data.data
        setData({
          ref: p.ref || '', title: p.title || '', description: p.description || '',
          price: p.price ?? undefined, area: p.area ?? undefined,
          frontage: p.frontage ?? null, depth: p.depth ?? null,
          sector: p.sector || '', block: p.block || '', lot: p.lot || '',
          address: p.address || '', district: p.district || '',
          province: p.province || '', department: p.department || '',
          latitude: p.latitude ?? null, longitude: p.longitude ?? null,
          status: p.status || 'AVAILABLE', type: p.type || 'URBAN_LOT',
          operation: p.operation || 'SALE',
          features: Array.isArray(p.features) ? p.features : [],
          images: p.images?.map(img => ({ url: img.url, alt: img.alt || '' })) || [],
          rooms: p.rooms ?? null, bathrooms: p.bathrooms ?? null,
          floors: p.floors ?? null, yearBuilt: p.yearBuilt ?? null,
          parking: p.parking ?? false,
          videoUrl: p.videoUrl || '', documentUrl: p.documentUrl || '',
          featured: p.featured ?? false, notes: p.notes || '',
        })
      })
      .catch(() => router.push('/admin/dashboard'))
      .finally(() => setFetching(false))
  }, [id, authLoading])

  if (authLoading || fetching) return (
    <div className="min-h-screen bg-bark-900 flex items-center justify-center">
      <div className="text-sand-muted text-sm">Cargando propiedad...</div>
    </div>
  )

  if (!data) return null

  return <PropertyFormWizard mode="edit" initialData={data} propertyId={id} />
}
