'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { DEPARTMENTS, NUCLEUS_AGENTS, DepartmentId } from '@/lib/nucleus/index'

// ─── Tile / canvas constants ────────────────────────────────────────────────
const T = 32   // tile size px
const P = 2    // game-pixel size (2 CSS px = 1 game px)
const MAP_W = 50
const MAP_H = 54

type Status = 'idle' | 'working' | 'done'
type RoomId = DepartmentId | 'corridor' | 'meeting' | 'kitchen'

interface RoomDef {
  id: RoomId
  tx: number; ty: number; tw: number; th: number
}

// ─── Building floor plan (all in tile units) ────────────────────────────────
const ROOMS: RoomDef[] = [
  // Cerebro — command center, full width
  { id: 'cerebro',              tx: 1,  ty: 1,  tw: 48, th: 8  },
  // Horizontal corridor below Cerebro
  { id: 'corridor',             tx: 1,  ty: 9,  tw: 48, th: 2  },
  // ── Row 1 departments (y=11..22) ──
  { id: 'ventas_crm',           tx: 1,  ty: 11, tw: 11, th: 11 },
  { id: 'developers',           tx: 13, ty: 11, tw: 11, th: 11 },
  { id: 'content_factory',      tx: 25, ty: 11, tw: 11, th: 11 },
  { id: 'publicidad',           tx: 37, ty: 11, tw: 11, th: 11 },
  // Right corridor (vertical)
  { id: 'corridor',             tx: 49, ty: 11, tw: 0,  th: 32 }, // wall only
  // Horizontal corridor between row 1 and 2
  { id: 'corridor',             tx: 1,  ty: 22, tw: 47, th: 2  },
  // ── Row 2 departments (y=24..35) ──
  { id: 'finanzas',             tx: 1,  ty: 24, tw: 11, th: 11 },
  { id: 'legal_seguridad',      tx: 13, ty: 24, tw: 11, th: 11 },
  { id: 'customer_success',     tx: 25, ty: 24, tw: 11, th: 11 },
  { id: 'inteligencia',         tx: 37, ty: 24, tw: 11, th: 11 },
  // Horizontal corridor between row 2 and 3
  { id: 'corridor',             tx: 1,  ty: 35, tw: 47, th: 2  },
  // ── Row 3 departments (y=37..48) ──
  { id: 'canales_monetizacion', tx: 1,  ty: 37, tw: 11, th: 11 },
  { id: 'gestiones',            tx: 13, ty: 37, tw: 11, th: 11 },
  { id: 'rrhh_digital',         tx: 25, ty: 37, tw: 11, th: 11 },
  // Meeting room (right side, spans rows 22-48)
  { id: 'meeting',              tx: 37, ty: 37, tw: 12, th: 11 },
  // Kitchen (bottom right strip)
  { id: 'kitchen',              tx: 37, ty: 22, tw: 12, th: 15 },
]

// ─── Floor + wall colors per room ──────────────────────────────────────────
function floorColor(id: RoomId): string {
  if (id === 'corridor') return '#2a2318'
  if (id === 'meeting')  return '#1a1a2a'
  if (id === 'kitchen')  return '#1a2418'
  const dept = DEPARTMENTS[id as DepartmentId]
  if (!dept) return '#1a1a1a'
  const { r, g, b } = hex2rgb(dept.color)
  return `rgb(${Math.round(r * 0.12)},${Math.round(g * 0.12)},${Math.round(b * 0.12)})`
}
function wallColor(id: RoomId): string {
  if (id === 'corridor') return '#3a3228'
  if (id === 'meeting')  return '#3a3a5a'
  if (id === 'kitchen')  return '#2a3a2a'
  return DEPARTMENTS[id as DepartmentId]?.color ?? '#555'
}

