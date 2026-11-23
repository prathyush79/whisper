import Link from 'next/link'
import { prisma } from '@/lib/db'

// The page reads live moderation counts and must render at request time.
// This also prevents Prisma from trying to connect during `next build`.
export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const [published, totalApproved, pending] = await Promise.all([
      prisma.confession.count({ where: { status: 'APPROVED' } }),
      prisma.confession.count({ where: { status: 'APPROVED' } }),
      prisma.confession.count({ where: { status: 'PENDING' } }),
    ])
    return { published, totalApproved, pending }
  } catch {
    return { published: 0, totalApproved: 0, pending: 0 }
  }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB]/80 bg-[#FAF9F7]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight text-[#211F27]">
            WHISPER
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/confessions" className="btn-secondary text-sm">
              Read Confessions
            </Link>
            <Link href="/submit" className="btn-primary text-sm">
              Confess
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-16 text-center sm:pt-24">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-[#7955D6]">
          100% Anonymous · No Accounts · No Public Identities
        </p>
        <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-[#211F27] sm:text-5xl">
          Say what you never could.
        </h1>
        <p className="mx-auto mb-10 max-w-lg text-lg text-[#6B7280]">
          A safe space to share secrets, regrets, joys, and everything in between.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/submit" className="btn-primary w-full sm:w-auto">
            Write your confession
          </Link>
          <Link href="/confessions" className="btn-secondary w-full sm:w-auto">
            Read confessions
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8">
          <div className="card text-center">
            <div className="text-2xl font-semibold text-[#7955D6] sm:text-3xl">
              {stats.published}
            </div>
            <div className="mt-1 text-xs text-[#6B7280] sm:text-sm">Published</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-semibold text-[#211F27] sm:text-3xl">
              {stats.totalApproved}
            </div>
            <div className="mt-1 text-xs text-[#6B7280] sm:text-sm">Approved</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-semibold text-[#6B7280] sm:text-3xl">
              {stats.pending}
            </div>
            <div className="mt-1 text-xs text-[#6B7280] sm:text-sm">Pending</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-8 text-center text-sm text-[#6B7280]">
        <p>WHISPER · Built for college communities</p>
        <p className="mt-1">
          <Link href="/privacy" className="underline hover:text-[#211F27]">
            Privacy
          </Link>
          {' · '}
          <Link href="/admin" className="underline hover:text-[#211F27]">
            Admin
          </Link>
        </p>
      </footer>
    </div>
  )
}
