'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { RefreshCw, AlertTriangle, Zap, Target, TrendingUp, TrendingDown, ChevronRight, CheckCircle, XCircle, Clock, ArrowRight, Shield, Activity, Flame } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// ─── Types ───────────────────────────────────────────────────

interface BusinessHealth {
  overall_score: number
  revenue_score: number
  execution_score: number
  team_score: number
  risk_score: number
  critical_factors: string[]
  recommended_actions: string[]
  projected_score_after_actions: number
}

interface RiskAlert {
  id: string
  alert_type: string
  severity: string
  title: string
  description: string
  recommended_action: string
  auto_action_available: boolean
  created_at: string
}

interface DecisionRec {
  id: string
  title: string
  context: string
  recommendation: string
  confidence_score: number
  reasoning: string
  expected_impact_approve: string
  expected_impact_reject: string
  urgency: string
  consequence_label: string
  delay_count: number
  consequence_escalation: number
  user_action: string | null
  auto_actions: any[]
}

interface Profile {
  full_name: string
  business_name: string
  subscription_plan: string
}

// ─── Sub-components ──────────────────────────────────────────

function ScoreRing({ score, size = 80, color }: { score: number; size?: number; color: string }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

function scoreColor(s: number) {
  if (s >= 70) return 'var(--success)'
  if (s >= 45) return 'var(--warning)'
  return 'var(--danger)'
}

function severityColor(severity: string) {
  if (severity === 'critical') return 'var(--danger)'
  if (severity === 'high') return 'var(--warning)'
  return 'var(--accent)'
}

function urgencyBadge(urgency: string, delayCount: number) {
  if (delayCount >= 2) return { label: `Delayed ${delayCount}×`, color: 'var(--danger)', bg: 'var(--danger-bg)' }
  if (urgency === 'critical') return { label: 'Critical', color: 'var(--danger)', bg: 'var(--danger-bg)' }
  if (urgency === 'high') return { label: 'Urgent', color: 'var(--warning)', bg: 'var(--warning-bg)' }
  return { label: 'Review', color: 'var(--accent)', bg: 'var(--accent-light)' }
}

function getGreeting(name?: string) {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return name ? `${g}, ${name.split(' ')[0]}` : g
}

// ─── Decision Card ────────────────────────────────────────────

function DecisionCard({ dec, onAction }: { dec: DecisionRec; onAction: (id: string, action: string) => void }) {
  const [showDetail, setShowDetail] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [acting, setActing] = useState(false)
  const badge = urgencyBadge(dec.urgency, dec.delay_count || 0)

  const recColor = dec.recommendation === 'approve' ? 'var(--success)' : dec.recommendation === 'reject' ? 'var(--danger)' : 'var(--warning)'
  const recIcon = dec.recommendation === 'approve' ? '✓ APPROVE' : dec.recommendation === 'reject' ? '✗ REJECT' : '⏸ DELAY'

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${dec.urgency === 'critical' ? 'rgba(255,59,48,0.3)' : 'var(--border)'}`, borderRadius: 14, overflow: 'hidden', boxShadow: dec.urgency === 'critical' ? '0 0 0 1px rgba(255,59,48,0.1)' : 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setShowDetail(!showDetail)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color }}>{badge.label}</span>
              {dec.consequence_label && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{dec.consequence_label}</span>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{dec.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{dec.context}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: recColor, background: recColor + '18', padding: '4px 10px', borderRadius: 8, marginBottom: 4 }}>{recIcon}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{dec.confidence_score}% confidence</div>
          </div>
        </div>
      </div>

      {/* Detail */}
      {showDetail && (
        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ paddingTop: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Cervio's Reasoning</div>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{dec.reasoning}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: '10px 12px', background: 'rgba(52,199,89,0.08)', borderRadius: 10, border: '0.5px solid rgba(52,199,89,0.2)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>IF APPROVED</div>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{dec.expected_impact_approve}</p>
            </div>
            <div style={{ padding: '10px 12px', background: 'rgba(255,59,48,0.06)', borderRadius: 10, border: '0.5px solid rgba(255,59,48,0.15)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>IF REJECTED</div>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{dec.expected_impact_reject}</p>
            </div>
          </div>

          {dec.auto_actions?.length > 0 && (
            <div style={{ padding: '10px 12px', background: 'var(--accent-light)', borderRadius: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>CERVIO WILL EXECUTE</div>
              {dec.auto_actions.map((a: any, i: number) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text)' }}>→ {a.title}</div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onAction(dec.id, 'approved')} disabled={acting} style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: 'var(--success)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: acting ? 0.6 : 1 }}>
              ✓ Approve
            </button>
            <button onClick={() => onAction(dec.id, 'rejected')} disabled={acting} style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: acting ? 0.6 : 1 }}>
              ✗ Reject
            </button>
            <button onClick={() => onAction(dec.id, 'delayed')} disabled={acting} style={{ flex: 1, padding: '9px 0', borderRadius: 10, background: 'var(--surface2)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: acting ? 0.6 : 1 }}>
              ⏸ Delay
            </button>
          </div>

          {dec.delay_count >= 1 && (
            <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8, textAlign: 'center' }}>
              ⚠ You've delayed this {dec.delay_count} time{dec.delay_count > 1 ? 's' : ''}. Every day costs momentum.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────

export default function CommandCentrePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [health, setHealth] = useState<BusinessHealth | null>(null)
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [pendingDecisions, setPendingDecisions] = useState<DecisionRec[]>([])
  const [oneMoveData, setOneMoveData] = useState<any>(null)
  const [accountabilityData, setAccountabilityData] = useState<any>(null)
  const [pendingActions, setPendingActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analysing, setAnalysing] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }
  }

  const loadData = async () => {
    try {
      const headers = await getHeaders()
      const res = await fetch('/api/command-centre', { headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile(data.profile)
      setHealth(data.businessHealth)
      setRiskAlerts(data.riskAlerts || [])
      setPendingDecisions(data.pendingDecisions || [])
      setPendingActions(data.pendingActions || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setPageLoading(false)
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    setAnalysing(true)
    try {
      const headers = await getHeaders()
      const res = await fetch('/api/command-centre', { method: 'POST', headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const a = data.analysis
      setHealth(a.business_health)
      setRiskAlerts(prev => [...(a.risk_alerts || []).map((r: any, i: number) => ({ ...r, id: `new-${i}` })), ...prev])
      setPendingDecisions(prev => [...(a.decision_recommendations || []).map((d: any, i: number) => ({ ...d, id: `new-dec-${i}`, delay_count: 0 })), ...prev])
      setOneMoveData(a.one_move)
      setAccountabilityData(a.accountability)
      toast.success('Analysis complete')
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed')
    } finally {
      setAnalysing(false)
    }
  }

  const handleDecisionAction = async (id: string, action: string) => {
    try {
      const headers = await getHeaders()
      const res = await fetch(`/api/command-centre/decisions/${id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Failed')
      setPendingDecisions(prev => prev.filter(d => d.id !== id))
      toast.success(action === 'approved' ? '✓ Decision approved' : action === 'rejected' ? '✗ Decision rejected' : 'Decision delayed')
      if (action !== 'delayed') loadData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const dismissAlert = async (id: string) => {
    const headers = await getHeaders()
    await supabase.from('risk_alerts').update({ is_dismissed: true }).eq('id', id)
    setRiskAlerts(prev => prev.filter(a => a.id !== id))
  }

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Loading command centre...</p>
      </div>
    )
  }

  const criticalAlerts = riskAlerts.filter(a => a.severity === 'critical')
  const highAlerts = riskAlerts.filter(a => a.severity === 'high')
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 2 }}>
            {getGreeting(profile?.full_name)}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{today} · {profile?.business_name}</p>
        </div>
        <button onClick={runAnalysis} disabled={analysing} style={{ display: 'flex', alignItems: 'center', gap: 8, background: analysing ? 'var(--surface2)' : 'var(--accent)', color: analysing ? 'var(--text-secondary)' : 'white', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: analysing ? 'not-allowed' : 'pointer' }}>
          <RefreshCw size={13} style={{ animation: analysing ? 'spin 0.7s linear infinite' : 'none' }} />
          {analysing ? 'Cervio is thinking...' : 'Run Analysis'}
        </button>
      </div>

      {/* Critical alerts banner */}
      {criticalAlerts.length > 0 && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>{criticalAlerts.length} critical issue{criticalAlerts.length > 1 ? 's' : ''} require your immediate attention: </span>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>{criticalAlerts.map(a => a.title).join(' · ')}</span>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* One Move */}
          {oneMoveData && (
            <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #5E5CE6 100%)', borderRadius: 16, padding: '20px 22px', color: 'white' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, opacity: 0.75, marginBottom: 8 }}>THE ONE MOVE THAT MATTERS TODAY</div>
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>{oneMoveData.title}</div>
              <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6, marginBottom: 12 }}>{oneMoveData.reasoning}</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 12, opacity: 0.7 }}>⏱ {oneMoveData.time_required}</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>→ {oneMoveData.impact}</span>
              </div>
            </div>
          )}

          {/* AI Decisions Required */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>AI Decisions Required</h2>
                {pendingDecisions.length > 0 && (
                  <span style={{ background: 'var(--accent)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{pendingDecisions.length}</span>
                )}
              </div>
            </div>

            {pendingDecisions.length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '32px 20px', textAlign: 'center' }}>
                <CheckCircle size={24} style={{ color: 'var(--success)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No pending decisions. Run analysis to generate recommendations.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingDecisions.map(dec => (
                  <DecisionCard key={dec.id} dec={dec} onAction={handleDecisionAction} />
                ))}
              </div>
            )}
          </div>

          {/* Accountability */}
          {accountabilityData?.pressure_message && (
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,149,0,0.3)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>CERVIO IS WATCHING</div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{accountabilityData.pressure_message}</p>
              {accountabilityData.avoidance_patterns?.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
                  {accountabilityData.avoidance_patterns.map((p: string, i: number) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• {p}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending execution actions */}
          {pendingActions.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Activity size={15} style={{ color: 'var(--success)' }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Cervio Wants to Act</h2>
                <span style={{ background: 'var(--success)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{pendingActions.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingActions.map(action => (
                  <div key={action.id} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{action.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{action.description}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8, background: 'var(--success)', color: 'white', border: 'none', cursor: 'pointer' }}>Approve</button>
                        <button style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, background: 'var(--surface2)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', cursor: 'pointer' }}>Skip</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Business Health */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, border: '0.5px solid var(--border)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>BUSINESS HEALTH</div>

            {health ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <ScoreRing score={health.overall_score} size={76} color={scoreColor(health.overall_score)} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(health.overall_score), lineHeight: 1 }}>{health.overall_score}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>/100</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor(health.overall_score) }}>
                      {health.overall_score >= 70 ? 'Healthy' : health.overall_score >= 45 ? 'Needs attention' : 'Critical'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Fix this → <span style={{ color: 'var(--success)' }}>{health.projected_score_after_actions}/100</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: 'Revenue', score: health.revenue_score },
                    { label: 'Execution', score: health.execution_score },
                    { label: 'Team', score: health.team_score },
                    { label: 'Risk', score: health.risk_score },
                  ].map(({ label, score }) => (
                    <div key={label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score) }}>{score}</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--surface3)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${score}%`, background: scoreColor(score), borderRadius: 2, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {health.critical_factors?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>CRITICAL FACTORS</div>
                    {health.critical_factors.slice(0, 2).map((f, i) => (
                      <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3, paddingLeft: 8, borderLeft: '2px solid var(--danger)' }}>
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Run analysis to see your business health score</p>
                <button onClick={runAnalysis} disabled={analysing} style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontWeight: 500 }}>
                  {analysing ? 'Analysing...' : 'Run Analysis →'}
                </button>
              </div>
            )}
          </div>

          {/* Immediate Risks */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, border: '0.5px solid var(--border)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Shield size={14} style={{ color: 'var(--danger)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>IMMEDIATE RISKS</span>
              {riskAlerts.length > 0 && <span style={{ background: 'var(--danger)', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, marginLeft: 'auto' }}>{riskAlerts.length}</span>}
            </div>

            {riskAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <CheckCircle size={20} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No active risks detected</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {riskAlerts.slice(0, 5).map(alert => {
                  const color = severityColor(alert.severity)
                  return (
                    <div key={alert.id} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, borderLeft: `3px solid ${color}` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{alert.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{alert.description}</div>
                        </div>
                        <button onClick={() => dismissAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16, padding: 0, flexShrink: 0 }}>×</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { href: '/dashboard/decisions', label: 'Decisions', icon: '⚡', color: 'var(--accent)' },
              { href: '/dashboard/goals', label: 'Goals', icon: '◎', color: 'var(--success)' },
              { href: '/dashboard/weekly-review', label: 'Week Review', icon: '★', color: 'var(--warning)' },
              { href: '/dashboard/stakeholders', label: 'Stakeholders', icon: '◈', color: 'var(--purple)' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
