'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  RefreshCw, ChevronRight, TrendingUp, TrendingDown,
  CheckCircle, AlertCircle, Target, Zap, Calendar,
  ArrowLeft, ChevronDown, ChevronUp, Star
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface WeeklyReview {
  week_score: number
  week_label: string
  opening: string
  wins: string[]
  misses: string[]
  goal_updates: Array<{ title: string; progress: number; assessment: string; status: string }>
  key_decisions: string[]
  patterns: string
  next_week_focus: string[]
  challenge: string
  closing: string
}

interface SavedReview {
  id: string
  week_start: string
  week_end: string
  week_score: number
  content: WeeklyReview
  created_at: string
}

function getScoreColor(score: number) {
  if (score >= 80) return '#4ade80'
  if (score >= 60) return '#c9a96e'
  if (score >= 40) return '#fbbf24'
  return '#f87171'
}

function getStatusColor(status: string) {
  switch (status) {
    case 'on_track': return '#4ade80'
    case 'completed': return '#7c6ef0'
    case 'at_risk': return '#fbbf24'
    case 'behind': return '#f87171'
    default: return '#6b6b80'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'on_track': return 'On track'
    case 'completed': return 'Completed'
    case 'at_risk': return 'At risk'
    case 'behind': return 'Behind'
    default: return status
  }
}

