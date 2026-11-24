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
    <div className="site-shell min-h-screen">
      <header className="topbar sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="brand text-lg"><span className="brand-mark">✦</span> WHISPER</Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/confessions" className="btn-secondary !px-3 !py-2.5 text-xs sm:text-sm">Read confessions</Link>
            <Link href="/submit" className="btn-primary !px-3 !py-2.5 text-xs sm:text-sm">Confess <span className="ml-1">↗</span></Link>
          </nav>
        </div>
      </header>


      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:pt-12">
        <section className="hero-panel px-5 py-12 text-center sm:px-12 sm:py-16">
          <div className="hero-glow" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="hero-eyebrow">✦ &nbsp; Anonymous by design</p>
            <h1 className="page-heading mt-6 text-4xl font-extrabold leading-[1.12] sm:text-6xl">Say what you<br className="hidden sm:block"/> never could<span className="text-[#7654D8]">.</span></h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#747487] sm:text-lg sm:leading-8">A little space for the things you keep to yourself. Share your thoughts, feelings, stories, and secrets — without a name.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/submit" className="btn-primary w-full sm:w-auto">Write your confession <span className="ml-2">↗</span></Link>
              <Link href="/confessions" className="btn-secondary w-full sm:w-auto">Explore confessions</Link>
            </div>
            <p className="mt-5 text-xs font-medium text-[#9794A6]">No account · No public identity · Reviewed before publishing</p>
          </div>
        </section>


        <section className="mx-auto mt-7 grid max-w-3xl grid-cols-3 gap-3 sm:gap-5" aria-label="Site statistics">
          <div className="stat-card text-center"><div className="stat-number">✦</div><div className="text-2xl font-bold tracking-tight text-[#7654D8] sm:text-3xl">{stats.published}</div><p className="mt-1 text-xs text-[#777487] sm:text-sm">Published</p></div>
          <div className="stat-card text-center"><div className="stat-number">✓</div><div className="text-2xl font-bold tracking-tight text-[#282436] sm:text-3xl">{stats.totalApproved}</div><p className="mt-1 text-xs text-[#777487] sm:text-sm">Approved</p></div>
          <div className="stat-card text-center"><div className="stat-number">⌛</div><div className="text-2xl font-bold tracking-tight text-[#7A7890] sm:text-3xl">{stats.pending}</div><p className="mt-1 text-xs text-[#777487] sm:text-sm">Pending</p></div>
        </section>

        <section className="mx-auto mt-12 max-w-3xl text-center">
          <p className="text-sm font-semibold text-[#7654D8]">YOUR WORDS, YOUR SPACE</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Let it out. Leave it here.</h2>
          <p className="mt-3 text-sm leading-6 text-[#777487]">Share anonymously. Every submission is reviewed before it appears publicly, keeping this space respectful for everyone.</p>
        </section>
      </main>

      <footer className="border-t border-[#E6E3F1] py-7 text-center text-sm text-[#777487]">
        <p className="font-semibold text-[#282436]">WHISPER <span className="text-[#7654D8]">✦</span></p>
        <p className="mt-1">Made for college communities · Share thoughtfully</p>
        <div className="mt-3 flex justify-center gap-4"><Link href="/privacy" className="footer-link underline">Privacy</Link><Link href="/admin" className="footer-link underline">Admin</Link></div>
      </footer>
    </div>
  )
}
