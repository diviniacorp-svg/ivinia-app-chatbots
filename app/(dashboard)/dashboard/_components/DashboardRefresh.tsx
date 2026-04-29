'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const REFRESH_MS = 30_000

export default function DashboardRefresh() {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_MS)
    return () => clearInterval(id)
  }, [router])
  return null
}
