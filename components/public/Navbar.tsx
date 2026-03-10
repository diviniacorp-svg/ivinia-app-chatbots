'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [secretClicks, setSecretClicks] = useState(0)
  const router = useRouter()

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const next = secretClicks + 1
    if (next >= 5) {
      setSecretClicks(0)
      router.push('/login')
    } else {
      setSecretClicks(next)
      // Reset si no completa en 3 segundos
      setTimeout(() => setSecretClicks(0), 3000)
    }
  }, [secretClicks, router])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button onClick={handleLogoClick} className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-lg text-gray-900">DIVINIA</span>
          </button>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#rubros" className="hover:text-indigo-600 transition-colors">Rubros</a>
            <a href="#como-funciona" className="hover:text-indigo-600 transition-colors">Cómo funciona</a>
            <a href="#precios" className="hover:text-indigo-600 transition-colors">Precios</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="https://wa.me/5492665286110" target="_blank" rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              WhatsApp
            </a>
            <Link href="/trial"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Probá 14 días gratis
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-4 text-sm">
            <a href="#rubros" onClick={() => setOpen(false)} className="text-gray-700 font-medium">Rubros</a>
            <a href="#como-funciona" onClick={() => setOpen(false)} className="text-gray-700 font-medium">Cómo funciona</a>
            <a href="#precios" onClick={() => setOpen(false)} className="text-gray-700 font-medium">Precios</a>
            <a href="#faq" onClick={() => setOpen(false)} className="text-gray-700 font-medium">FAQ</a>
            <Link href="/trial" className="bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg text-center">
              Probá 14 días gratis
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
