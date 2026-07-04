'use client'
import { useAdminAuth } from '@/lib/useAdminAuth'
import PropertyFormWizard from '@/components/admin/PropertyFormWizard'

export default function NewProperty() {
  const { loading } = useAdminAuth()

  if (loading) return (
    <div className="min-h-screen bg-bark-900 flex items-center justify-center">
      <div className="text-sand-muted text-sm">Cargando...</div>
    </div>
  )

  return <PropertyFormWizard mode="create" />
}
