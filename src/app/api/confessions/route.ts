import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const submitSchema = z.object({
  content: z.string().min(10).max(3000),
  category: z.string().max(50).nullable().optional(),
})

// Simple in-memory rate limit (per IP). For production consider Redis.
const rateLimitMap = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many submissions. Please wait a minute.' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = submitSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid content. Keep it between 10 and 3000 characters.' }, { status: 400 })
    }

    const { content, category } = parsed.data

    // Basic filter for obvious personal info (phone-like patterns)
    const phoneLike = /(\+?\d[\d\s\-()]{8,}\d)/g
    if (phoneLike.test(content)) {
      return NextResponse.json({
        error: 'Please remove phone numbers or other personal contact information.',
      }, { status: 400 })
    }

    const confession = await prisma.confession.create({
      data: {
        content,
        category: category || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      id: confession.id,
      message: 'Submitted for review',
    })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Server error. Please try again later.' }, { status: 500 })
  }
}

// Public feed — only APPROVED
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'latest' // latest | trending
    const take = Math.min(parseInt(searchParams.get('limit') || '30'), 50)

    const where: any = { status: 'APPROVED' }
    if (category && category !== 'all') {
      where.category = category
    }

    const orderBy = sort === 'trending'
      ? [{ likesCount: 'desc' as const }, { approvedAt: 'desc' as const }]
      : [{ approvedAt: 'desc' as const }]

    const confessions = await prisma.confession.findMany({
      where,
      orderBy,
      take,
      select: {
        id: true,
        content: true,
        category: true,
        approvedAt: true,
        likesCount: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ confessions })
  } catch (err) {
    console.error('Feed error:', err)
    return NextResponse.json({ error: 'Could not load confessions' }, { status: 500 })
  }
}
