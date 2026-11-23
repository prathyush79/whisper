import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 })
    }

    const { email, password } = parsed.data
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const valid = await verifyPassword(password, admin.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const token = await createSession({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    })

    const response = NextResponse.json({
      success: true,
      role: admin.role,
      email: admin.email,
    })

    // Secure httpOnly cookie
    response.cookies.set('whisper_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
