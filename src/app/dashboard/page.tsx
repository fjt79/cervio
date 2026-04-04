'use client'
import { useState, useEffect } from 'react'
import { supabase, Profile, Goal, Briefing } from '@/lib/supabase'
import { getGreeting, formatDate } from '@/lib/utils'
import { RefreshCw, ChevronRight, Zap, Calendar, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import TodaySchedule from '@/components/features/TodaySchedule'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [loadingBriefing, setLoadingBriefing] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setPageLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, goalsRes, briefingRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').order('priority'),
      supabase.from('briefings').select('*').eq('user_id', user.id)
        .eq('briefing_date', new Date().toISOString().split('T')[0]).single(),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (goalsRes.data) setGoals(goalsRes.data)
    if (briefingRes.data) setBriefing(briefingRes.data)
    setPageLoading(false)
  }

  const generateBriefing = async () => {
    if (!profile) return
    setLoadingBriefing(true)
    try {
      const res = await fetch('/api/briefing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBriefing(data.briefing)
      toast.success('Briefing generated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate briefing')
    } finally {
      setLoadingBriefing(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: 32, height: 32 }} />
          <p className="text-muted text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">
          {getGreeting(profile?.full_name)}
        </h1>
        <p className="text-muted text-sm">{today} · {profile?.business_name || 'Your Business'}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Goals', value: goals.length, icon: Target, color: 'text-accent' },
          { label: 'Avg Progress', value: `${goals.length ? Math.round(goals.reduce((a, g) => a + (g.current_progress || 0), 0) / goals.length) : 0}%`, icon: TrendingUp, color: 'text-success' },
          { label: 'Plan', value: profile?.subscription_plan === 'trial' ? 'Free Trial' : profile?.subscription_plan || 'Trial', icon: Zap, color: 'text-accent2' },
          { label: 'Today', value: briefing ? 'Briefed' : 'Pending', icon: Calendar, color: briefing ? 'text-success' : 'text-warning' },
        ].map(stat => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={14} className={stat.color} />
            </div>
            <div className="font-display text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Briefing - takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Today's Briefing</h2>
            <button
              onClick={generateBriefing}
              disabled={loadingBriefing}
              className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loadingBriefing ? 'animate-spin' : ''} />
              {briefing ? 'Regenerate' : 'Generate'}
            </button>
          </div>

          {briefing ? (
            <div className="card space-y-6">
              {/* Priorities */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-accent rounded-full" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">Top Priorities</h3>
                </div>
                <ol className="space-y-2">
                  {briefing.content.priorities?.map((p, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="font-display font-bold text-accent/50 w-4 flex-shrink-0">{i + 1}</span>
                      <span className="text-text/90">{p}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Decisions */}
              {briefing.content.decisions?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-accent2 rounded-full" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-accent2">Decisions Needed</h3>
                  </div>
                  <ul className="space-y-2">
                    {briefing.content.decisions.map((d, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text/80">
                        <span className="text-accent2 flex-shrink-0">→</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {briefing.content.risks?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-warning rounded-full" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-warning">Flags & Risks</h3>
                  </div>
                  <ul className="space-y-2">
                    {briefing.content.risks.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text/80">
                        <span className="text-warning flex-shrink-0">⚠</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strategic prompt */}
              {briefing.content.strategic_prompt && (
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <p className="text-xs text-accent uppercase tracking-wider mb-2 font-medium">Strategic Prompt</p>
                  <p className="text-sm text-text italic">"{briefing.content.strategic_prompt}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-accent text-xl">☀</span>
              </div>
              <h3 className="font-semibold mb-2">No briefing yet</h3>
              <p className="text-muted text-sm mb-6">
                Start your day with a personalised AI briefing tailored to your goals and context.
              </p>
              <button onClick={generateBriefing} disabled={loadingBriefing} className="btn-primary mx-auto">
                {loadingBriefing ? (
                  <span className="flex items-center gap-2"><div className="spinner" /> Generating...</span>
                ) : "Generate Today's Briefing"}
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Today's Schedule */}
          <TodaySchedule />

          {/* Quick actions */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { href: '/dashboard/decisions/new', icon: Zap, label: 'New Decision', desc: 'Analyse a situation' },
                { href: '/dashboard/meetings', icon: Calendar, label: 'Prep a Meeting', desc: 'Get a meeting brief' },
                { href: '/dashboard/goals', icon: Target, label: 'Review Goals', desc: 'Check your progress' },
              ].map(action => (
                <Link key={action.href} href={action.href} className="card-hover flex items-center gap-3 p-3 group">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <action.icon size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-xs text-muted">{action.desc}</div>
                  </div>
                  <ChevronRight size={14} className="text-muted group-hover:text-accent transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Active goals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Goals</h2>
              <Link href="/dashboard/goals" className="text-xs text-accent hover:underline">View all</Link>
            </div>
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.id} className="card p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium leading-tight">{goal.title}</span>
                      <span className="text-xs text-accent ml-2 flex-shrink-0">{goal.current_progress}%</span>
                    </div>
                    <div className="h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${goal.current_progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-6">
                <p className="text-muted text-sm mb-3">No active goals yet</p>
                <Link href="/dashboard/goals" className="text-accent text-sm hover:underline">Set your first goal →</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}