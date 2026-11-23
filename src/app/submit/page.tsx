'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { value: 'Crush', label: '❤️ Crush' },
  { value: 'Secrets', label: '🤫 Secrets' },
  { value: 'College Life', label: '🎓 College Life' },
  { value: 'Funny', label: '😂 Funny' },
  { value: 'Friendship', label: '🫂 Friendship' },
  { value: 'Regrets', label: '💭 Regrets' },
  { value: 'Random', label: '✨ Random' },
]

const MAX_LENGTH = 3000

export default function SubmitPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const remaining = MAX_LENGTH - content.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (content.trim().length < 10) {
      setError('Please write at least a few words.')
      return
    }
    if (content.length > MAX_LENGTH) {
      setError('Too long. Maximum 3000 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), category: category || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      setSuccess(true)
      setContent('')
      setCategory('')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-[#E5E7EB] bg-[#FAF9F7]">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-semibold">WHISPER</Link>
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="card">
            <h1 className="mb-3 text-2xl font-semibold text-[#211F27]">Submitted</h1>
            <p className="mb-6 text-[#6B7280]">
              Your confession is now waiting for review. It will only appear publicly after an admin approves it.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/submit" className="btn-primary" onClick={() => setSuccess(false)}>
                Write another
              </Link>
              <Link href="/confessions" className="btn-secondary">
                Read confessions
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB]/80 bg-[#FAF9F7]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-semibold">WHISPER</Link>
          <Link href="/confessions" className="text-sm text-[#6B7280] hover:text-[#211F27]">
            Read
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-semibold text-[#211F27]">Write your confession</h1>
        <p className="mb-8 text-sm text-[#6B7280]">
          Completely anonymous. No name, no account, no tracking of who you are.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label" htmlFor="content">Your confession</label>
            <textarea
              id="content"
              className="input min-h-[180px] resize-y"
              placeholder="Say what you never could..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_LENGTH + 50}
              required
            />
            <div className={`mt-1.5 text-right text-xs ${remaining < 100 ? 'text-red-500' : 'text-[#6B7280]'}`}>
              {remaining} characters left
            </div>
          </div>

          <div>
            <label className="label" htmlFor="category">Category (optional)</label>
            <select
              id="category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Choose one...</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit anonymously'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#6B7280]">
          By submitting you agree that your text may be published after review.
          Do not include names, phone numbers or private information about others.
        </p>
      </main>
    </div>
  )
}
