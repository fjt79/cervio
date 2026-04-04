'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Zap, Target, TrendingUp, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface CoachData {
  momentum_score: number
  momentum_label: string
  headline: string
  honest_assessment: string
  the_push: string
  spotlight_goal: string
  spotlight_action: string
  weekly_challenge: string
}

interface Metrics {
  avgProgress: number
  goalCount: number
  briefingStreak: number
  totalActivity: number
}

export default function CoachPage() {
  const [coaching, setCoaching] = useState<CoachData | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(false)

  const getCoaching = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoaching(data.coaching)
      setMetrics(data.metrics)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load coaching')
    } finally {
      setLoading(false)
    }
  }

  const getMomentumColor = (score: number) => {
    if (score >= 75) return '#4ade80'
    if (score >= 50) return '#c9a96e'
    if (score >= 25) return '#fbbf24'
    return '#f87171'
  }

  const getMomentumBg = (score: number) => {
    if (score >= 75) return 'rgba(74, 222, 128, 0.1)'
    if (score >= 50) return 'rgba(201, 169, 110, 0.1)'
    if (score >= 25) return 'rgba(251, 191, 36, 0.1)'
    return 'rgba(248, 113, 113, 0.1)'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/goals" className="inline-flex items-center gap-2 text-muted hover:text-text text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />
          Back to Goals
        </Link>
        <h1 className="font-display text-3xl font-bold text-text mb-2">Your Coach</h1>
        <p className="text-muted text-sm">An honest read on where you are and what to do next.</p>
      </div>

      {!coaching ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <Zap size={28} className="text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-text mb-3">Ready for your coaching session?</h2>
          <p className="text-muted text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Cervio will analyse your goals, progress, and activity — then give you a sharp, honest assessment and a clear push forward.
          </p>
          <button
            onClick={getCoaching}
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 px-8"
          >
            {loading ? (
              <>
                <div className="spinner" />
                Analysing your progress...
              </>
            ) : (
              <>
                <Zap size={16} />
                Get My Coaching
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Momentum Score */}
          <div
            className="card"
            style={{
              borderColor: getMomentumColor(coaching.momentum_score) + '40',
              backgroundColor: getMomentumBg(coaching.momentum_score),
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: getMomentumColor(coaching.momentum_score) }}>
                  MOMENTUM SCORE
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl font-bold" style={{ color: getMomentumColor(coaching.momentum_score) }}>
                    {coaching.momentum_score}
                  </span>
                  <span className="text-muted text-sm">/100</span>
                </div>
              </div>
              <div
                className="px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  color: getMomentumColor(coaching.momentum_score),
                  backgroundColor: getMomentumColor(coaching.momentum_score) + '20',
                }}
              >
                {coaching.momentum_label}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-black/20 rounded-full">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${coaching.momentum_score}%`,
                  backgroundColor: getMomentumColor(coaching.momentum_score),
                }}
              />
            </div>

            {/* Quick metrics */}
            {metrics && (
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                {[
                  { label: 'Avg Goal Progress', value: `${metrics.avgProgress}%` },
                  { label: 'Active Goals', value: metrics.goalCount.toString() },
                  { label: 'Briefings This Week', value: metrics.briefingStreak.toString() },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="font-display text-xl font-bold text-text">{stat.value}</div>
                    <div className="text-xs text-muted mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Headline */}
          <div className="card">
            <div className="text-xs font-semibold text-accent tracking-widest mb-3">THE HONEST TRUTH</div>
            <h2 className="font-display text-2xl font-bold text-text mb-4 leading-tight">
              "{coaching.headline}"
            </h2>
            <p className="text-muted text-sm leading-relaxed">{coaching.honest_assessment}</p>
          </div>

          {/* The Push */}
          <div className="card" style={{ borderColor: 'rgba(124, 110, 240, 0.3)', backgroundColor: 'rgba(124, 110, 240, 0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-accent2" />
              <div className="text-xs font-semibold text-accent2 tracking-widest">DO THIS NOW</div>
            </div>
            <p className="text-text font-medium leading-relaxed">{coaching.the_push}</p>
          </div>

          {/* Spotlight Goal */}
          <div className="card" style={{ borderColor: 'rgba(251, 191, 36, 0.25)', backgroundColor: 'rgba(251, 191, 36, 0.05)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} className="text-warning" />
              <div className="text-xs font-semibold text-warning tracking-widest">GOAL IN THE SPOTLIGHT</div>
            </div>
            <div className="font-semibold text-text mb-2">{coaching.spotlight_goal}</div>
            <p className="text-sm text-muted leading-relaxed">
              <span className="text-text font-medium">Today's action: </span>
              {coaching.spotlight_action}
            </p>
          </div>

          {/* Weekly Challenge */}
          <div className="card" style={{ borderColor: 'rgba(201, 169, 110, 0.3)', backgroundColor: 'rgba(201, 169, 110, 0.06)' }}>
            <div className="text-xs font-semibold text-accent tracking-widest mb-3">THIS WEEK'S CHALLENGE</div>
            <p className="text-text leading-relaxed">{coaching.weekly_challenge}</p>
          </div>

          {/* Refresh */}
          <button
            onClick={getCoaching}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surface2 text-muted text-sm hover:text-text hover:border-accent/40 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Coaching'}
          </button>
        </div>
      )}
    </div>
  )
}
