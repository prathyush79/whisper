import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const reportSchema = z.object({
  reason: z.string().min(3).max(500),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = reportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please provide a short reason.' }, { status: 400 })
    }

    // Only allow reporting approved confessions
    const confession = await prisma.confession.findFirst({
      where: { id, status: 'APPROVED' },
    })
    if (!confession) {
      return NextResponse.json({ error: 'Confession not found.' }, { status: 404 })
    }

    await prisma.report.create({
      data: {
        confessionId: id,
        reason: parsed.data.reason,
        status: 'OPEN',
      },
    })

    return NextResponse.json({ success: true, message: 'Report submitted. Thank you.' })
  } catch (err) {
    console.error('Report error:', err)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
