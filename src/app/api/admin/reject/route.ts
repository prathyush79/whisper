import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing confession id' }, { status: 400 })
    }

    const updated = await prisma.confession.update({
      where: { id },
      data: { status: 'REJECTED' },
    })

    return NextResponse.json({ success: true, confession: updated })
  } catch (err) {
    console.error('Reject error:', err)
    return NextResponse.json({ error: 'Failed to reject' }, { status: 500 })
  }
}
