'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RefreshCw, AlertTriangle, Zap, CheckCircle, Shield, ChevronDown, ChevronUp, ArrowRight, Flame, Brain, Link2, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type CardState = 'pending' | 'executing' | 'completed' | 'rejected' | 'delayed'

interface Task { id: string; title: string; owner: string; due: string; status: 'pending' | 'in_progress' | 'done' }
interface ExecutionState { tasks: Task[]; progress: number; completedCount: number; lastActivity: string; nextCheckpoint: string; startedAt: number }
interface DecisionRec { id: string; title: string; context: string; recommendation: string; confidence_score: number; reasoning: string; expected_impact_approve: string; expected_impact_reject: string; urgency: string; consequence_label: string; delay_count: number; user_action: string | null; auto_actions: any[] }
interface BusinessHealth { overall_score: number; revenue_score: number; execution_score: number; team_score: number; risk_score: number; critical_factors: string[]; recommended_actions: string[]; projected_score_after_actions: number }
interface RiskAlert { id: string; severity: string; title: string; description: string; recommended_action: string }

function scoreColor(s: number) {
  if (s >= 70) return 'var(--success)'
  if (s >= 45) return 'var(--warning)'
  return 'var(--danger)'
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
    { id: 't4', title: 'Schedule 7-day checkpoint review', owner: 'You', due: 'In 7 days', status: 'pending' as const },
  ]
}

function getUnlocks(title: string): string[] {
  const t = title.toLowerCase()
  if (t.includes('revenue') || t.includes('sales')) return ['Q2 target planning', 'Pipeline review', 'Pricing strategy']
  if (t.includes('hire') || t.includes('team')) return ['Onboarding workflow', 'Team OKRs', 'Capacity planning']
  if (t.includes('product') || t.includes('feature')) return ['Sprint planning', 'Customer feedback loop', 'Release timeline']
  if (t.includes('partner') || t.includes('vendor')) return ['Contract review', 'Integration planning', 'Stakeholder brief']
  return ['Downstream execution', 'Team alignment', 'Progress tracking']
}

