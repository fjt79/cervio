'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { RefreshCw, Star, ChevronDown, ChevronUp, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  danger: '#c41e1e', dangerBg: 'rgba(196,30,30,0.07)', dangerBorder: 'rgba(196,30,30,0.22)',
  success: '#146c34', successBg: 'rgba(20,108,52,0.07)', successBorder: 'rgba(20,108,52,0.22)',
  accent: '#1d4ed8', accentLight: 'rgba(29,78,216,0.09)', accentMid: 'rgba(29,78,216,0.18)',
  warning: '#a16207', warningBg: 'rgba(161,98,7,0.07)', warningBorder: 'rgba(161,98,7,0.2)',
  shadowSm: '0 2px 6px rgba(10,10,11,0.07)', shadowMd: '0 6px 18px rgba(10,10,11,0.09)',
}

function scoreColor(s: number) { return s >= 70 ? T.success : s >= 45 ? T.warning : T.danger }

function PastReviewCard({ review }: { review: any }) {
  const [expanded, setExpanded] = useState(false)
  const color = scoreColor(review.week_score || 0)
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 10 }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color, minWidth: 44 }}>{review.week_score}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{review.week_label || 'Week review'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{review.week_start ? `${new Date(review.week_start).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} — ${new Date(review.week_end).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}` : '—'}</div>
          </div>
        </div>
        {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
      </button>
      {expanded && (
        <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {review.opening && <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.68 }}>{review.opening}</p>}
          {review.wins?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.success, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 }}>Wins</div>
              {review.wins.map((w: string, i: number) => <div key={i} style={{ padding: '8px 12px', background: T.successBg, borderRadius: 9, border: `1px solid ${T.successBorder}`, fontSize: 13, color: 'var(--text)', marginBottom: 6, lineHeight: 1.55 }}>✓ {w}</div>)}
            </div>
          )}
          {review.misses?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.danger, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 }}>Misses</div>
              {review.misses.map((m: string, i: number) => <div key={i} style={{ padding: '8px 12px', background: T.dangerBg, borderRadius: 9, border: `1px solid ${T.dangerBorder}`, fontSize: 13, color: 'var(--text)', marginBottom: 6, lineHeight: 1.55 }}>✗ {m}</div>)}
            </div>
          )}
          {review.next_week_focus?.length > 0 && (
            <div style={{ padding: '13px 15px', background: T.accentLight, borderRadius: 11, border: `1px solid ${T.accentMid}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 8 }}>Next Week Focus</div>
              {review.next_week_focus.map((f: string, i: number) => <div key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 5, lineHeight: 1.55 }}>→ {f}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WeeklyReviewPage() {
  const [review, setReview] = useState<any>(null)
  const [savedReviews, setSavedReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'current'|'history'>('current')

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('weekly_reviews').select('*').eq('user_id', user.id).order('week_start', { ascending: false }).limit(12)
    setSavedReviews(data || [])
  }

  const generateReview = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/weekly-review', { method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReview(data.review)
      toast.success('Review generated')
    } catch (err: any) { toast.error(err.message || 'Failed to generate') }
    finally { setLoading(false) }
  }

  const saveReview = async () => {
    if (!review) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getSession().then(r => supabase.auth.getUser())
      if (!user) return
      const now = new Date()
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1)
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6)
      const { error } = await supabase.from('weekly_reviews').insert({ user_id: user.id, ...review, week_start: weekStart.toISOString().split('T')[0], week_end: weekEnd.toISOString().split('T')[0], created_at: now.toISOString() })
      if (error) throw error
      toast.success('Review saved')
      loadHistory()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const scoreColor2 = review?.week_score ? scoreColor(review.week_score) : T.accent

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 28px 120px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Star size={22} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8 }}>Weekly Review</h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>End-of-week intelligence to sharpen next week</p>
        </div>
        <button onClick={generateReview} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: loading ? 'var(--surface2)' : T.accent, color: loading ? 'var(--text-secondary)' : 'white', border: loading ? '1px solid var(--border)' : 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 2px 8px rgba(29,78,216,0.3)' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
          {loading ? 'Generating...' : 'Generate Review'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--surface2)', borderRadius: 12, padding: 4 }}>
        {[['current', 'This Week'], ['history', `History (${savedReviews.length})`]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k as any)} style={{ flex: 1, padding: '8px 0', borderRadius: 9, background: tab === k ? 'var(--surface)' : 'transparent', color: tab === k ? 'var(--text)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === k ? 700 : 500, boxShadow: tab === k ? '0 1px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.12s' }}>{label}</button>
        ))}
      </div>

      {tab === 'current' && (
        <>
          {!review && !loading && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '48px 24px', textAlign: 'center', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>★</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No review yet this week</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.65 }}>Cervio analyses your week — what you shipped, what slipped, and what you need to focus on next.</p>
              <button onClick={generateReview} style={{ padding: '12px 28px', background: T.accent, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>Generate this week's review</button>
            </div>
          )}

          {review && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Score */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px', boxShadow: T.shadowSm }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>Week Score</div>
                  <div style={{ padding: '6px 18px', background: scoreColor2 + '15', color: scoreColor2, borderRadius: 100, fontSize: 15, fontWeight: 800, border: `1px solid ${scoreColor2}28` }}>
                    {review.week_score}/100 — {review.week_label}
                  </div>
                </div>
                <div style={{ height: 8, background: 'var(--surface3)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${review.week_score}%`, background: scoreColor2, borderRadius: 4 }} />
                </div>
              </div>

              {/* Opening */}
              {review.opening && (
                <div style={{ background: 'linear-gradient(135deg, #040410 0%, #0a0a28 100%)', borderRadius: 18, padding: '22px 24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10 }}>Cervio's Read</div>
                  <p style={{ fontSize: 17, fontWeight: 600, color: 'white', lineHeight: 1.6, letterSpacing: -0.2 }}>{review.opening}</p>
                </div>
              )}

              {/* Wins & Misses */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {review.wins?.length > 0 && (
                  <div style={{ background: T.successBg, borderRadius: 16, padding: '18px', border: `1px solid ${T.successBorder}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.success, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Wins</div>
                    {review.wins.slice(0, 4).map((w: string, i: number) => <div key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 7, lineHeight: 1.55, display: 'flex', gap: 7 }}><CheckCircle size={13} style={{ color: T.success, flexShrink: 0, marginTop: 2 }} />{w}</div>)}
                  </div>
                )}
                {review.misses?.length > 0 && (
                  <div style={{ background: T.dangerBg, borderRadius: 16, padding: '18px', border: `1px solid ${T.dangerBorder}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.danger, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Misses</div>
                    {review.misses.slice(0, 4).map((m: string, i: number) => <div key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 7, lineHeight: 1.55, display: 'flex', gap: 7 }}><AlertCircle size={13} style={{ color: T.danger, flexShrink: 0, marginTop: 2 }} />{m}</div>)}
                  </div>
                )}
              </div>

              {/* Patterns */}
              {review.patterns && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px', boxShadow: T.shadowSm }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Pattern Detected</div>
                  <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.68, fontWeight: 500 }}>{review.patterns}</p>
                </div>
              )}

              {/* Next week focus */}
              {review.next_week_focus?.length > 0 && (
                <div style={{ background: T.accentLight, border: `1px solid ${T.accentMid}`, borderRadius: 16, padding: '20px 22px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Next Week Focus</div>
                  {review.next_week_focus.map((f: string, i: number) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, color: 'var(--text)', marginBottom: 8, lineHeight: 1.6, fontWeight: 500 }}>→ {f}</div>
                  ))}
                </div>
              )}

              {/* Challenge */}
              {review.challenge && (
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Closing Thought</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65, fontStyle: 'italic' }}>{review.challenge}</p>
                </div>
              )}

              <button onClick={saveReview} disabled={saving} style={{ padding: '13px 0', background: T.success, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 2px 8px rgba(20,108,52,0.3)' }}>
                <CheckCircle size={15} />{saving ? 'Saving...' : 'Save this review'}
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        savedReviews.length === 0
          ? <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No saved reviews yet. Generate and save a review to build your history.</p>
            </div>
          : savedReviews.map(r => <PastReviewCard key={r.id} review={r} />)
      )}

      <style suppressHydrationWarning>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
