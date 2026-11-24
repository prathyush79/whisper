'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Confession = {
  id: string
  content: string
  category: string | null
  approvedAt: string | null
  likesCount: number
}

const CATEGORIES = ['all', 'Crush', 'Secrets', 'College Life', 'Funny', 'Friendship', 'Regrets', 'Random']

export default function ConfessionsPage() {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'latest' | 'trending'>('latest')
  const [category, setCategory] = useState('all')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ sort, limit: '40' })
      if (category !== 'all') params.set('category', category)
      const res = await fetch(`/api/confessions?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setConfessions(data.confessions || [])
    } catch {
      setError('Could not load confessions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [sort, category])

  async function handleLike(id: string) {
    // Optimistic
    setConfessions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likesCount: c.likesCount + 1 } : c))
    )
    try {
      await fetch(`/api/confessions/${id}/like`, { method: 'POST' })
    } catch {
      // keep simple
    }
  }

  async function handleReport(id: string) {
    const reason = prompt('Why are you reporting this confession? (short reason)')
    if (!reason || reason.trim().length < 3) return
    try {
      const res = await fetch(`/api/confessions/${id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      const data = await res.json()
      alert(data.message || data.error || 'Report submitted')
    } catch {
      alert('Failed to submit report')
    }
  }

  return (
    <div className="site-shell min-h-screen">
      <header className="sticky top-0 z-50 topbar">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="brand text-lg"><span className="brand-mark">✦</span> WHISPER</Link>
          <Link href="/submit" className="btn-primary text-sm">
            Confess
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6"><p className="hero-eyebrow">✦ &nbsp; Community stories</p><h1 className="page-heading mt-4 text-3xl font-extrabold sm:text-4xl">Confessions</h1><p className="mt-2 text-sm text-[#777487]">Anonymous thoughts from your community.</p></div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setSort('latest')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              sort === 'latest' ? 'bg-[#7654D8] text-white shadow-sm' : 'category-chip'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => setSort('trending')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              sort === 'trending' ? 'bg-[#7654D8] text-white shadow-sm' : 'category-chip'
            }`}
          >
            Trending
          </button>
        </div>

        {/* Category chips */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                category === c
                  ? 'bg-[#29243A] text-white'
                  : 'category-chip'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-20 text-center text-[#6B7280]">Loading confessions...</div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && confessions.length === 0 && (
          <div className="card py-16 text-center">
            <p className="text-lg font-medium text-[#211F27]">No confessions yet</p>
            <p className="mt-2 text-sm text-[#6B7280]">
              Be the first to share something. After review it will appear here.
            </p>
            <Link href="/submit" className="btn-primary mt-6 inline-flex">
              Write a confession
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {confessions.map((c) => (
            <article key={c.id} className="confession-card">
              {c.category && (
                <span className="mb-2 inline-block rounded-full bg-[#7955D6]/10 px-2.5 py-0.5 text-xs font-medium text-[#7955D6]">
                  {c.category}
                </span>
              )}
              <p className="whitespace-pre-wrap text-[#211F27] leading-relaxed">{c.content}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-[#6B7280]">
                <span>
                  {c.approvedAt
                    ? new Date(c.approvedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : ''}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(c.id)}
                    className="flex items-center gap-1 hover:text-[#7955D6]"
                  >
                    ♥ {c.likesCount}
                  </button>
                  <span className="text-[#E5E7EB]">·</span>
                  <button
                    onClick={() => handleReport(c.id)}
                    className="hover:text-red-500"
                  >
                    Report
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