function ScoreRing({ score, size = 76, color }: { score: number; size?: number; color: string }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>/100</span>
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const colors = { done: 'var(--success)', in_progress: 'var(--accent)', pending: 'var(--text-tertiary)' }
  const labels = { done: 'Done', in_progress: 'In Progress', pending: 'Pending' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={() => onToggle(task.id)} style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${colors[task.status]}`, background: task.status === 'done' ? colors[task.status] : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
        {task.status === 'done' && <CheckCircle size={10} style={{ color: 'white' }} />}
        {task.status === 'in_progress' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: task.status === 'done' ? 'var(--text-secondary)' : 'var(--text)', fontWeight: 500, textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>👤 {task.owner} · 📅 {task.due}</div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: colors[task.status] + '18', color: colors[task.status], whiteSpace: 'nowrap' as const }}>{labels[task.status]}</span>
    </div>
  )
}

function AICervioPanel({ decisions, analysing, onAnalyse }: { decisions: DecisionRec[]; analysing: boolean; onAnalyse: () => void }) {
  const [open, setOpen] = useState(true)
  const [msgIndex, setMsgIndex] = useState(0)
  const delayed = decisions.filter(d => (d.delay_count || 0) >= 2)
  const critical = decisions.filter(d => d.urgency === 'critical').length
  const messages = delayed.length > 0
    ? [`"${delayed[0].title}" delayed ${delayed[0].delay_count}×. Blocking execution.`, 'Every hour of delay is compounding. Act now.']
    : critical > 0 ? [`${critical} critical decision${critical > 1 ? 's' : ''} blocking your business.`]
    : decisions.length > 0 ? [`${decisions.length} decision${decisions.length > 1 ? 's' : ''} awaiting action.`]
    : ['No pending decisions. Run analysis to stay ahead.']

  useEffect(() => {
    const t = setInterval(() => setMsgIndex(i => (i + 1) % messages.length), 5000)
    return () => clearInterval(t)
  }, [messages.length])

  return (
    <div style={{ position: 'fixed', bottom: 84, right: 20, width: 272, zIndex: 45 }}>
      {open ? (
        <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', animation: 'aiPulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>Cervio is watching</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', lineHeight: 1, padding: 2, fontSize: 16 }}>×</button>
          </div>
          <div style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55, marginBottom: 12, minHeight: 40 }}>{messages[msgIndex % messages.length]}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={onAnalyse} disabled={analysing} style={{ padding: '8px 0', background: analysing ? 'var(--surface2)' : 'var(--accent)', color: analysing ? 'var(--text-secondary)' : 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: analysing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Zap size={11} />{analysing ? 'Analysing...' : 'Run Analysis'}
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button style={{ padding: '7px 0', background: 'var(--surface2)', color: 'var(--text)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11, cursor: 'pointer' }}>📩 Send to Team</button>
                <button style={{ padding: '7px 0', background: 'var(--surface2)', color: 'var(--text)', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 11, cursor: 'pointer' }}>📅 Schedule</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '10px 14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
          <Brain size={14} />Cervio {decisions.length > 0 ? `· ${decisions.length} pending` : '· ready'}
        </button>
      )}
      <style>{`@keyframes aiPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

function TodaysCommand({ data, onExecute }: { data: any; onExecute: () => void }) {
  if (!data) return null
  return (
    <div style={{ background: 'linear-gradient(135deg, #050510 0%, #0d0d2b 50%, #050a1a 100%)', borderRadius: 16, padding: '20px 22px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(0,122,255,0.15)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Flame size={13} style={{ color: '#FF9500' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#FF9500', letterSpacing: 2 }}>TODAY'S COMMAND</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 8, letterSpacing: -0.4 }}>{data.title}</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 14 }}>{data.reasoning}</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>TIME</div><div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{data.time_required}</div></div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>UNLOCKS</div><div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{data.impact}</div></div>
        </div>
        <button onClick={onExecute} style={{ padding: '10px 24px', background: 'rgba(0,122,255,0.9)', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle size={13} />Execute Now
        </button>
      </div>
    </div>
  )
}

function DecisionCard({ dec, health, onAction }: { dec: DecisionRec; health: BusinessHealth | null; onAction: (id: string, action: string) => void }) {
  const [cardState, setCardState] = useState<CardState>('pending')
  const [expanded, setExpanded] = useState(dec.urgency === 'critical')
  const [execution, setExecution] = useState<ExecutionState | null>(null)
  const [acting, setActing] = useState(false)
  const unlocks = getUnlocks(dec.title)

  const recColor = dec.recommendation === 'approve' ? 'var(--success)' : dec.recommendation === 'reject' ? 'var(--danger)' : 'var(--warning)'
  const recLabel = dec.recommendation === 'approve' ? '✓ APPROVE' : dec.recommendation === 'reject' ? '✗ REJECT' : '⏸ DELAY'

  // KEY FIX: set local state first, then fire API in background — no await, no flicker
  const handleApprove = () => {
    if (acting) return
    setActing(true)
    const tasks = generateTasks(dec)
    tasks[0].status = 'in_progress'
    const execState: ExecutionState = {
      tasks, progress: Math.round((1 / tasks.length) * 100),
      completedCount: 1, lastActivity: 'Just now',
      nextCheckpoint: 'Tomorrow 9:00 AM', startedAt: Date.now(),
    }
    setExecution(execState)
    setCardState('executing')
    setExpanded(true)
    setActing(false)
    toast.success('✓ Execution started')
    // Fire API in background — no await
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

  const borderColor = cardState === 'executing' ? 'rgba(0,122,255,0.35)' : cardState === 'completed' ? 'rgba(52,199,89,0.35)' : cardState === 'rejected' ? 'rgba(255,59,48,0.2)' : dec.urgency === 'critical' ? 'rgba(255,59,48,0.35)' : 'var(--border)'

  if (cardState === 'rejected') {
    return (
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 16px', opacity: 0.5 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{dec.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Rejected · logged for accuracy tracking</div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--surface)', border: `1.5px solid ${borderColor}`, borderRadius: 14, overflow: 'hidden', boxShadow: cardState === 'executing' ? '0 4px 20px rgba(0,122,255,0.08)' : dec.urgency === 'critical' ? '0 4px 16px rgba(255,59,48,0.06)' : 'var(--shadow-sm)' }}>

      {cardState === 'executing' && (
        <div style={{ background: 'var(--accent)', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'aiPulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>EXECUTING</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginLeft: 'auto' }}>{execution?.progress}% complete</span>
        </div>
      )}
      {cardState === 'completed' && (
        <div style={{ background: 'var(--success)', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={11} style={{ color: 'white' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>EXECUTION COMPLETE</span>
        </div>
      )}
      {dec.urgency === 'critical' && cardState === 'pending' && (
        <div style={{ background: 'var(--danger)', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={11} style={{ color: 'white' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>BLOCKING EXECUTION — RESOLVE NOW</span>
        </div>
      )}

      <div style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' as const }}>
              {(dec.delay_count || 0) > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--danger-bg)', color: 'var(--danger)' }}>Stalled {dec.delay_count}×</span>}
              {dec.consequence_label && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{dec.consequence_label}</span>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 3 }}>{dec.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{dec.context}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: recColor, background: recColor + '18', padding: '4px 10px', borderRadius: 8, marginBottom: 4, whiteSpace: 'nowrap' as const }}>{recLabel}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{dec.confidence_score}% confidence</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ paddingTop: 14 }}>

            {(dec.delay_count || 0) >= 2 && cardState === 'pending' && (
              <div style={{ padding: '8px 12px', background: 'var(--danger-bg)', borderRadius: 8, marginBottom: 12, border: '0.5px solid var(--danger)' }}>
                <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700, lineHeight: 1.5 }}>⛔ Stalled {dec.delay_count} times. Every delay compounds the problem.</p>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 6 }}>Why this is blocking you</div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{dec.reasoning}</p>
            </div>

            <div style={{ padding: '10px 12px', background: 'rgba(175,82,222,0.06)', borderRadius: 10, border: '0.5px solid rgba(175,82,222,0.2)', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 8 }}>🔗 This Decision Unlocks</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                {unlocks.map((u, i) => <span key={i} style={{ fontSize: 12, color: 'var(--purple)', background: 'rgba(175,82,222,0.08)', border: '0.5px solid rgba(175,82,222,0.2)', borderRadius: 20, padding: '3px 10px' }}>{u}</span>)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ padding: '10px 12px', background: 'rgba(52,199,89,0.08)', borderRadius: 10, border: '0.5px solid rgba(52,199,89,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>EXECUTE → GAIN</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{dec.expected_impact_approve}</p>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,59,48,0.06)', borderRadius: 10, border: '0.5px solid rgba(255,59,48,0.15)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>IGNORE → COST</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{dec.expected_impact_reject}</p>
              </div>
            </div>

            {cardState === 'executing' && execution && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 10 }}>🔵 Execution Started</div>
                {execution.tasks.map((task, i) => <TaskRow key={task.id} task={task} onToggle={handleToggleTask} />)}
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.6 }}>Progress</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{execution.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${execution.progress}%`, background: execution.progress === 100 ? 'var(--success)' : 'var(--accent)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>{execution.completedCount} of {execution.tasks.length} tasks · Checkpoint: {execution.nextCheckpoint}</div>
                </div>
              </div>
            )}

            {cardState === 'completed' && (
              <div style={{ marginBottom: 14, padding: '12px 14px', background: 'var(--success-bg)', borderRadius: 10, border: '0.5px solid var(--success)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>✓ All tasks complete</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Decision executed and logged for accuracy scoring.</div>
              </div>
            )}

            {cardState === 'pending' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <button onClick={handleApprove} disabled={acting} style={{ padding: '11px 0', borderRadius: 10, background: 'var(--success)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <CheckCircle size={13} />Approve & Execute
                  </button>
                  <button onClick={handleReject} style={{ padding: '11px 0', borderRadius: 10, background: 'var(--danger-bg)', color: 'var(--danger)', border: '0.5px solid var(--danger)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    ✗ Reject
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button style={{ padding: '9px 0', borderRadius: 10, background: 'transparent', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', fontSize: 13, cursor: 'pointer' }}>
                    👤 Delegate
                  </button>
                  <button onClick={handleDelay} style={{ padding: '9px 0', borderRadius: 10, background: 'transparent', color: 'var(--danger)', border: '0.5px solid var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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

function DecisionMemory({ decisions }: { decisions: any[] }) {
  const [open, setOpen] = useState(false)
  if (decisions.length === 0) return null
  const resolved = decisions.filter(d => d.action && d.action !== 'delayed')
  const accurate = resolved.filter(d => d.matched === true).length
  const rate = resolved.length > 0 ? Math.round((accurate / resolved.length) * 100) : null
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={15} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Your Decision Performance</span>
          {rate !== null && <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(rate), background: scoreColor(rate) + '18', padding: '2px 8px', borderRadius: 20 }}>{rate}% accuracy</span>}
        </div>
        {open ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12, marginBottom: 14 }}>
            {[{ label: 'Total', value: decisions.length }, { label: 'Resolved', value: resolved.length }, { label: 'Accuracy', value: rate !== null ? `${rate}%` : '—' }].map(s => (
              <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' as const }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {decisions.slice(0, 5).map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8, marginBottom: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.action === 'approved' ? 'var(--success)' : d.action === 'rejected' ? 'var(--danger)' : 'var(--text-tertiary)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{d.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.action} · {d.date}</div>
              </div>
              {d.matched !== undefined && <span style={{ fontSize: 11, fontWeight: 700, color: d.matched ? 'var(--success)' : 'var(--danger)' }}>{d.matched ? '✓' : '✗'}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
        setResolvedDecisions(histRes.data.map((d: any) => ({
          id: d.id, title: d.title, action: d.user_action,
          date: d.action_taken_at ? new Date(d.action_taken_at).toLocaleDateString('en-AU') : '—',
          matched: d.outcome_matched_recommendation,
        })))
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
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed')
    } finally { setAnalysing(false) }
  }

  // KEY FIX: no await on API call, purely local state management, no re-render of parent
  const handleDecisionAction = useCallback((id: string, action: string) => {
    // Fire API in background — no await, prevents flicker
    getHeaders().then(headers => {
      if (!id.startsWith('new-')) {
        fetch(`/api/command-centre/decisions/${id}`, {
          method: 'PATCH', headers, body: JSON.stringify({ action })
        }).catch(() => {})
      }
    })

    if (action === 'delayed') {
      setPendingDecisions(prev => prev.map(d => d.id === id ? { ...d, delay_count: (d.delay_count || 0) + 1 } : d))
      return
    }

    const dec = pendingDecisions.find(d => d.id === id)
    if (dec) {
      setResolvedDecisions(prev => [{ id, title: dec.title, action, date: new Date().toLocaleDateString('en-AU') }, ...prev])
    }

    if (action === 'approved' && health) {
      setHealth(h => h ? { ...h, overall_score: Math.min(100, h.overall_score + 5), execution_score: Math.min(100, h.execution_score + 8) } : h)
    }

    // Remove from pending after delay — card manages its own visual state
    setTimeout(() => setPendingDecisions(prev => prev.filter(d => d.id !== id)), 2000)
  }, [pendingDecisions, health])

  const dismissAlert = async (id: string) => {
    if (!id.startsWith('new-')) await supabase.from('risk_alerts').update({ is_dismissed: true }).eq('id', id)
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

  const criticalAlerts = riskAlerts.filter((a: any) => a.severity === 'critical')
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto', paddingBottom: 140 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 2 }}>{getGreeting(profile?.full_name)}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{today} · {profile?.business_name}</p>
        </div>
        <button onClick={runAnalysis} disabled={analysing} style={{ display: 'flex', alignItems: 'center', gap: 8, background: analysing ? 'var(--surface2)' : 'var(--accent)', color: analysing ? 'var(--text-secondary)' : 'white', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: analysing ? 'not-allowed' : 'pointer' }}>
          <RefreshCw size={13} style={{ animation: analysing ? 'spin 0.7s linear infinite' : 'none' }} />
          {analysing ? 'Cervio is thinking...' : 'Run Analysis'}
        </button>
      </div>

      {criticalAlerts.length > 0 && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 12, padding: '11px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={15} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>{criticalAlerts.length} critical issue{criticalAlerts.length > 1 ? 's' : ''} blocking execution: </span>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>{criticalAlerts.map((a: any) => a.title).join(' · ')}</span>
          </div>
        </div>
      )}

      <TodaysCommand data={oneMoveData} onExecute={() => toast('Run Analysis to generate today\'s command')} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Zap size={16} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>AI Decisions Required</h2>
              {pendingDecisions.length > 0 && (
                <span style={{ background: pendingDecisions.some(d => d.urgency === 'critical') ? 'var(--danger)' : 'var(--accent)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                  {pendingDecisions.length}
                </span>
              )}
            </div>
            {pendingDecisions.length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '28px 20px', textAlign: 'center' as const }}>
                <CheckCircle size={22} style={{ color: 'var(--success)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No execution blocked. Run analysis to surface decisions.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingDecisions.map(dec => (
                  <DecisionCard key={`card-${dec.id}`} dec={dec} health={health} onAction={handleDecisionAction} />
                ))}
              </div>
            )}
          </div>

          {accountabilityData?.pressure_message && (
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,149,0,0.25)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>CERVIO IS WATCHING</div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{accountabilityData.pressure_message}</p>
              {accountabilityData.avoidance_patterns?.map((p: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 3, marginTop: 8 }}>• {p}</div>
              ))}
            </div>
          )}

          <DecisionMemory decisions={resolvedDecisions} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[
              { href: '/dashboard/decisions', label: 'Decisions', icon: '⚡' },
              { href: '/dashboard/goals', label: 'Goals', icon: '◎' },
              { href: '/dashboard/weekly-review', label: 'Week Review', icon: '★' },
              { href: '/dashboard/stakeholders', label: 'Stakeholders', icon: '◈' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, border: '0.5px solid var(--border)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 14 }}>BUSINESS HEALTH</div>
            {health ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <ScoreRing score={health.overall_score} color={scoreColor(health.overall_score)} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor(health.overall_score) }}>
                      {health.overall_score >= 70 ? 'Healthy' : health.overall_score >= 45 ? 'Needs attention' : 'Critical — act now'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      After actions → <span style={{ color: 'var(--success)', fontWeight: 700 }}>{health.projected_score_after_actions}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Revenue', score: health.revenue_score },
                    { label: 'Execution', score: health.execution_score },
                    { label: 'Team', score: health.team_score },
                    { label: 'Risk', score: health.risk_score },
                  ].map(({ label, score }) => (
                    <div key={label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score) }}>{score}</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--surface3)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${score}%`, background: scoreColor(score), borderRadius: 2, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
                {health.critical_factors?.slice(0, 2).map((f, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, paddingLeft: 10, borderLeft: '2px solid var(--danger)' }}>{f}</div>
                ))}
              </>
            ) : (
              <div style={{ textAlign: 'center' as const, padding: '16px 0' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>No execution detected. Run analysis.</p>
                <button onClick={runAnalysis} disabled={analysing} style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontWeight: 500 }}>
                  {analysing ? 'Analysing...' : 'Run Analysis →'}
                </button>
              </div>
            )}
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 16, border: '0.5px solid var(--border)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Shield size={13} style={{ color: 'var(--danger)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.8 }}>IMMEDIATE RISKS</span>
              {riskAlerts.length > 0 && <span style={{ background: 'var(--danger)', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, marginLeft: 'auto' }}>{riskAlerts.length}</span>}
            </div>
            {riskAlerts.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' as const, padding: '8px 0' }}>No active risks. Run analysis to check.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {riskAlerts.slice(0, 4).map((alert: any) => (
                  <div key={alert.id} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, borderLeft: `3px solid ${alert.severity === 'critical' ? 'var(--danger)' : alert.severity === 'high' ? 'var(--warning)' : 'var(--accent)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{alert.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{alert.description}</div>
                        {alert.recommended_action && <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>→ {alert.recommended_action}</div>}
                      </div>
                      <button onClick={() => dismissAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
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
        @keyframes aiPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}
