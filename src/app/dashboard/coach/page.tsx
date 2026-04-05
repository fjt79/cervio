'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Zap, RefreshCw, Target, TrendingUp, Brain } from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  danger: '#c41e1e', dangerBg: 'rgba(196,30,30,0.07)', dangerBorder: 'rgba(196,30,30,0.22)',
  success: '#146c34', successBg: 'rgba(20,108,52,0.07)', successBorder: 'rgba(20,108,52,0.22)',
  accent: '#1d4ed8', accentLight: 'rgba(29,78,216,0.09)', accentMid: 'rgba(29,78,216,0.18)',
  warning: '#a16207', warningBg: 'rgba(161,98,7,0.07)', warningBorder: 'rgba(161,98,7,0.2)',
  purple: '#5b21b6', purpleBg: 'rgba(91,33,182,0.07)', purpleBorder: 'rgba(91,33,182,0.18)',
  shadowSm: '0 2px 6px rgba(10,10,11,0.07)', shadowMd: '0 6px 18px rgba(10,10,11,0.09)',
}

function scoreColor(s: number) { return s >= 70 ? T.success : s >= 45 ? T.warning : T.danger }

export default function CoachPage() {
  const [coaching, setCoaching] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user'|'assistant'; content: string}>>([])
  const [chatLoading, setChatLoading] = useState(false)

  const getCoaching = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/coach', { method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoaching(data.coaching)
      setMetrics(data.metrics)
    } catch (err: any) { toast.error(err.message || 'Failed to load coaching') }
    finally { setLoading(false) }
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
    setChatLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/coach/chat', { method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMsg, history: chatHistory }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err: any) { toast.error(err.message) }
    finally { setChatLoading(false) }
  }

  const momentumColor = coaching?.momentum_score >= 70 ? T.success : coaching?.momentum_score >= 45 ? T.warning : T.danger

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 28px 120px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Brain size={22} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8 }}>AI Coach</h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Honest assessment. No filters.</p>
        </div>
        <button onClick={getCoaching} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: loading ? 'var(--surface2)' : T.accent, color: loading ? 'var(--text-secondary)' : 'white', border: loading ? '1px solid var(--border)' : 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 2px 8px rgba(29,78,216,0.3)' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
          {loading ? 'Loading...' : coaching ? 'Refresh' : 'Get coaching'}
        </button>
      </div>

      {/* Metrics row */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Avg goal progress', value: `${metrics.avgProgress || 0}%`, color: scoreColor(metrics.avgProgress || 0) },
            { label: 'Active goals', value: metrics.goalCount || 0, color: 'var(--text)' },
            { label: 'Briefing streak', value: `${metrics.briefingStreak || 0}d`, color: metrics.briefingStreak >= 5 ? T.success : T.warning },
            { label: 'Activity score', value: metrics.totalActivity || 0, color: T.accent },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px', border: '1px solid var(--border)', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: -0.5 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Coaching content */}
      {!coaching && !loading && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '48px 24px', textAlign: 'center', marginBottom: 28, boxShadow: T.shadowSm }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Brain size={28} style={{ color: T.accent }} />
          </div>
          <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Ready to coach you</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.65 }}>Cervio analyses your goals, decisions, and patterns to give you a direct, honest assessment of where you stand and what needs your focus.</p>
          <button onClick={getCoaching} disabled={loading} style={{ padding: '12px 28px', background: T.accent, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>Get coaching session</button>
        </div>
      )}

      {coaching && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>

          {/* Momentum score */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px', boxShadow: T.shadowSm }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>Momentum</div>
              <div style={{ padding: '6px 16px', background: momentumColor + '15', color: momentumColor, borderRadius: 100, fontSize: 14, fontWeight: 800, border: `1px solid ${momentumColor}28` }}>
                {coaching.momentum_score}/100 — {coaching.momentum_label}
              </div>
            </div>
            <div style={{ height: 8, background: 'var(--surface3)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${coaching.momentum_score}%`, background: `linear-gradient(90deg, ${momentumColor}, ${momentumColor}aa)`, borderRadius: 4, transition: 'width 1s ease' }} />
            </div>
          </div>

          {/* Headline */}
          {coaching.headline && (
            <div style={{ background: 'linear-gradient(135deg, #040410 0%, #0a0a28 100%)', borderRadius: 18, padding: '24px 26px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 28px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 10 }}>Cervio says</div>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'white', lineHeight: 1.4, letterSpacing: -0.4 }}>{coaching.headline}</p>
            </div>
          )}

          {/* Honest assessment */}
          {coaching.honest_assessment && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Honest Assessment</div>
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.72, fontWeight: 400 }}>{coaching.honest_assessment}</p>
            </div>
          )}

          {/* The push */}
          {coaching.the_push && (
            <div style={{ background: T.dangerBg, border: `1.5px solid ${T.dangerBorder}`, borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.danger, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>The Push</div>
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.72, fontWeight: 500 }}>{coaching.the_push}</p>
            </div>
          )}

          {/* Spotlight */}
          {coaching.spotlight_goal && (
            <div style={{ background: T.purpleBg, border: `1px solid ${T.purpleBorder}`, borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Spotlight Goal</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{coaching.spotlight_goal}</div>
              {coaching.spotlight_action && (
                <div style={{ padding: '10px 14px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.purple, marginBottom: 4 }}>Action required</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{coaching.spotlight_action}</p>
                </div>
              )}
            </div>
          )}

          {/* Weekly challenge */}
          {coaching.weekly_challenge && (
            <div style={{ background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.success, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>This Week's Challenge</div>
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.65, fontWeight: 500 }}>{coaching.weekly_challenge}</p>
            </div>
          )}
        </div>
      )}

      {/* Chat with Coach */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', boxShadow: T.shadowSm }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <Zap size={15} style={{ color: T.accent }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.2 }}>Ask Cervio anything</div>
        </div>

        {chatHistory.length > 0 && (
          <div style={{ padding: '16px 20px', maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '11px 15px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? T.accent : 'var(--surface2)', color: msg.role === 'user' ? 'white' : 'var(--text)', fontSize: 14, lineHeight: 1.6, border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '11px 15px', background: 'var(--surface2)', borderRadius: '16px 16px 16px 4px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-tertiary)', animation: `dashPulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '14px 16px', borderTop: chatHistory.length > 0 ? '1px solid var(--border)' : 'none', display: 'flex', gap: 10 }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
            placeholder={coaching ? 'Ask about your goals, decisions, priorities...' : 'Get coaching first, then ask follow-up questions'}
            style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 11, padding: '11px 15px', fontSize: 14, color: 'var(--text)', fontFamily: 'inherit', outline: 'none' }}
          />
          <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} style={{ padding: '11px 18px', background: T.accent, color: 'white', border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer', opacity: chatLoading || !chatInput.trim() ? 0.5 : 1 }}>Send</button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes dashPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}
