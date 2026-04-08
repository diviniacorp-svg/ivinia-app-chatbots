import { NextRequest, NextResponse } from 'next/server'
import {
  reviewPiece,
  reviewWeek,
  type BrandReviewInput,
} from '@/agents/content/brand-reviewer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Modo pieza individual: { piece: BrandReviewInput }
    if (body.piece && !body.pieces) {
      const piece = body.piece as BrandReviewInput

      if (!piece.pieceType || !piece.client || !piece.description || !piece.copyText) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos: pieceType, client, description, copyText' },
          { status: 400 }
        )
      }

      const result = await reviewPiece(piece)
      return NextResponse.json(result)
    }

    // Modo reporte semanal: { pieces: BrandReviewInput[], client: string, week: number }
    if (body.pieces) {
      const { pieces, client, week } = body as {
        pieces: BrandReviewInput[]
        client: string
        week: number
      }

      if (!pieces || !Array.isArray(pieces) || pieces.length === 0) {
        return NextResponse.json(
          { error: 'El campo "pieces" debe ser un array no vacío' },
          { status: 400 }
        )
      }

      if (!client || typeof client !== 'string') {
        return NextResponse.json(
          { error: 'El campo "client" es requerido' },
          { status: 400 }
        )
      }

      if (typeof week !== 'number' || week < 1) {
        return NextResponse.json(
          { error: 'El campo "week" debe ser un número mayor a 0' },
          { status: 400 }
        )
      }

      const report = await reviewWeek(pieces, client, week)
      return NextResponse.json(report)
    }

    return NextResponse.json(
      { error: 'Body inválido. Enviá "piece" para revisar una pieza o "pieces" para el reporte semanal' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[/api/content/review] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
