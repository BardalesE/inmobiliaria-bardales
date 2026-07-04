'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/useAdminAuth'

export default function AdminProperties() {
  const { user, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.replace('/admin/dashboard')
  }, [loading, user, router])

  return (
    <div className="min-h-screen bg-bark-900 flex items-center justify-center">
      <p className="text-sand-muted text-sm">Cargando...</p>
    </div>
  )
}