function hex2rgb(hex: string) {
  return {
    r: parseInt(hex.slice(1,3),16),
    g: parseInt(hex.slice(3,5),16),
    b: parseInt(hex.slice(5,7),16),
  }
}
function rgba(hex: string, a: number) {
  const {r,g,b} = hex2rgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

// ─── Agent type ─────────────────────────────────────────────────────────────
interface AgentSprite {
  id: string
  name: string
  deptId: DepartmentId
  color: string
  x: number; y: number       // pixel position on canvas
  tx: number; ty: number     // target pixel position
  animFrame: number
  speed: number
  wanderTimer: number
}

// ─── Canvas drawing helpers ─────────────────────────────────────────────────

function drawFloor(ctx: CanvasRenderingContext2D, room: RoomDef) {
  const { tx, ty, tw, th } = room
  const fc = floorColor(room.id)
  const wc = wallColor(room.id)

  // Floor fill
  ctx.fillStyle = fc
  ctx.fillRect(tx*T, ty*T, tw*T, th*T)

  // Tile grid pattern (subtle)
  ctx.strokeStyle = rgba(wc, 0.15)
  ctx.lineWidth = 0.5
  for (let x = tx; x < tx+tw; x++) {
    ctx.beginPath(); ctx.moveTo(x*T, ty*T); ctx.lineTo(x*T, (ty+th)*T); ctx.stroke()
  }
  for (let y = ty; y < ty+th; y++) {
    ctx.beginPath(); ctx.moveTo(tx*T, y*T); ctx.lineTo((tx+tw)*T, y*T); ctx.stroke()
  }

  // Wall border
  ctx.strokeStyle = wc
  ctx.lineWidth = 2.5
  ctx.strokeRect(tx*T + 1, ty*T + 1, tw*T - 2, th*T - 2)
}

function drawDoor(ctx: CanvasRenderingContext2D, px: number, py: number, horiz: boolean) {
  ctx.fillStyle = '#2a2318'
  if (horiz) ctx.fillRect(px - 16, py - 1, 32, 3)
  else       ctx.fillRect(px - 1, py - 16, 3, 32)
}

function drawDesk(ctx: CanvasRenderingContext2D, px: number, py: number, color: string) {
  // desk surface
  ctx.fillStyle = '#5C4033'
  ctx.fillRect(px, py, 28, 18)
  // desk top edge
  ctx.fillStyle = '#7B5544'
  ctx.fillRect(px, py, 28, 4)
  // monitor base
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(px + 6, py - 12, 16, 10)
  // monitor screen
  ctx.fillStyle = rgba(color, 0.4)
  ctx.fillRect(px + 8, py - 10, 12, 7)
  // screen glow line
  ctx.fillStyle = color
  ctx.fillRect(px + 9, py - 7, 8, 1)
  // chair
  ctx.fillStyle = '#333'
  ctx.fillRect(px + 5, py + 18, 18, 12)
  ctx.fillStyle = '#444'
  ctx.fillRect(px + 7, py + 16, 14, 4)
}

function drawShelf(ctx: CanvasRenderingContext2D, px: number, py: number) {
  const bookColors = ['#c0392b','#2980b9','#f39c12','#27ae60','#8e44ad','#e67e22']
  ctx.fillStyle = '#4a3728'
  ctx.fillRect(px, py, 6, 36)
  ctx.fillStyle = '#5C4033'
  ctx.fillRect(px, py, 6, 4)
  ctx.fillRect(px, py+16, 6, 4)
  ctx.fillRect(px, py+32, 6, 4)
  bookColors.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.fillRect(px + 1, py + 5 + i * 5, 4, 4)
  })
}

