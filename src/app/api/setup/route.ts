import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, isSetupCompleted } from '@/lib/auth'
import { z } from 'zod'

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  setupSecret: z.string().min(16),
})

export async function POST(req: NextRequest) {
  try {
    // Permanent lock after first owner
    if (await isSetupCompleted()) {
      return NextResponse.json(
        { error: 'Setup already completed. Owner account exists.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = setupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email or password (min 8 characters).' },
        { status: 400 }
      )
    }

    const { email, password, setupSecret } = parsed.data

    // Verify the one-time secret from environment
    const expectedSecret = process.env.SETUP_SECRET
    if (!expectedSecret || setupSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid setup secret.' },
        { status: 403 }
      )
    }

    // Create the OWNER
    const passwordHash = await hashPassword(password)
    await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'OWNER',
      },
    })

    // Mark setup as permanently completed
    await prisma.setupState.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', completed: true },
      update: { completed: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Owner account created successfully. You can now log in at /admin.',
    })
  } catch (err: any) {
    console.error('Setup error:', err)
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Setup failed.' }, { status: 500 })
  }
}

export async function GET() {
  const completed = await isSetupCompleted()
  return NextResponse.json({ completed })
}
