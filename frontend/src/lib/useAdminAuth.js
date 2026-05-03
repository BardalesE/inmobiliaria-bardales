'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('admin_auth') !== 'true') {
        router.push('/admin')
      } else {
        setReady(true)
      }
    }
  }, [router])

  return ready
}
