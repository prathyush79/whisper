import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production'
)

export type SessionPayload = {
  adminId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
  return token
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('whisper_admin_session')?.value
  if (!token) return null
  return verifySession(token)
}

export async function requireAdmin(requiredRole?: 'OWNER' | 'MODERATOR') {
  const session = await getSession()
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  if (requiredRole === 'OWNER' && session.role !== 'OWNER') {
    throw new Error('FORBIDDEN')
  }
  return session
}

export async function isSetupCompleted(): Promise<boolean> {
  const state = await prisma.setupState.findUnique({ where: { id: 'singleton' } })
  return state?.completed === true
}
