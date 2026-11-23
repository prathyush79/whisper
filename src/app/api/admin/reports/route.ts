import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await prisma.report.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        confession: {
          select: {
            id: true,
            content: true,
            category: true,
            status: true,
            likesCount: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json({ reports })
  } catch (err) {
    console.error('Reports error:', err)
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportId, action } = await req.json()
    // action: "dismiss" | "remove"

    if (!reportId || !['dismiss', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    })
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (action === 'dismiss') {
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'DISMISSED' },
      })
    } else if (action === 'remove') {
      // Delete the confession and the report will cascade or we mark it
      await prisma.confession.delete({
        where: { id: report.confessionId },
      })
      // Reports cascade on confession delete because of onDelete: Cascade
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Report action error:', err)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}
