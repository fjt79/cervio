'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RefreshCw, AlertTriangle, Zap, CheckCircle, Shield, ChevronDown, ChevronUp, ArrowRight, Flame, Brain, BarChart2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type CardState = 'pending' | 'executing' | 'completed' | 'rejected' | 'delayed'
interface Task { id: string; title: string; owner: string; due: string; status: 'pending' | 'in_progress' | 'done' }
interface ExecutionState { tasks: Task[]; progress: number; completedCount: number; nextCheckpoint: string; startedAt: number }
interface DecisionRec { id: string; title: string; context: string; recommendation: string; confidence_score: number; reasoning: string; expected_impact_approve: string; expected_impact_reject: string; urgency: string; consequence_label: string; delay_count: number; user_action: string | null; auto_actions: any[] }
interface BusinessHealth { overall_score: number; revenue_score: number; execution_score: number; team_score: number; risk_score: number; critical_factors: string[]; projected_score_after_actions: number }
interface RiskAlert { id: string; severity: string; title: string; description: string; recommended_action: string }

// ── Helpers ──────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 70) return 'var(--success)'
  if (s >= 45) return 'var(--warning)'
  return 'var(--danger)'
}

function scoreBg(s: number) {
  if (s >= 70) return 'var(--success-bg)'
  if (s >= 45) return 'var(--warning-bg)'
  return 'var(--danger-bg)'
}

function getGreeting(name?: string) {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return name ? `${g}, ${name.split(' ')[0]}` : g
}

function timeAgo(ms: number) {
  const diff = Date.now() - ms
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}

function generateTasks(decision: DecisionRec): Task[] {
  if (decision.auto_actions?.length > 0) {
    return decision.auto_actions.slice(0, 4).map((a: any, i: number) => ({
      id: `auto-${i}`, title: a.title || a.description || String(a),
      owner: a.owner || 'You', due: a.due || (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : 'This week'),
      status: i === 0 ? 'in_progress' as const : 'pending' as const,
    }))
  }
  return [
    { id: 't1', title: `Confirm: ${decision.title}`, owner: 'You', due: 'Today', status: 'in_progress' as const },
    { id: 't2', title: 'Brief relevant stakeholders', owner: 'You', due: 'Tomorrow', status: 'pending' as const },
    { id: 't3', title: 'Set measurable success criteria', owner: 'You', due: 'This week', status: 'pending' as const },
    { id: 't4', title: 'Schedule 7-day checkpoint', owner: 'You', due: 'In 7 days', status: 'pending' as const },
  ]
}

function getUnlocks(title: string): string[] {
  const t = title.toLowerCase()
  if (t.includes('revenue') || t.includes('sales')) return ['Q2 target planning', 'Pipeline review', 'Pricing strategy']
  if (t.includes('hire') || t.includes('team')) return ['Onboarding workflow', 'Team OKRs', 'Capacity planning']
  if (t.includes('product') || t.includes('feature')) return ['Sprint planning', 'Customer feedback loop', 'Release timeline']
  return ['Downstream execution', 'Team alignment', 'Progress tracking']
}

// ── Score Ring ──────────────────────────────────────────────

function ScoreRing({ score, size = 80, color }: { score: number; size?: number; color: string }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.1,0.64,1), stroke 0.4s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0 }}>
        <span style={{ fontSize: 22, fontWeight: 750, color, lineHeight: 1, transition: 'color 0.4s ease', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>/100</span>
      </div>
    </div>
  )
}

