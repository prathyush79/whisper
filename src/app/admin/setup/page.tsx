'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SetupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [setupSecret, setSetupSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/setup')
      .then((r) => r.json())
      .then((d) => setCompleted(d.completed))
      .catch(() => setCompleted(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, setupSecret }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Setup failed')
        setLoading(false)
        return
      }
      router.push('/admin/login')
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  if (completed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#6B7280]">Checking setup status...</p>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-xl font-semibold mb-3">Setup already completed</h1>
          <p className="text-[#6B7280] mb-6">
            An owner account already exists. Please log in.
          </p>
          <Link href="/admin/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold text-[#211F27]">
            WHISPER
          </Link>
          <p className="mt-2 text-sm text-[#6B7280]">One-time owner setup</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label">Setup Secret</label>
            <input
              type="password"
              className="input"
              value={setupSecret}
              onChange={(e) => setSetupSecret(e.target.value)}
              placeholder="The secret from your .env file"
              required
            />
            <p className="mt-1 text-xs text-[#6B7280]">
              Must match the SETUP_SECRET in your environment.
            </p>
          </div>

          <div>
            <label className="label">Owner Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Password (min 8 characters)</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating owner...' : 'Create Owner Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#6B7280]">
          This page permanently closes after the first successful setup.
        </p>
      </div>
    </div>
  )
}
