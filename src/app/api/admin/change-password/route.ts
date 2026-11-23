import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, verifyPassword, hashPassword } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input. New password must be at least 8 characters.' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
    })
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const valid = await verifyPassword(parsed.data.currentPassword, admin.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const newHash = await hashPassword(parsed.data.newPassword)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Change password error:', err)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
