'use client'

import { motion } from 'framer-motion'

interface AgentDeskProps {
  name: string
  role: string
  emoji: string
  color: string
  isActive: boolean
  lastRun?: string
}

export default function AgentDesk({ name, role, emoji, color, isActive, lastRun }: AgentDeskProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Agent character */}
      <div className="relative">
        {/* Activity glow */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color, opacity: 0.2 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {/* Avatar */}
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg relative z-10"
          style={{ backgroundColor: color + '20', border: `2px solid ${color}40` }}
          animate={isActive ? { y: [0, -4, 0] } : { y: 0 }}
          transition={isActive ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          {emoji}
        </motion.div>

        {/* Status dot */}
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-gray-900 z-20"
          style={{ backgroundColor: isActive ? '#22c55e' : '#6b7280' }}
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={isActive ? { duration: 0.8, repeat: Infinity } : {}}
        />
      </div>

      {/* Desk */}
      <motion.div
        className="w-28 rounded-xl p-3 text-center"
        style={{ backgroundColor: color + '15', border: `1px solid ${color}30` }}
        animate={isActive ? { borderColor: [color + '30', color + '80', color + '30'] } : {}}
        transition={isActive ? { duration: 2, repeat: Infinity } : {}}
      >
        {/* Monitor screen */}
        <motion.div
          className="w-full h-8 rounded-md mb-2 flex items-center justify-center"
          style={{ backgroundColor: isActive ? color + '30' : '#1f2937' }}
          animate={isActive ? { opacity: [0.8, 1, 0.8] } : {}}
          transition={isActive ? { duration: 0.8, repeat: Infinity } : {}}
        >
          {isActive ? (
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{ scaleY: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          ) : (
            <div className="w-8 h-1.5 bg-gray-600 rounded" />
          )}
        </motion.div>

        <p className="text-white text-xs font-bold truncate">{name}</p>
        <p className="text-gray-400 text-xs truncate">{role}</p>
        {lastRun && (
          <p className="text-gray-600 text-xs mt-1 truncate">
            {new Date(lastRun).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </motion.div>
    </div>
  )
}