// ── Task Row ────────────────────────────────────────────────

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const colors = { done: 'var(--success)', in_progress: 'var(--accent)', pending: 'var(--text-tertiary)' }
  const labels = { done: 'Done', in_progress: 'Active', pending: 'Pending' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => onToggle(task.id)} style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${colors[task.status]}`, background: task.status === 'done' ? colors[task.status] : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
        {task.status === 'done' && <CheckCircle size={11} style={{ color: 'white' }} />}
        {task.status === 'in_progress' && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: task.status === 'done' ? 'var(--text-tertiary)' : 'var(--text)', fontWeight: 500, textDecoration: task.status === 'done' ? 'line-through' : 'none', transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>👤 {task.owner} · 📅 {task.due}</div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: colors[task.status] + (task.status === 'done' ? '' : '15'), color: colors[task.status], flexShrink: 0, border: `1px solid ${colors[task.status]}22` }}>{labels[task.status]}</span>
    </div>
  )
}

// ── AI Panel ────────────────────────────────────────────────

function AICervioPanel({ decisions, analysing, onAnalyse }: { decisions: DecisionRec[]; analysing: boolean; onAnalyse: () => void }) {
  const [open, setOpen] = useState(true)
  const [msgIdx, setMsgIdx] = useState(0)
  const delayed = decisions.filter(d => (d.delay_count || 0) >= 2)
  const critical = decisions.filter(d => d.urgency === 'critical').length
  const messages = delayed.length > 0
    ? [`"${delayed[0].title}" delayed ${delayed[0].delay_count}×. Blocking execution.`, 'Every delay compounds the problem.']
    : critical > 0 ? [`${critical} critical decision${critical > 1 ? 's' : ''} requiring your action.`]
    : decisions.length > 0 ? [`${decisions.length} decision${decisions.length > 1 ? 's' : ''} awaiting action.`]
    : ['No pending decisions. Run analysis to stay ahead.']

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 5500)
    return () => clearInterval(t)
  }, [messages.length])

  return (
    <div style={{ position: 'fixed', bottom: 88, right: 20, width: 276, zIndex: 45 }}>
      {open ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }} className="animate-slide-up">
          <div style={{ padding: '11px 16px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} className="animate-pulse-dot" />
              <span style={{ fontSize: 12, fontWeight: 650, color: 'var(--accent)', letterSpacing: -0.1 }}>Cervio is watching</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 18, lineHeight: 1, padding: '0 2px', borderRadius: 4 }}>×</button>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 14, minHeight: 42 }}>{messages[msgIdx % messages.length]}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <button onClick={onAnalyse} disabled={analysing} style={{ padding: '9px 0', background: analysing ? 'var(--surface2)' : 'var(--accent)', color: analysing ? 'var(--text-secondary)' : 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: analysing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s', boxShadow: analysing ? 'none' : '0 1px 3px rgba(37,99,235,0.3)' }}>
                <Zap size={12} />{analysing ? 'Analysing...' : 'Run Analysis'}
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                {['📩 Send to Team', '📅 Schedule'].map(t => (
                  <button key={t} style={{ padding: '8px 0', background: 'var(--surface2)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 9, fontSize: 12, cursor: 'pointer', transition: 'all 0.12s' }}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '11px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <Brain size={14} />Cervio {decisions.length > 0 ? `· ${decisions.length} pending` : '· ready'}
        </button>
      )}
    </div>
  )
}

// ── Today's Command ─────────────────────────────────────────

function TodaysCommand({ data, onExecute }: { data: any; onExecute: () => void }) {
  if (!data) return null
  return (
    <div style={{ background: 'linear-gradient(135deg, #06060f 0%, #0e0e28 55%, #060a18 100%)', borderRadius: 18, padding: '22px 26px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(37,99,235,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <Flame size={12} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: 1.8, textTransform: 'uppercase' }}>Today's Command</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 8, letterSpacing: -0.4 }}>{data.title}</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 16 }}>{data.reasoning}</p>
        <div style={{ display: 'flex', gap: 20, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {[['TIME', data.time_required], ['UNLOCKS', data.impact]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 3, letterSpacing: 1 }}>{l}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
        <button onClick={onExecute} style={{ padding: '10px 22px', background: 'rgba(37,99,235,0.85)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13, fontWeight: 650, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
          <CheckCircle size={13} />Execute Now
        </button>
      </div>
    </div>
  )
}

// ── Decision Card ───────────────────────────────────────────

function DecisionCard({ dec, health, onAction, isPrimary }: { dec: DecisionRec; health: BusinessHealth | null; onAction: (id: string, action: string) => void; isPrimary?: boolean }) {
  const [cardState, setCardState] = useState<CardState>('pending')
  const [expanded, setExpanded] = useState(dec.urgency === 'critical' || isPrimary)
  const [execution, setExecution] = useState<ExecutionState | null>(null)
  const [acting, setActing] = useState(false)
  const unlocks = getUnlocks(dec.title)

  const recColor = dec.recommendation === 'approve' ? 'var(--success)' : dec.recommendation === 'reject' ? 'var(--danger)' : 'var(--warning)'
  const recLabel = dec.recommendation === 'approve' ? '✓ Approve' : dec.recommendation === 'reject' ? '✗ Reject' : '⏸ Delay'

  const handleApprove = () => {
    if (acting) return
    setActing(true)
    const tasks = generateTasks(dec)
    tasks[0].status = 'in_progress'
    setExecution({ tasks, progress: Math.round((1 / tasks.length) * 100), completedCount: 1, nextCheckpoint: 'Tomorrow 9:00 AM', startedAt: Date.now() })
    setCardState('executing')
    setExpanded(true)
    setActing(false)
    toast.success('✓ Execution started')
    onAction(dec.id, 'approved')
  }

  const handleReject = () => {
    setCardState('rejected')
    onAction(dec.id, 'rejected')
    toast('Decision rejected and logged', { icon: '✗' })
  }

  const handleDelay = () => {
    onAction(dec.id, 'delayed')
    toast('Delayed — this is blocking execution', { icon: '⏸' })
  }

  const handleToggleTask = (taskId: string) => {
    if (!execution) return
    const updated = execution.tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'done' ? 'pending' as const : 'done' as const } : t)
    const completed = updated.filter(t => t.status === 'done').length
    const progress = Math.round((completed / updated.length) * 100)
    setExecution({ ...execution, tasks: updated, completedCount: completed, progress, startedAt: Date.now() })
    if (progress === 100) { setCardState('completed'); toast.success('✓ All tasks complete') }
  }

  if (cardState === 'rejected') {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px', opacity: 0.5 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{dec.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Rejected · logged for accuracy tracking</div>
      </div>
    )
  }

  const borderColor = cardState === 'executing' ? 'rgba(37,99,235,0.28)' : cardState === 'completed' ? 'var(--success-border)' : dec.urgency === 'critical' ? 'var(--danger-border)' : 'var(--border)'
  const cardPadding = isPrimary ? '22px 24px' : '18px 20px'
  const titleSize = isPrimary ? 17 : 15

  return (
    <div
      className={cardState === 'executing' ? 'executing-card' : ''}
      style={{ background: 'var(--surface)', border: `1.5px solid ${borderColor}`, borderRadius: 18, overflow: 'hidden', boxShadow: cardState === 'executing' ? '0 4px 20px rgba(37,99,235,0.08), var(--shadow-sm)' : isPrimary ? 'var(--shadow-md)' : 'var(--shadow-sm)', transition: 'all 0.25s ease' }}
      onMouseEnter={e => { if (cardState === 'pending') (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
    >
      {/* State banners */}
      {cardState === 'executing' && (
        <div style={{ background: 'var(--accent)', padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} className="animate-pulse-dot" />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: 0.6 }}>EXECUTING</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginLeft: 'auto' }}>{execution?.progress}% complete</span>
        </div>
      )}
      {cardState === 'completed' && (
        <div style={{ background: 'var(--success)', padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={11} style={{ color: 'white' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>EXECUTION COMPLETE</span>
        </div>
      )}
      {dec.urgency === 'critical' && cardState === 'pending' && (
        <div style={{ background: 'var(--danger)', padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 7 }}>
          <AlertTriangle size={11} style={{ color: 'white' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>BLOCKING EXECUTION — RESOLVE NOW</span>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: cardPadding, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' as const }}>
              {(dec.delay_count || 0) > 0 && (
                <span className="badge badge-danger">Stalled {dec.delay_count}×</span>
              )}
              {dec.consequence_label && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{dec.consequence_label}</span>}
            </div>
            <div style={{ fontSize: titleSize, fontWeight: 650, color: 'var(--text)', lineHeight: 1.35, marginBottom: 6, letterSpacing: -0.2 }}>{dec.title}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{dec.context}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' as const, paddingTop: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 650, color: recColor, background: recColor + '14', padding: '5px 11px', borderRadius: 100, marginBottom: 5, whiteSpace: 'nowrap' as const, border: `1px solid ${recColor}22` }}>{recLabel}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{dec.confidence_score}% confidence</div>
            <div style={{ marginTop: 8 }}>{expanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: `0 ${isPrimary ? '24px' : '20px'} ${isPrimary ? '22px' : '18px'}`, borderTop: '1px solid var(--border)' }} className="animate-slide-down">
          <div style={{ paddingTop: 18 }}>

            {(dec.delay_count || 0) >= 2 && cardState === 'pending' && (
              <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: 10, marginBottom: 14, border: '1px solid var(--danger-border)' }}>
                <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600, lineHeight: 1.5 }}>⛔ Stalled {dec.delay_count} times. Every delay compounds the problem.</p>
              </div>
            )}

            {/* Reasoning */}
            <div style={{ marginBottom: 16 }}>
              <div className="text-label" style={{ marginBottom: 8 }}>Why this is blocking you</div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65 }}>{dec.reasoning}</p>
            </div>

            {/* Unlocks */}
            <div style={{ padding: '12px 14px', background: 'var(--purple-bg)', borderRadius: 12, border: '1px solid var(--purple-border)', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase' as const, letterSpacing: 0.9, marginBottom: 10 }}>🔗 This Decision Unlocks</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7 }}>
                {unlocks.map((u, i) => <span key={i} className="badge badge-purple">{u}</span>)}
              </div>
            </div>

            {/* Impact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: '12px 14px', background: 'var(--success-bg)', borderRadius: 12, border: '1px solid var(--success-border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' as const }}>Execute → Gain</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{dec.expected_impact_approve}</p>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--danger-bg)', borderRadius: 12, border: '1px solid var(--danger-border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' as const }}>Ignore → Cost</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{dec.expected_impact_reject}</p>
              </div>
            </div>

            {/* Execution view */}
            {cardState === 'executing' && execution && (
              <div style={{ marginBottom: 16 }} className="animate-slide-down">
                <div className="text-label" style={{ marginBottom: 12 }}>🔵 Execution in Progress</div>
                <div style={{ marginBottom: 14 }}>
                  {execution.tasks.map(task => <TaskRow key={task.id} task={task} onToggle={handleToggleTask} />)}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.6 }}>Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{execution.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${execution.progress}%`, background: execution.progress === 100 ? 'var(--success)' : 'var(--accent)' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 7 }}>
                    {execution.completedCount} of {execution.tasks.length} tasks · Checkpoint: {execution.nextCheckpoint}
                  </div>
                </div>
              </div>
            )}

            {cardState === 'completed' && (
              <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--success-bg)', borderRadius: 12, border: '1px solid var(--success-border)' }}>
                <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--success)', marginBottom: 4 }}>✓ All tasks complete</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Decision executed and logged for accuracy scoring.</div>
              </div>
            )}

            {/* Action buttons */}
            {cardState === 'pending' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 }}>
                  <button onClick={handleApprove} disabled={acting} className="btn btn-success" style={{ padding: '11px 0', fontSize: 14, justifyContent: 'center' }}>
                    <CheckCircle size={14} />Approve & Execute
                  </button>
                  <button onClick={handleReject} className="btn btn-danger" style={{ padding: '11px 0', fontSize: 14, justifyContent: 'center' }}>
                    ✗ Reject
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <button className="btn btn-ghost" style={{ padding: '10px 0', fontSize: 13, justifyContent: 'center' }}>
                    👤 Delegate
                  </button>
                  <button onClick={handleDelay} className="btn btn-danger" style={{ padding: '10px 0', fontSize: 13, justifyContent: 'center' }}>
                    ⏸ Delay {(dec.delay_count || 0) > 0 ? `(${dec.delay_count + 1}×)` : ''}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Decision Memory ─────────────────────────────────────────

