'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Stats = {
  total: number
  pending: number
  approved: number
  rejected: number
  reports: number
}

type Confession = {
  id: string
  content: string
  category: string | null
  status: string
  createdAt: string
  approvedAt: string | null
  likesCount: number
}

type Report = {
  id: string
  reason: string
  status: string
  createdAt: string
  confession: Confession
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'rejected' | 'reports' | 'settings'>('pending')
  const [pending, setPending] = useState<Confession[]>([])
  const [published, setPublished] = useState<Confession[]>([])
  const [rejected, setRejected] = useState<Confession[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [dashRes, reportsRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/reports'),
      ])

      if (dashRes.status === 401 || reportsRes.status === 401) {
        router.push('/admin/login')
        return
      }

      const dashData = await dashRes.json()
      if (!dashRes.ok) throw new Error(dashData.error || 'Failed')

      setStats(dashData.stats)
      setPending(dashData.pending || [])
      setPublished(dashData.published || [])
      setRejected(dashData.rejected || [])

      if (reportsRes.ok) {
        const rData = await reportsRes.json()
        setReports(rData.reports || [])
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleAction(action: 'approve' | 'reject' | 'delete', id: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || 'Action failed')
        return
      }
      await loadData()
    } catch {
      alert('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReportAction(reportId: string, action: 'dismiss' | 'remove') {
    setActionLoading(reportId)
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || 'Action failed')
        return
      }
      await loadData()
    } catch {
      alert('Network error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg('')
    if (newPassword.length < 8) {
      setPasswordMsg('New password must be at least 8 characters')
      return
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordMsg(data.error || 'Failed')
        return
      }
      setPasswordMsg('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch {
      setPasswordMsg('Network error')
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#6B7280]">Loading dashboard...</p>
      </div>
    )
  }

  const list =
    activeTab === 'pending' ? pending :
    activeTab === 'published' ? published :
    activeTab === 'rejected' ? rejected : []

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-semibold">WHISPER</Link>
            <span className="text-sm text-[#6B7280]">Admin</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-[#6B7280] hover:text-[#211F27]">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="card text-center py-4">
              <div className="text-2xl font-semibold">{stats.total}</div>
              <div className="text-xs text-[#6B7280]">Total</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl font-semibold text-amber-600">{stats.pending}</div>
              <div className="text-xs text-[#6B7280]">Pending</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl font-semibold text-green-600">{stats.approved}</div>
              <div className="text-xs text-[#6B7280]">Approved</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl font-semibold text-red-500">{stats.rejected}</div>
              <div className="text-xs text-[#6B7280]">Rejected</div>
            </div>
            <div className="card text-center py-4">
              <div className="text-2xl font-semibold text-[#7955D6]">{stats.reports}</div>
              <div className="text-xs text-[#6B7280]">Open Reports</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-1 border-b border-[#E5E7EB]">
          {(['pending', 'published', 'rejected', 'reports', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
                activeTab === tab
                  ? 'border-[#7955D6] text-[#7955D6]'
                  : 'border-transparent text-[#6B7280] hover:text-[#211F27]'
              }`}
            >
              {tab === 'reports' ? `Reports (${reports.length})` : tab}
            </button>
          ))}
        </div>

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="card max-w-md">
            <h2 className="text-lg font-medium mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="label">Current password</label>
                <input
                  type="password"
                  className="input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">New password (min 8 characters)</label>
                <input
                  type="password"
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              {passwordMsg && (
                <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMsg}
                </p>
              )}
              <button type="submit" className="btn-primary">
                Update password
              </button>
            </form>
          </div>
        )}

        {/* Reports tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="card py-12 text-center text-[#6B7280]">
                No open reports.
              </div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="card">
                  <div className="mb-2 text-sm font-medium text-red-600">
                    Report reason: {r.reason}
                  </div>
                  <p className="whitespace-pre-wrap text-[#211F27] leading-relaxed mb-3">
                    {r.confession.content}
                  </p>
                  <p className="text-xs text-[#6B7280] mb-4">
                    Reported {new Date(r.createdAt).toLocaleString()} · Confession ID: {r.confession.id.slice(0, 8)}…
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleReportAction(r.id, 'dismiss')}
                      disabled={actionLoading === r.id}
                      className="btn-secondary text-sm py-1.5 px-3"
                    >
                      Dismiss report
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete the confession and close this report?')) {
                          handleReportAction(r.id, 'remove')
                        }
                      }}
                      disabled={actionLoading === r.id}
                      className="btn-danger text-sm py-1.5 px-3"
                    >
                      Remove confession
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Confession lists */}
        {(activeTab === 'pending' || activeTab === 'published' || activeTab === 'rejected') && (
          <>
            {list.length === 0 ? (
              <div className="card py-12 text-center text-[#6B7280]">
                No {activeTab} confessions.
              </div>
            ) : (
              <div className="space-y-4">
                {list.map((c) => (
                  <div key={c.id} className="card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {c.category && (
                          <span className="mb-2 inline-block rounded-full bg-[#7955D6]/10 px-2.5 py-0.5 text-xs font-medium text-[#7955D6]">
                            {c.category}
                          </span>
                        )}
                        <p className="whitespace-pre-wrap text-[#211F27] leading-relaxed">{c.content}</p>
                        <p className="mt-3 text-xs text-[#6B7280]">
                          {new Date(c.createdAt).toLocaleString()} · ID: {c.id.slice(0, 8)}…
                          {c.likesCount > 0 && ` · ${c.likesCount} likes`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeTab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction('approve', c.id)}
                            disabled={actionLoading === c.id}
                            className="btn-primary text-sm py-1.5 px-3"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction('reject', c.id)}
                            disabled={actionLoading === c.id}
                            className="btn-secondary text-sm py-1.5 px-3"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(activeTab === 'published' || activeTab === 'rejected') && (
                        <button
                          onClick={() => {
                            if (confirm('Permanently delete this confession?')) {
                              handleAction('delete', c.id)
                            }
                          }}
                          disabled={actionLoading === c.id}
                          className="btn-danger text-sm py-1.5 px-3"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