function drawPlant(ctx: CanvasRenderingContext2D, px: number, py: number) {
  // pot
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(px + 3, py + 14, 10, 8)
  ctx.fillStyle = '#A0522D'
  ctx.fillRect(px + 2, py + 12, 12, 4)
  // leaves
  ctx.fillStyle = '#2d5a1b'
  ctx.fillRect(px + 5, py + 4, 6, 10)
  ctx.fillStyle = '#3a7a24'
  ctx.fillRect(px + 1, py + 2, 5, 8)
  ctx.fillRect(px + 10, py + 2, 5, 8)
  ctx.fillStyle = '#4a9a2e'
  ctx.fillRect(px + 3, py, 10, 6)
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  px: number, py: number,
  color: string, frame: number, facing: 'left' | 'right'
) {
  const legAnim = Math.sin(frame * 0.2) * 3
  const flip = facing === 'left'

  ctx.save()
  if (flip) {
    ctx.translate(px + 10, py)
    ctx.scale(-1, 1)
    ctx.translate(-10, 0)
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(px + 9, py + 34, 9, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Back leg
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(px + 9, py + 22, 4, 10 - legAnim)

  // Body / shirt (dept color)
  ctx.fillStyle = color
  ctx.fillRect(px + 4, py + 12, 12, 12)
  // shirt collar
  ctx.fillStyle = rgba(color, 0.6)
  ctx.fillRect(px + 7, py + 12, 6, 3)

  // Front leg
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(px + 5, py + 22, 4, 10 + legAnim)

  // Shoes
  ctx.fillStyle = '#111'
  ctx.fillRect(px + 4, py + 30, 6, 4)
  ctx.fillRect(px + 9, py + 30 + (legAnim > 0 ? -1 : 0), 6, 4)

  // Neck
  ctx.fillStyle = '#E8B89A'
  ctx.fillRect(px + 7, py + 9, 6, 4)

  // Head
  ctx.fillStyle = '#F4C5A0'
  ctx.fillRect(px + 4, py + 1, 12, 10)

  // Hair
  ctx.fillStyle = color
  ctx.fillRect(px + 4, py + 1, 12, 4)
  // hair side
  ctx.fillRect(px + 4, py + 4, 2, 3)
  ctx.fillRect(px + 14, py + 4, 2, 3)

  // Eyes
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(px + 6, py + 6, 2, 2)
  ctx.fillRect(px + 11, py + 6, 2, 2)

  // Ear
  ctx.fillStyle = '#E8B89A'
  ctx.fillRect(px + 3, py + 5, 2, 3)
  ctx.fillRect(px + 15, py + 5, 2, 3)

  ctx.restore()
}

function drawRoomLabel(ctx: CanvasRenderingContext2D, room: RoomDef, status: Status) {
  const id = room.id as DepartmentId
  const dept = DEPARTMENTS[id]
  if (!dept) return

  const cx = (room.tx + room.tw / 2) * T
  const ty = (room.ty + 0.35) * T

  ctx.font = `bold ${P * 4}px JetBrains Mono, monospace`
  ctx.textAlign = 'center'

  // Status dot
  const dotColor = status === 'working' ? dept.color : status === 'done' ? '#10b981' : 'rgba(255,255,255,0.2)'
  ctx.fillStyle = dotColor
  ctx.beginPath()
  ctx.arc(cx - 30, ty, 4, 0, Math.PI * 2)
  ctx.fill()

  // Label
  ctx.fillStyle = rgba(dept.color, 0.85)
  ctx.fillText(`${dept.emoji} ${dept.nombre.toUpperCase()}`, cx, ty + 5)
}

function drawCerebroLabel(ctx: CanvasRenderingContext2D, room: RoomDef, status: Status) {
  const cx = (room.tx + room.tw / 2) * T
  const ty = (room.ty + 0.4) * T

  ctx.font = `bold ${P * 5}px JetBrains Mono, monospace`
  ctx.textAlign = 'center'
  ctx.fillStyle = rgba('#8B5CF6', 0.9)
  ctx.fillText('🧠 CEREBRO — COMMAND CENTER', cx, ty + 6)

  if (status === 'working') {
    ctx.font = `${P * 3}px JetBrains Mono, monospace`
    ctx.fillStyle = rgba('#8B5CF6', 0.5)
    ctx.fillText('PROCESSING...', cx, ty + 22)
  }
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function FabricaPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const agentsRef = useRef<AgentSprite[]>([])

  const [zoom, setZoom] = useState(0.65)
  const [selected, setSelected] = useState<DepartmentId | null>(null)
  const [statuses, setStatuses] = useState<Record<DepartmentId, Status>>(
    () => Object.fromEntries(Object.keys(DEPARTMENTS).map(id => [id, 'idle' as Status])) as Record<DepartmentId, Status>
  )
  const [runsToday, setRunsToday] = useState(0)
  const [ticker, setTicker] = useState<string[]>([])
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Init agents ────────────────────────────────────────────────────────────
  useEffect(() => {
    const agents: AgentSprite[] = []
    ROOMS.forEach(room => {
      const id = room.id as DepartmentId
      if (!DEPARTMENTS[id]) return
      const dept = DEPARTMENTS[id]
      const deptAgents = NUCLEUS_AGENTS.filter(a => a.depto === id).slice(0, 5)
      deptAgents.forEach((agent, i) => {
        const baseX = (room.tx + 1) * T + (i % 3) * 85 + 20
        const baseY = (room.ty + 2) * T + Math.floor(i / 3) * 85 + 40
        agents.push({
          id: agent.id, name: agent.nombre,
          deptId: id, color: dept.color,
          x: baseX, y: baseY, tx: baseX, ty: baseY,
          animFrame: Math.random() * 100,
          speed: 0.6 + Math.random() * 0.4,
          wanderTimer: Math.random() * 120,
        })
      })
    })
    agentsRef.current = agents
  }, [])

  // ── Simulation loop ────────────────────────────────────────────────────────
  const scheduleNext = useCallback(() => {
    const delay = 2000 + Math.random() * 3000
    simTimerRef.current = setTimeout(() => {
      const deptIds = Object.keys(DEPARTMENTS) as DepartmentId[]
      const id = deptIds[Math.floor(Math.random() * deptIds.length)]
      const deptAgents = NUCLEUS_AGENTS.filter(a => a.depto === id)
      const agent = deptAgents[Math.floor(Math.random() * deptAgents.length)]

      setStatuses(prev => ({ ...prev, [id]: 'working' }))
      setTicker(prev => [`${DEPARTMENTS[id].emoji} ${agent?.nombre ?? 'Agente'} (${DEPARTMENTS[id].nombre})`, ...prev].slice(0, 12))

      setTimeout(() => {
        setStatuses(prev => ({ ...prev, [id]: 'done' }))
        setRunsToday(r => r + 1)
        setTimeout(() => {
          setStatuses(prev => ({ ...prev, [id]: 'idle' }))
          scheduleNext()
        }, 2500)
      }, 1800 + Math.random() * 2200)
    }, delay)
  }, [])

  useEffect(() => {
    scheduleNext()
    return () => { if (simTimerRef.current) clearTimeout(simTimerRef.current) }
  }, [scheduleNext])

  // ── Canvas render loop ────────────────────────────────────────────────────
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    // Background
    ctx.fillStyle = '#070707'
    ctx.fillRect(0, 0, MAP_W * T, MAP_H * T)

    // Draw outer building shadow
    ctx.fillStyle = '#0d0d0d'
    ctx.fillRect(T, T, 48*T, 50*T)

    // Draw rooms (floors + walls)
    ROOMS.forEach(room => {
      if (room.id === 'corridor' && room.tw === 0) return // vertical wall marker
      drawFloor(ctx, room)
    })

    // Draw door openings (where rooms connect to corridors)
    // Doors between Cerebro and corridor below
    drawDoor(ctx, 6*T, 9*T, true)
    drawDoor(ctx, 18*T, 9*T, true)
    drawDoor(ctx, 30*T, 9*T, true)
    drawDoor(ctx, 42*T, 9*T, true)
    // Doors between row 1 and corridor
    drawDoor(ctx, 6*T, 22*T, true)
    drawDoor(ctx, 18*T, 22*T, true)
    drawDoor(ctx, 30*T, 22*T, true)
    drawDoor(ctx, 42*T, 22*T, true)
    // Doors between row 2 and corridor
    drawDoor(ctx, 6*T, 35*T, true)
    drawDoor(ctx, 18*T, 35*T, true)
    drawDoor(ctx, 30*T, 35*T, true)
    drawDoor(ctx, 42*T, 35*T, true)

    // Draw furniture per room
    ROOMS.forEach(room => {
      const id = room.id as DepartmentId
      const dept = DEPARTMENTS[id]
      if (!dept) return

      const color = dept.color
      const rx = room.tx * T
      const ry = room.ty * T

      // Bookshelves on left wall
      drawShelf(ctx, rx + 4, ry + T * 2)
      drawShelf(ctx, rx + 4, ry + T * 4.5)

      // 2-3 desks per room
      const deskY = room.id === 'cerebro' ? ry + T * 3 : ry + T * 4
      drawDesk(ctx, rx + T * 1.5, deskY, color)
      drawDesk(ctx, rx + T * 4, deskY, color)
      if (room.tw > 8) drawDesk(ctx, rx + T * 6.5, deskY, color)

      // Plants in corners
      drawPlant(ctx, rx + room.tw * T - 28, ry + room.th * T - 36)
      if (room.tw > 10) drawPlant(ctx, rx + room.tw * T - 28, ry + T * 2)
    })

    // Update and draw agents
    const agents = agentsRef.current
    agents.forEach(agent => {
      // Update position toward target
      const dx = agent.tx - agent.x
      const dy = agent.ty - agent.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 2) {
        agent.x += (dx / dist) * agent.speed * 1.5
        agent.y += (dy / dist) * agent.speed * 1.5
        agent.animFrame++
      }

      // Wander: pick new target within room
      agent.wanderTimer--
      if (agent.wanderTimer <= 0 || dist < 2) {
        const room = ROOMS.find(r => r.id === agent.deptId)
        if (room) {
          agent.tx = (room.tx + 1.5 + Math.random() * (room.tw - 3)) * T
          agent.ty = (room.ty + 3.5 + Math.random() * (room.th - 5)) * T
        }
        agent.wanderTimer = 60 + Math.random() * 180
      }

      const status = statuses[agent.deptId]
      const facing = agent.tx < agent.x ? 'left' : 'right'
      drawCharacter(ctx, agent.x - 9, agent.y - 17, agent.color, agent.animFrame, facing)

      // Name tag when working
      if (status === 'working') {
        ctx.font = `${P * 3}px JetBrains Mono, monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(agent.x - 28, agent.y - 30, 56, 12)
        ctx.fillStyle = agent.color
        ctx.fillText(agent.name.slice(0, 12), agent.x, agent.y - 20)
      }
    })

    // Draw room labels (on top of everything)
    ROOMS.forEach(room => {
      const id = room.id as DepartmentId
      if (!DEPARTMENTS[id]) return
      const status = statuses[id] ?? 'idle'
      if (id === 'cerebro') drawCerebroLabel(ctx, room, status)
      else drawRoomLabel(ctx, room, status)
    })

    // Highlight selected room
    if (selected) {
      const room = ROOMS.find(r => r.id === selected)
      if (room) {
        const dept = DEPARTMENTS[selected]
        ctx.strokeStyle = dept.color
        ctx.lineWidth = 3
        ctx.strokeRect(room.tx * T + 2, room.ty * T + 2, room.tw * T - 4, room.th * T - 4)
        // Glow
        ctx.shadowColor = dept.color
        ctx.shadowBlur = 16
        ctx.strokeRect(room.tx * T + 2, room.ty * T + 2, room.tw * T - 4, room.th * T - 4)
        ctx.shadowBlur = 0
      }
    }

    animRef.current = requestAnimationFrame(renderFrame)
  }, [statuses, selected])

  useEffect(() => {
    animRef.current = requestAnimationFrame(renderFrame)
    return () => cancelAnimationFrame(animRef.current)
  }, [renderFrame])

  // ── Click detection ────────────────────────────────────────────────────────
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const tx = Math.floor((e.clientX - rect.left) / (T * zoom))
    const ty = Math.floor((e.clientY - rect.top) / (T * zoom))

    const hit = ROOMS.find(r =>
      r.id !== 'corridor' && r.id !== 'meeting' && r.id !== 'kitchen' && r.tw > 0 &&
      tx >= r.tx && tx < r.tx + r.tw && ty >= r.ty && ty < r.ty + r.th
    )
    setSelected(hit?.id === selected ? null : (hit?.id as DepartmentId) ?? null)
  }, [zoom, selected])

  const activeNow = (Object.entries(statuses) as [DepartmentId, Status][]).filter(([,s]) => s === 'working').length

  const selectedDept = selected ? DEPARTMENTS[selected] : null
  const selectedAgents = selected ? NUCLEUS_AGENTS.filter(a => a.depto === selected) : []

  return (
    <div style={{ background: '#070707', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: 9, letterSpacing: '0.1em' }}>← PANEL</Link>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C6FF3D', boxShadow: '0 0 8px #C6FF3D' }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#C6FF3D' }}>DIVINIA FACTORY</span>
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px' }}>SIM</span>
        <div style={{ flex: 1 }} />
        {[
          { v: 12, l: 'DEPTOS' }, { v: NUCLEUS_AGENTS.length, l: 'AGENTES' },
          { v: activeNow, l: 'ACTIVOS', lime: activeNow > 0 }, { v: runsToday, l: 'RUNS HOY' },
        ].map(s => (
          <div key={s.l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.lime ? '#C6FF3D' : '#fff', textShadow: s.lime ? '0 0 10px #C6FF3D' : 'none' }}>{s.v}</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>{s.l}</div>
          </div>
        ))}
        {/* Zoom controls */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          {[['−', -0.1], ['+', 0.1]].map(([label, delta]) => (
            <button key={String(label)} onClick={() => setZoom(z => Math.min(1.4, Math.max(0.35, z + Number(delta))))}
              style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {label}
            </button>
          ))}
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginLeft: 4 }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* ── Main area: canvas + side panel ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Canvas viewport */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={MAP_W * T}
            height={MAP_H * T}
            onClick={handleCanvasClick}
            style={{
              display: 'block',
              width: MAP_W * T * zoom,
              height: MAP_H * T * zoom,
              imageRendering: 'pixelated',
              cursor: 'crosshair',
            }}
          />
        </div>

        {/* Side detail panel */}
        {selectedDept && (
          <div style={{
            width: 260, flexShrink: 0,
            background: '#0a0a0a',
            borderLeft: `2px solid ${selectedDept.color}`,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Panel header */}
            <div style={{
              padding: '12px 14px 10px',
              background: rgba(selectedDept.color, 0.1),
              borderBottom: `1px solid ${rgba(selectedDept.color, 0.2)}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{selectedDept.emoji}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: selectedDept.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {selectedDept.nombre}
                </div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.06em' }}>
                  {selectedDept.modelo_base.toUpperCase()} · {selectedAgents.length} AGENTES
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', fontSize: 11, padding: 0,
              }}>[ X ]</button>
            </div>

            {/* Misión */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, letterSpacing: '0.03em' }}>
                {selectedDept.mision}
              </p>
            </div>

            {/* Agent list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {selectedAgents.map(agent => (
                <div key={agent.id} style={{
                  padding: '6px 8px',
                  background: rgba(selectedDept.color, 0.07),
                  border: `1px solid ${rgba(selectedDept.color, 0.12)}`,
                  display: 'flex', alignItems: 'flex-start', gap: 7,
                }}>
                  <span style={{ fontSize: 13, lineHeight: 1 }}>{agent.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}>
                      {agent.nombre}
                    </div>
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {agent.funcion}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 7, flexShrink: 0, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: agent.modelo === 'haiku' ? '#06b6d4' : agent.modelo === 'sonnet' ? '#8b5cf6' : '#f59e0b',
                  }}>{agent.modelo}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Link href={`/agents/${selected}`} style={{
                display: 'block', textAlign: 'center', padding: '8px',
                background: rgba(selectedDept.color, 0.15),
                border: `1px solid ${rgba(selectedDept.color, 0.3)}`,
                color: selectedDept.color, textDecoration: 'none',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                ABRIR DEPARTAMENTO →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Activity ticker ── */}
      {ticker.length > 0 && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: '#050505', padding: '5px 0', overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 28, animation: 'tickerScroll 20s linear infinite', whiteSpace: 'nowrap' }}>
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                <span style={{ color: '#C6FF3D', marginRight: 6 }}>▸</span>{t}
              </span>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes tickerScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  )
}
