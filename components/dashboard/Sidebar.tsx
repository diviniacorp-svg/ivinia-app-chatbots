'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Users, Kanban,
  UserCheck,
  CreditCard, Send, ExternalLink, Bot, CalendarCheck, Settings2, Cpu, X,
  Clapperboard, Instagram
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: UserCheck },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/crm', label: 'CRM', icon: Kanban },
  { href: '/outreach', label: 'Outreach', icon: Send },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
]

const productItems = [
  { href: '/chatbots', label: 'Chatbots', icon: Bot, color: 'bg-indigo-600' },
  { href: '/turnos', label: 'Sistema de Turnos', icon: CalendarCheck, color: 'bg-purple-600' },
]

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  // Cierra sidebar en mobile al navegar
  useEffect(() => {
    onClose?.()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <aside className="w-64 lg:w-56 bg-gray-900 flex flex-col h-full flex-shrink-0">
      {/* Logo + botón cerrar (solo mobile) */}
      <div className="px-4 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">DIVINIA</p>
            <p className="text-gray-500 text-xs">Panel Interno</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          )
        })}

        {/* Productos */}
        <div className="pt-3 pb-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3">Productos</p>
        </div>
        {productItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? `${item.color} text-white`
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          )
        })}

        {/* Sub-item: Nuevo cliente de turnos */}
        <Link
          href="/turnos/config/nuevo"
          className={cn(
            'flex items-center gap-3 pl-8 pr-3 py-2 rounded-lg text-xs font-medium transition-all',
            pathname.startsWith('/turnos/config')
              ? 'bg-purple-700 text-white'
              : 'text-gray-500 hover:text-white hover:bg-gray-800'
          )}
        >
          <Settings2 size={14} />
          Nuevo cliente
        </Link>

        {/* Contenido & Redes */}
        <div className="pt-3 pb-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3">Marketing</p>
        </div>
        <Link
          href="/contenido"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            pathname === '/contenido' || pathname.startsWith('/contenido/')
              ? 'bg-amber-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          )}
        >
          <Clapperboard size={17} />
          Fábrica de Contenidos
        </Link>
        <Link
          href="/redes"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            pathname === '/redes' || pathname.startsWith('/redes/')
              ? 'bg-pink-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          )}
        >
          <Instagram size={17} />
          Redes Sociales
        </Link>

        {/* Agentes IA */}
        <div className="pt-3 pb-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3">Agentes IA</p>
        </div>
        <Link
          href="/agents"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            pathname === '/agents' || pathname.startsWith('/agents/')
              ? 'bg-violet-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          )}
        >
          <Cpu size={17} />
          Oficina de Agentes
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all"
        >
          <ExternalLink size={15} />
          Ver landing
        </Link>
      </div>
    </aside>
  )
}
