'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMe } from './api'

export function useAdminAuth() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe()
      .then((data) => setUser(data.user))
      .catch(() => router.push('/admin'))
      .finally(() => setLoading(false))
  }, [router])

  return { user, loading }
}
