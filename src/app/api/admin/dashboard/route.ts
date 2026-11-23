import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [total, pendingCount, approvedCount, rejectedCount, reportsCount, pending, published, rejected] =
      await Promise.all([
        prisma.confession.count(),
        prisma.confession.count({ where: { status: 'PENDING' } }),
        prisma.confession.count({ where: { status: 'APPROVED' } }),
        prisma.confession.count({ where: { status: 'REJECTED' } }),
        prisma.report.count({ where: { status: 'OPEN' } }),
        prisma.confession.findMany({
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.confession.findMany({
          where: { status: 'APPROVED' },
          orderBy: { approvedAt: 'desc' },
          take: 50,
        }),
        prisma.confession.findMany({
          where: { status: 'REJECTED' },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      ])

    return NextResponse.json({
      stats: {
        total,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        reports: reportsCount,
      },
      pending,
      published,
      rejected,
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
