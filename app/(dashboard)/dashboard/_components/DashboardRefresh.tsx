'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const THREE_HOURS = 3 * 60 * 60 * 1000

export default function DashboardRefresh() {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), THREE_HOURS)
    return () => clearInterval(id)
  }, [router])
  return null
}
