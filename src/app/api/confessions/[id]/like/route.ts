import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Simple anonymous session via cookie
    let sessionId = req.cookies.get('whisper_anon')?.value
    if (!sessionId) {
      sessionId = uuidv4()
    }

    // Check if already liked
    const existing = await prisma.like.findUnique({
      where: {
        confessionId_anonymousSessionId: {
          confessionId: id,
          anonymousSessionId: sessionId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ success: true, alreadyLiked: true })
    }

    // Create like + increment count
    await prisma.$transaction([
      prisma.like.create({
        data: {
          confessionId: id,
          anonymousSessionId: sessionId,
        },
      }),
      prisma.confession.update({
        where: { id },
        data: { likesCount: { increment: 1 } },
      }),
    ])

    const response = NextResponse.json({ success: true })
    response.cookies.set('whisper_anon', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
    return response
  } catch (err) {
    console.error('Like error:', err)
    return NextResponse.json({ error: 'Failed to like' }, { status: 500 })
  }
}