export default function WeeklyReviewPage() {
  const [review, setReview] = useState<WeeklyReview | null>(null)
  const [pastReviews, setPastReviews] = useState<SavedReview[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [expandedPast, setExpandedPast] = useState<string | null>(null)

  useEffect(() => { loadHistory() }, [])

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }
  }

  const loadHistory = async () => {
    try {
      const headers = await getHeaders()
      const res = await fetch('/api/weekly-review', { headers })
      const data = await res.json()
      if (res.ok) setPastReviews(data.reviews)
    } catch {}
    setLoadingHistory(false)
  }

  const generateReview = async () => {
    setLoading(true)
    try {
      const headers = await getHeaders()
      const res = await fetch('/api/weekly-review', { method: 'POST', headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReview(data.review)
      loadHistory()
      toast.success('Weekly review generated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate review')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = review ? getScoreColor(review.week_score) : '#6b6b80'
  const weekRange = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return `${weekAgo.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} — ${now.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted hover:text-text text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-text mb-2">Weekly Review</h1>
            <p className="text-muted text-sm">{weekRange()}</p>
          </div>
          <button
            onClick={generateReview}
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-5"
            style={{ width: 'auto' }}
          >
            {loading ? <><div className="spinner" />Generating...</> : <><RefreshCw size={14} />Generate Review</>}
          </button>
        </div>
      </div>

      {!review && !loading ? (
        <>
          {/* Empty state */}
          {pastReviews.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                <Star size={28} className="text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-text mb-3">Your first weekly review</h2>
              <p className="text-muted text-sm mb-8 max-w-md mx-auto leading-relaxed">
                Every Sunday, Cervio reviews your week — goals, decisions, meetings, patterns — and gives you an honest assessment and a clear plan for next week.
              </p>
              <button onClick={generateReview} disabled={loading} className="btn-primary mx-auto" style={{ width: 'auto', padding: '10px 32px' }}>
                {loading ? 'Generating...' : 'Generate This Week\'s Review'}
              </button>
            </div>
          ) : (
            // Show most recent past review
            <div>
              <p className="text-muted text-sm mb-4">No review for this week yet. Click Generate to create one.</p>
            </div>
          )}
        </>
      ) : review ? (
        <div className="space-y-4">
          {/* Score card */}
          <div className="card" style={{ borderColor: scoreColor + '40', background: scoreColor + '08' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: scoreColor }}>WEEK SCORE</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-6xl font-bold" style={{ color: scoreColor }}>{review.week_score}</span>
                  <span className="text-muted">/100</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-full text-sm font-semibold" style={{ color: scoreColor, background: scoreColor + '20' }}>
                {review.week_label}
              </div>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${review.week_score}%`, background: scoreColor }} />
            </div>
            <p className="text-sm text-muted mt-4 leading-relaxed">{review.opening}</p>
          </div>

          {/* Wins & Misses */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card" style={{ borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.05)' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-success" />
                <span className="text-xs font-semibold tracking-widest text-success">THIS WEEK'S WINS</span>
              </div>
              {review.wins.map((win, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <CheckCircle size={12} className="text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text/90 leading-relaxed">{win}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ borderColor: 'rgba(251,191,36,0.25)', background: 'rgba(251,191,36,0.05)' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={14} className="text-warning" />
                <span className="text-xs font-semibold tracking-widest text-warning">MISSES & GAPS</span>
              </div>
              {review.misses.map((miss, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <AlertCircle size={12} className="text-warning flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text/90 leading-relaxed">{miss}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal updates */}
          {review.goal_updates?.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Target size={14} className="text-accent" />
                <span className="text-xs font-semibold tracking-widest text-accent">GOAL PROGRESS</span>
              </div>
              <div className="space-y-4">
                {review.goal_updates.map((goal, i) => {
                  const color = getStatusColor(goal.status)
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text">{goal.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold" style={{ color }}>{goal.progress}%</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ color, background: color + '20' }}>
                            {getStatusLabel(goal.status)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-border rounded-full mb-1">
                        <div className="h-full rounded-full" style={{ width: `${goal.progress}%`, background: color }} />
                      </div>
                      <p className="text-xs text-muted">{goal.assessment}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Key decisions */}
          {review.key_decisions?.length > 0 && (
            <div className="card" style={{ borderColor: 'rgba(124,110,240,0.25)', background: 'rgba(124,110,240,0.05)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-accent2" />
                <span className="text-xs font-semibold tracking-widest text-accent2">KEY DECISIONS THIS WEEK</span>
              </div>
              {review.key_decisions.map((d, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <span className="text-accent2 flex-shrink-0 text-sm">→</span>
                  <span className="text-sm text-text/90 leading-relaxed">{d}</span>
                </div>
              ))}
            </div>
          )}

          {/* Patterns */}
          <div className="card">
            <div className="text-xs font-semibold tracking-widest text-muted mb-2">PATTERNS OBSERVED</div>
            <p className="text-sm text-muted leading-relaxed italic">{review.patterns}</p>
          </div>

          {/* Next week focus */}
          <div className="card" style={{ borderColor: 'rgba(201,169,110,0.3)', background: 'rgba(201,169,110,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} className="text-accent" />
              <span className="text-xs font-semibold tracking-widest text-accent">NEXT WEEK — FOCUS ON</span>
            </div>
            {review.next_week_focus.map((focus, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <span className="font-display text-lg font-bold text-accent/40 w-5 flex-shrink-0">{i + 1}</span>
                <span className="text-sm text-text leading-relaxed">{focus}</span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-semibold tracking-widest text-accent mb-2">WEEKLY CHALLENGE</div>
              <p className="text-sm text-text font-medium">{review.challenge}</p>
            </div>
          </div>

          {/* Closing */}
          <div className="card text-center py-8">
            <p className="text-base text-text font-medium italic leading-relaxed">"{review.closing}"</p>
            <p className="text-xs text-muted mt-3">— Cervio</p>
          </div>
        </div>
      ) : null}

      {/* Past reviews */}
      {pastReviews.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-text mb-4">Past Reviews</h2>
          <div className="space-y-3">
            {pastReviews.map(saved => {
              const color = getScoreColor(saved.week_score)
              const isExpanded = expandedPast === saved.id
              return (
                <div key={saved.id} className="card">
                  <button
                    onClick={() => setExpandedPast(isExpanded ? null : saved.id)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-display text-2xl font-bold" style={{ color }}>{saved.week_score}</div>
                      <div>
                        <div className="text-sm font-medium text-text text-left">
                          {new Date(saved.week_start).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} — {new Date(saved.week_end).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs px-2 py-0.5 rounded-full inline-block" style={{ color, background: color + '20' }}>
                          {saved.content.week_label}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                  </button>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted leading-relaxed mb-4">{saved.content.opening}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-semibold text-success mb-2">WINS</div>
                          {saved.content.wins?.map((w, i) => <p key={i} className="text-xs text-muted mb-1">✓ {w}</p>)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-warning mb-2">NEXT WEEK</div>
                          {saved.content.next_week_focus?.map((f, i) => <p key={i} className="text-xs text-muted mb-1">→ {f}</p>)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