function DecisionMemory({ decisions }: { decisions: any[] }) {
  const [open, setOpen] = useState(false)
  if (decisions.length === 0) return null
  const resolved = decisions.filter(d => d.action && d.action !== 'delayed')
  const accurate = resolved.filter(d => d.matched === true).length
  const rate = resolved.length > 0 ? Math.round((accurate / resolved.length) * 100) : null

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart2 size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 15, fontWeight: 650, color: 'var(--text)' }}>Decision Performance</span>
          {rate !== null && <span className="badge badge-accent">{rate}% accuracy</span>}
        </div>
        {open ? <ChevronUp size={15} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-tertiary)' }} />}
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }} className="animate-slide-down">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16, marginBottom: 16 }}>
            {[{ label: 'Total', value: decisions.length }, { label: 'Resolved', value: resolved.length }, { label: 'Accuracy', value: rate !== null ? `${rate}%` : '—' }].map(s => (
              <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', textAlign: 'center' as const }}>
                <div style={{ fontSize: 24, fontWeight: 750, color: 'var(--text)', letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {decisions.slice(0, 5).map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, marginBottom: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.action === 'approved' ? 'var(--success)' : d.action === 'rejected' ? 'var(--danger)' : 'var(--text-tertiary)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{d.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{d.action} · {d.date}</div>
              </div>
              {d.matched !== undefined && <span style={{ fontSize: 12, fontWeight: 700, color: d.matched ? 'var(--success)' : 'var(--danger)' }}>{d.matched ? '✓' : '✗'}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────

export default function CommandCentrePage() {
  const [profile, setProfile] = useState<any>(null)
  const [health, setHealth] = useState<BusinessHealth | null>(null)
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [pendingDecisions, setPendingDecisions] = useState<DecisionRec[]>([])
  const [resolvedDecisions, setResolvedDecisions] = useState<any[]>([])
  const [oneMoveData, setOneMoveData] = useState<any>(null)
  const [accountabilityData, setAccountabilityData] = useState<any>(null)
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
      const [cmdRes, histRes] = await Promise.all([
        fetch('/api/command-centre', { headers }),
        supabase.from('decision_recommendations').select('id,title,user_action,action_taken_at,outcome_matched_recommendation').not('user_action', 'is', null).order('action_taken_at', { ascending: false }).limit(10),
      ])
      const data = await cmdRes.json()
      if (cmdRes.ok) {
        setProfile(data.profile)
        setHealth(data.businessHealth)
        setRiskAlerts(data.riskAlerts || [])
        setPendingDecisions(data.pendingDecisions || [])
      }
      if (histRes.data) {
        setResolvedDecisions(histRes.data.map((d: any) => ({ id: d.id, title: d.title, action: d.user_action, date: d.action_taken_at ? new Date(d.action_taken_at).toLocaleDateString('en-AU') : '—', matched: d.outcome_matched_recommendation })))
      }
    } catch (err) { console.error(err) }
    finally { setPageLoading(false) }
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
      setRiskAlerts(prev => [...(a.risk_alerts || []).map((r: any, i: number) => ({ ...r, id: `new-${i}-${Date.now()}` })), ...prev.slice(0, 2)])
      setPendingDecisions(prev => [...(a.decision_recommendations || []).map((d: any, i: number) => ({ ...d, id: `new-dec-${i}-${Date.now()}`, delay_count: 0 })), ...prev])
      setOneMoveData(a.one_move)
      setAccountabilityData(a.accountability)
      toast.success('Analysis complete')
    } catch (err: any) { toast.error(err.message || 'Analysis failed') }
    finally { setAnalysing(false) }
  }

  const handleDecisionAction = useCallback((id: string, action: string) => {
    getHeaders().then(headers => {
      if (!id.startsWith('new-')) {
        fetch(`/api/command-centre/decisions/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ action }) }).catch(() => {})
      }
    })
    if (action === 'delayed') {
      setPendingDecisions(prev => prev.map(d => d.id === id ? { ...d, delay_count: (d.delay_count || 0) + 1 } : d))
      return
    }
    const dec = pendingDecisions.find(d => d.id === id)
    if (dec) setResolvedDecisions(prev => [{ id, title: dec.title, action, date: new Date().toLocaleDateString('en-AU') }, ...prev])
    if (action === 'approved' && health) {
      setHealth(h => h ? { ...h, overall_score: Math.min(100, h.overall_score + 5), execution_score: Math.min(100, h.execution_score + 8) } : h)
    }
    setTimeout(() => setPendingDecisions(prev => prev.filter(d => d.id !== id)), 2000)
  }, [pendingDecisions, health])

  const dismissAlert = async (id: string) => {
    if (!id.startsWith('new-')) await supabase.from('risk_alerts').update({ is_dismissed: true }).eq('id', id)
    setRiskAlerts(prev => prev.filter(a => a.id !== id))
  }

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 14 }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Loading command centre...</p>
      </div>
    )
  }

  const criticalAlerts = riskAlerts.filter((a: any) => a.severity === 'critical')
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1120, margin: '0 auto', paddingBottom: 140 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.8, marginBottom: 4, lineHeight: 1.1 }}>{getGreeting(profile?.full_name)}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 400 }}>{today}{profile?.business_name ? ` · ${profile.business_name}` : ''}</p>
        </div>
        <button onClick={runAnalysis} disabled={analysing} style={{ display: 'flex', alignItems: 'center', gap: 8, background: analysing ? 'var(--surface2)' : 'var(--accent)', color: analysing ? 'var(--text-secondary)' : 'white', border: analysing ? '1px solid var(--border)' : 'none', borderRadius: 12, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: analysing ? 'not-allowed' : 'pointer', boxShadow: analysing ? 'none' : '0 1px 3px rgba(37,99,235,0.3)', transition: 'all 0.15s' }}>
          <RefreshCw size={13} style={{ animation: analysing ? 'spin 0.65s linear infinite' : 'none' }} />
          {analysing ? 'Analysing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Critical banner */}
      {criticalAlerts.length > 0 && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 14, padding: '13px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }} className="animate-slide-down">
          <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: 14, fontWeight: 650, color: 'var(--danger)' }}>{criticalAlerts.length} critical issue{criticalAlerts.length > 1 ? 's' : ''} blocking execution: </span>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>{criticalAlerts.map((a: any) => a.title).join(' · ')}</span>
          </div>
        </div>
      )}

      <TodaysCommand data={oneMoveData} onExecute={() => toast('Click Approve & Execute on your highest priority decision')} />

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 352px', gap: 24 }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Decisions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Zap size={16} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: 18, fontWeight: 650, color: 'var(--text)', letterSpacing: -0.2 }}>AI Decisions Required</h2>
              {pendingDecisions.length > 0 && (
                <span className={`badge ${pendingDecisions.some(d => d.urgency === 'critical') ? 'badge-danger' : 'badge-accent'}`}>{pendingDecisions.length}</span>
              )}
            </div>
            {pendingDecisions.length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '36px 24px', textAlign: 'center' as const, boxShadow: 'var(--shadow-xs)' }}>
                <CheckCircle size={24} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No execution blocked. Run analysis to surface decisions.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingDecisions.map((dec, i) => (
                  <DecisionCard key={`card-${dec.id}`} dec={dec} health={health} onAction={handleDecisionAction} isPrimary={i === 0} />
                ))}
              </div>
            )}
          </div>

          {/* Accountability */}
          {accountabilityData?.pressure_message && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--warning-border)', borderRadius: 18, padding: '18px 22px', boxShadow: 'var(--shadow-xs)' }}>
              <div className="text-label" style={{ color: 'var(--warning)', marginBottom: 10 }}>Cervio is watching</div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65 }}>{accountabilityData.pressure_message}</p>
              {accountabilityData.avoidance_patterns?.map((p: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, marginTop: 10 }}>• {p}</div>
              ))}
            </div>
          )}

          <DecisionMemory decisions={resolvedDecisions} />

          {/* Quick nav */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
            {[
              { href: '/dashboard/decisions', label: 'Decisions', icon: '⚡' },
              { href: '/dashboard/goals', label: 'Goals', icon: '◎' },
              { href: '/dashboard/weekly-review', label: 'Week Review', icon: '★' },
              { href: '/dashboard/stakeholders', label: 'Stakeholders', icon: '◈' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '13px 14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s', boxShadow: 'var(--shadow-xs)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-xs)'; }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Business Health */}
          <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
            <div className="text-label" style={{ marginBottom: 18 }}>Business Health</div>
            {health ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <ScoreRing score={health.overall_score} color={scoreColor(health.overall_score)} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 650, color: scoreColor(health.overall_score), marginBottom: 4 }}>
                      {health.overall_score >= 70 ? 'Healthy' : health.overall_score >= 45 ? 'Needs attention' : 'Critical — act now'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                      With fixes → <span style={{ color: 'var(--success)', fontWeight: 650 }}>{health.projected_score_after_actions}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 16 }}>
                  {[
                    { label: 'Revenue', score: health.revenue_score },
                    { label: 'Execution', score: health.execution_score },
                    { label: 'Team', score: health.team_score },
                    { label: 'Risk', score: health.risk_score },
                  ].map(({ label, score }) => (
                    <div key={label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(score) }}>{score}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${score}%`, background: scoreColor(score) }} />
                      </div>
                    </div>
                  ))}
                </div>
                {health.critical_factors?.slice(0, 2).map((f, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, paddingLeft: 12, borderLeft: `2px solid var(--danger)`, lineHeight: 1.55 }}>{f}</div>
                ))}
              </>
            ) : (
              <div style={{ textAlign: 'center' as const, padding: '20px 0' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Run analysis to score your business.</p>
                <button onClick={runAnalysis} disabled={analysing} style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: '1px solid var(--accent-mid)', borderRadius: 9, padding: '8px 18px', cursor: 'pointer', fontWeight: 600 }}>
                  {analysing ? 'Analysing...' : 'Run Analysis →'}
                </button>
              </div>
            )}
          </div>

          {/* Risks */}
          <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <Shield size={14} style={{ color: 'var(--danger)' }} />
              <div className="text-label">Immediate Risks</div>
              {riskAlerts.length > 0 && <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>{riskAlerts.length}</span>}
            </div>
            {riskAlerts.length === 0 ? (
              <div style={{ textAlign: 'center' as const, padding: '10px 0' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No active risks detected.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {riskAlerts.slice(0, 4).map((alert: any) => (
                  <div key={alert.id} style={{ padding: '12px 14px', background: 'var(--surface2)', borderRadius: 12, borderLeft: `3px solid ${alert.severity === 'critical' ? 'var(--danger)' : alert.severity === 'high' ? 'var(--warning)' : 'var(--accent)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{alert.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{alert.description}</div>
                        {alert.recommended_action && <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginTop: 5 }}>→ {alert.recommended_action}</div>}
                      </div>
                      <button onClick={() => dismissAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0, borderRadius: 4, transition: 'color 0.12s' }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AICervioPanel decisions={pendingDecisions} analysing={analysing} onAnalyse={runAnalysis} />

      <style>{`
        @keyframes aiPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
