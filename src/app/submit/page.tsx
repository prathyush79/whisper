'use client'

import { useState } from 'react'
import Link from 'next/link'

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
      <div className="site-shell min-h-screen">
        <header className="topbar"><div className="mx-auto max-w-2xl px-4 py-4"><Link href="/" className="brand text-lg"><span className="brand-mark">✦</span> WHISPER</Link></div></header>
        <main className="mx-auto max-w-lg px-4 py-16 text-center sm:py-24">
          <div className="form-panel">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#F0EBFF] text-2xl text-[#7654D8]">✓</div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#7654D8]">Sent anonymously</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">Your words are in safe hands.</h1>
            <p className="mb-6 mt-3 text-sm leading-6 text-[#777487]">Your confession is waiting for review. It will only appear publicly after an admin approves it.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center"><Link href="/submit" className="btn-primary" onClick={() => setSuccess(false)}>Write another</Link><Link href="/confessions" className="btn-secondary">Read confessions</Link></div>
          </div>
        </main>
      </div>
    )
  }


  return (
    <div className="site-shell min-h-screen">
      <header className="topbar sticky top-0 z-50"><div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4"><Link href="/" className="brand text-lg"><span className="brand-mark">✦</span> WHISPER</Link><Link href="/confessions" className="footer-link text-sm font-medium">Explore confessions ↗</Link></div></header>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="mb-6 text-center sm:text-left"><p className="hero-eyebrow">✦ &nbsp; A private moment</p><h1 className="page-heading mt-4 text-3xl font-extrabold sm:text-4xl">Write it out.</h1><p className="mt-2 text-sm leading-6 text-[#777487]">No name, no account, no public identity. Just your words.</p></div>
        <form onSubmit={handleSubmit} className="form-panel space-y-6">
          <div><label className="label" htmlFor="content">Your confession</label><textarea id="content" className="input min-h-[220px] resize-y" placeholder="Say what you never could..." value={content} onChange={(e) => setContent(e.target.value)} maxLength={MAX_LENGTH + 50} required /><div className={`mt-2 text-right text-xs ${remaining < 100 ? 'text-red-500' : 'text-[#777487]'}`}>{remaining} characters left</div></div>
          <div><label className="label" htmlFor="category">Choose a category <span className="font-normal text-[#9997A6]">(optional)</span></label><select id="category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Choose one...</option>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Sending...' : 'Submit anonymously  ↗'}</button>
          <div className="rounded-2xl bg-[#F7F5FC] px-4 py-3 text-xs leading-5 text-[#777487]">🔒 <strong className="text-[#514B63]">A quick reminder:</strong> Submissions are reviewed before publishing. Please avoid names, phone numbers, or private details about other people.</div>
        </form>
        <p className="mt-6 text-center text-xs text-[#9693A4]">By submitting, you agree that your text may be published after review.</p>
      </main>
    </div>
  )
}
