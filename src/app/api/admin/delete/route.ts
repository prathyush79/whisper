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

    await prisma.confession.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete error:', err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
