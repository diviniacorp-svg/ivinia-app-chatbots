import { NextRequest, NextResponse } from 'next/server'
import { qualifyLead, generateDMResponse, generateProposal, handleObjection } from '@/agents/instagram/sales-dm'
import type { InstagramLead } from '@/agents/instagram/types'

export const dynamic = 'force-dynamic'

// En memoria para el prototipo — en producción esto va a Supabase
const leadsCache = new Map<string, InstagramLead>()

export async function POST(req: NextRequest) {
  try {
    const { action, username, message, lead, objection } = await req.json()

    switch (action) {
      case 'qualify': {
        if (!username || !message) {
          return NextResponse.json({ error: 'username y message son requeridos' }, { status: 400 })
        }

        const qualification = await qualifyLead(message, username)

        // Crear o actualizar lead
        const existingLead = leadsCache.get(username)
        const updatedLead: InstagramLead = existingLead || {
          username,
          message,
          score: qualification.score,
          rubro: qualification.rubro,
          stage: qualification.suggestedStage,
          detectedNeeds: qualification.detectedNeeds,
          notes: '',
          firstContactAt: new Date(),
          lastMessageAt: new Date(),
        }

        if (existingLead) {
          existingLead.score = qualification.score
          existingLead.rubro = qualification.rubro
          existingLead.stage = qualification.suggestedStage
          existingLead.detectedNeeds = Array.from(new Set([...existingLead.detectedNeeds, ...qualification.detectedNeeds]))
          existingLead.lastMessageAt = new Date()
        } else {
          leadsCache.set(username, updatedLead)
        }

        return NextResponse.json({ lead: leadsCache.get(username), qualification })
      }

      case 'respond': {
        if (!username || !message) {
          return NextResponse.json({ error: 'username y message son requeridos' }, { status: 400 })
        }

        const currentLead = leadsCache.get(username)
        if (!currentLead) {
          return NextResponse.json({ error: 'Lead no encontrado. Calificá primero con action: qualify' }, { status: 404 })
        }

        const response = await generateDMResponse(currentLead, message)
        return NextResponse.json({ response })
      }

      case 'proposal': {
        if (!username) {
          return NextResponse.json({ error: 'username es requerido' }, { status: 400 })
        }

        const currentLead = lead as InstagramLead || leadsCache.get(username)
        if (!currentLead) {
          return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
        }

        const proposal = await generateProposal(currentLead)

        // Actualizar stage
        if (leadsCache.get(username)) {
          leadsCache.get(username)!.stage = 'proposal_sent'
        }

        return NextResponse.json({ proposal })
      }

      case 'objection': {
        if (!objection || !username) {
          return NextResponse.json({ error: 'objection y username son requeridos' }, { status: 400 })
        }

        const currentLead = leadsCache.get(username)
        if (!currentLead) {
          return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
        }

        const response = await handleObjection(objection, currentLead)
        return NextResponse.json({ response })
      }

      default:
        return NextResponse.json(
          { error: 'action inválida. Usar: qualify, respond, proposal, objection' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Instagram DM] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const leads = Array.from(leadsCache.values()).sort(
      (a, b) => b.score - a.score
    )
    return NextResponse.json({ leads, total: leads.length })
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo leads' }, { status: 500 })
  }
}
