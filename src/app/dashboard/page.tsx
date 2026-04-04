'use client'
import { useState, useEffect } from 'react'
import { supabase, Profile, Goal, Briefing } from '@/lib/supabase'
import { getGreeting } from '@/lib/utils'
import { RefreshCw, ChevronRight, Zap, Calendar, Target, TrendingUp, Star, FileText, Users, Sparkles, CalendarDays, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import TodaySchedule from '@/components/features/TodaySchedule'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [loadingBriefing, setLoadingBriefing] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [lastReview, setLastReview] = useState<any>(null)
  const [recentDecisions, setRecentDecisions] = useState<any[]>([])
  const [recentMeetings, setRecentMeetings] = useState<any[]>([])
  const [stakeholderCount, setStakeholderCount] = useState(0)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setPageLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, goalsRes, briefingRes, reviewRes, decisionsRes, meetingsRes, stakeholdersRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').order('priority'),
      supabase.from('briefings').select('*').eq('user_id', user.id).eq('briefing_date', new Date().toISOString().split('T')[0]).single(),
      supabase.from('weekly_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('decisions').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('meetings').select('id, title, meeting_with, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('stakeholders').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (goalsRes.data) setGoals(goalsRes.data)
    if (briefingRes.data) setBriefing(briefingRes.data)
    if (reviewRes.data) setLastReview(reviewRes.data)
    if (decisionsRes.data) setRecentDecisions(decisionsRes.data)
    if (meetingsRes.data) setRecentMeetings(meetingsRes.data)
    if (stakeholdersRes.count) setStakeholderCount(stakeholdersRes.count)
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })
  const avgProgress = goals.length ? Math.round(goals.reduce((a, g) => a + (g.current_progress || 0), 0) / goals.length) : 0

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 4 }}>
          {getGreeting(profile?.full_name)}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{today} · {profile?.business_name || 'Your Business'}</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Active Goals', value: goals.length, color: 'var(--accent)', icon: Target },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: 'var(--success)', icon: TrendingUp },
          { label: 'Plan', value: profile?.subscription_plan === 'trial' ? 'Trial' : profile?.subscription_plan || 'Trial', color: 'var(--purple)', icon: Zap },
          { label: 'Today', value: briefing ? 'Briefed' : 'Pending', color: briefing ? 'var(--success)' : 'var(--warning)', icon: Calendar },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</span>
              <stat.icon size={14} style={{ color: stat.color }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, letterSpacing: -0.5 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>

        {/* Daily Briefing */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>Today's Briefing</h2>
            <button onClick={generateBriefing} disabled={loadingBriefing} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
              <RefreshCw size={13} style={{ animation: loadingBriefing ? 'spin 0.7s linear infinite' : 'none' }} />
              {briefing ? 'Regenerate' : 'Generate'}
            </button>
          </div>

          {briefing ? (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: 1, textTransform: 'uppercase' }}>Top Priorities</span>
                </div>
                {briefing.content.priorities?.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-tertiary)', width: 16, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>

              {briefing.content.decisions?.length > 0 && (
                <div style={{ paddingTop: 14, borderTop: '0.5px solid var(--border)', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple)', letterSpacing: 1, textTransform: 'uppercase' }}>Decisions Needed</span>
                  </div>
                  {briefing.content.decisions.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 14, color: 'var(--text)' }}>
                      <span style={{ color: 'var(--purple)' }}>→</span>{d}
                    </div>
                  ))}
                </div>
              )}

              {briefing.content.risks?.length > 0 && (
                <div style={{ paddingTop: 14, borderTop: '0.5px solid var(--border)', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--warning)', letterSpacing: 1, textTransform: 'uppercase' }}>Flags & Risks</span>
                  </div>
                  {briefing.content.risks.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 14, color: 'var(--text)' }}>
                      <span style={{ color: 'var(--warning)' }}>⚠</span>{r}
                    </div>
                  ))}
                </div>
              )}

              {briefing.content.strategic_prompt && (
                <div style={{ padding: '12px 14px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Strategic Prompt</p>
                  <p style={{ fontSize: 14, color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.5 }}>"{briefing.content.strategic_prompt}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span style={{ fontSize: 22 }}>☀️</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>No briefing yet</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>Start your day with a personalised AI briefing.</p>
              <button onClick={generateBriefing} disabled={loadingBriefing} className="btn-primary" style={{ maxWidth: 240, margin: '0 auto' }}>
                {loadingBriefing ? <><div className="spinner" />Generating...</> : "Generate Today's Briefing"}
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TodaySchedule />

          {/* Goals preview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>Goals</h2>
              <Link href="/dashboard/goals" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none' }}>View all</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {goals.slice(0, 3).map(goal => (
                <div key={goal.id} className="card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{goal.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{goal.current_progress}%</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--surface3)', borderRadius: 2 }}>
                    <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, width: `${goal.current_progress}%` }} />
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>No active goals</p>
                  <Link href="/dashboard/goals" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>Set your first goal →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature preview cards */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Your Tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>

          {/* Decisions */}
          <Link href="/dashboard/decisions/new" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ padding: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Zap size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Decisions</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>AI-structured analysis for any decision</div>
              {recentDecisions.length > 0 ? (
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{recentDecisions.length} recent</div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--accent)' }}>Analyse a decision →</div>
              )}
            </div>
          </Link>

          {/* Meeting Prep */}
          <Link href="/dashboard/meetings" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ padding: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <CalendarDays size={16} style={{ color: 'var(--success)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Meeting Prep</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>Walk into every meeting prepared</div>
              {recentMeetings.length > 0 ? (
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Last: {recentMeetings[0].meeting_with}</div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--success)' }}>Prep a meeting →</div>
              )}
            </div>
          </Link>

          {/* Coach */}
          <Link href="/dashboard/coach" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ padding: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--purple-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Sparkles size={16} style={{ color: 'var(--purple)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Coach</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>Honest performance assessment</div>
              <div style={{ fontSize: 11, color: 'var(--purple)' }}>Get your momentum score →</div>
            </div>
          </Link>

          {/* Weekly Review */}
          <Link href="/dashboard/weekly-review" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ padding: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 149, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Star size={16} style={{ color: 'var(--warning)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Weekly Review</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>Wins, misses, and next week's focus</div>
              {lastReview ? (
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Last score: {lastReview.week_score}/100</div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--warning)' }}>Generate this week's review →</div>
              )}
            </div>
          </Link>

          {/* Board Updates */}
          <Link href="/dashboard/board-update" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ padding: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(90, 200, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <FileText size={16} style={{ color: 'var(--teal)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Board Updates</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>Polished investor & board updates</div>
              <div style={{ fontSize: 11, color: 'var(--teal)' }}>Write an update →</div>
            </div>
          </Link>

          {/* Stakeholders */}
          <Link href="/dashboard/stakeholders" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ padding: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 59, 48, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Users size={16} style={{ color: 'var(--danger)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Stakeholders</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>Track key relationships</div>
              {stakeholderCount > 0 ? (
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{stakeholderCount} tracked</div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--danger)' }}>Add stakeholders →</div>
              )}
            </div>
          </Link>

          {/* Calendar */}
          <Link href="/dashboard/calendar" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ padding: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0, 122, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Calendar size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Calendar</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>Week view with meeting notes</div>
              <div style={{ fontSize: 11, color: 'var(--accent)' }}>View your week →</div>
            </div>
          </Link>

          {/* Goals full */}
          <Link href="/dashboard/goals" style={{ textDecoration: 'none' }}>
            <div className="card-hover" style={{ padding: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Target size={16} style={{ color: 'var(--success)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Goals</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>Track progress on what matters</div>
              {goals.length > 0 ? (
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{goals.length} active · {avgProgress}% avg</div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--success)' }}>Set your goals →</div>
              )}
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
