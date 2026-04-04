'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { RefreshCw, AlertTriangle, Zap, Target, CheckCircle, Shield, Activity, ChevronDown, ChevronUp, Clock, User, ArrowRight, TrendingUp, TrendingDown, Flame, Brain, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────

interface BusinessHealth {
  overall_score: number; revenue_score: number; execution_score: number
  team_score: number; risk_score: number; critical_factors: string[]
  recommended_actions: string[]; projected_score_after_actions: number
}
interface RiskAlert {
  id: string; alert_type: string; severity: string; title: string
  description: string; recommended_action: string; auto_action_available: boolean; created_at: string
}
interface DecisionRec {
  id: string; title: string; context: string; recommendation: string
  confidence_score: number; reasoning: string; expected_impact_approve: string
  expected_impact_reject: string; urgency: string; consequence_label: string
  delay_count: number; consequence_escalation: number; user_action: string | null
  auto_actions: any[]
}
interface ExecutionTask { id: string; title: string; owner: string; status: string; due: string }
interface DecisionMemory { id: string; title: string; action: string; date: string; outcome?: string; matched?: boolean }

// ─── Helpers ──────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 70) return 'var(--success)'
  if (s >= 45) return 'var(--warning)'
  return 'var(--danger)'
}
function severityColor(s: string) {
  return s === 'critical' ? 'var(--danger)' : s === 'high' ? 'var(--warning)' : 'var(--accent)'
}
function getGreeting(name?: string) {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return name ? `${g}, ${name.split(' ')[0]}` : g
}

function ScoreRing({ score, size = 76, color }: { score: number; size?: number; color: string }) {
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

// ─── AI Presence Panel ────────────────────────────────────────

function AICervioPanel({ pendingCount, analysing, onAnalyse }: { pendingCount: number; analysing: boolean; onAnalyse: () => void }) {
  const [open, setOpen] = useState(true)
  const [thinking, setThinking] = useState(false)
  const messages = [
    pendingCount > 0 ? `${pendingCount} decision${pendingCount > 1 ? 's' : ''} blocking execution. Resolve now.` : 'No pending decisions. Run analysis to stay ahead.',
    'Every hour of delay converts to cost. I\'m tracking.',
    'I\'m ready to execute the moment you approve.',
  ]
  const [msgIdx] = useState(0)

  return (
    <div style={{ position: 'fixed', bottom: 80, right: 20, width: 280, zIndex: 45 }}>
      {open && (
        <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', marginBottom: 8, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--accent-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Cervio is watching</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 16 }}>×</button>
          </div>
          <div style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 10 }}>{messages[msgIdx]}</p>
            <button onClick={onAnalyse} disabled={analysing} style={{ width: '100%', padding: '8px 0', background: analysing ? 'var(--surface2)' : 'var(--accent)', color: analysing ? 'var(--text-secondary)' : 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: analysing ? 'not-allowed' : 'pointer' }}>
              {analysing ? '⏳ Analysing...' : '⚡ Run Analysis Now'}
            </button>
          </div>
        </div>
      )}
      {!open && (
        <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '10px 14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
          <Brain size={14} />
          Cervio {pendingCount > 0 ? `(${pendingCount} pending)` : 'ready'}
        </button>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

// ─── Execution Panel (shown after approve) ────────────────────

function ExecutionPanel({ tasks, onClose }: { tasks: ExecutionTask[]; onClose: () => void }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(52,199,89,0.3)', borderRadius: 14, padding: '16px 18px', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>EXECUTION IN PROGRESS</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={14} /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map((task, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: task.status === 'done' ? 'var(--success)' : 'var(--accent-light)', border: `1.5px solid ${task.status === 'done' ? 'var(--success)' : 'var(--accent)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {task.status === 'done' ? <CheckCircle size={10} style={{ color: 'var(--success)' }} /> : <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700 }}>{i+1}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{task.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{task.owner} · {task.due}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: task.status === 'done' ? 'var(--success-bg)' : 'var(--accent-light)', color: task.status === 'done' ? 'var(--success)' : 'var(--accent)' }}>
              {task.status === 'done' ? 'Done' : 'Active'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Consequence Timer ────────────────────────────────────────

function ConsequenceBar({ delayCount, urgency, consequenceLabel }: { delayCount: number; urgency: string; consequenceLabel: string }) {
  if (delayCount === 0 && urgency === 'normal') return null
  const severity = delayCount >= 3 ? 'critical' : delayCount >= 2 ? 'high' : urgency === 'critical' ? 'critical' : 'medium'
  const msgs: Record<string, string> = {
    critical: `⛔ Delayed ${delayCount}× — this is costing you. Every day this sits unresolved compounds the problem.`,
    high: `⚠ Delayed ${delayCount} time${delayCount > 1 ? 's' : ''}. ${consequenceLabel || 'Momentum lost with every hour.'}`,
    medium: `This decision is blocking downstream execution.`
  }
  const colors: Record<string, string> = { critical: 'var(--danger)', high: 'var(--warning)', medium: 'var(--accent)' }
  const bgs: Record<string, string> = { critical: 'var(--danger-bg)', high: 'var(--warning-bg)', medium: 'var(--accent-light)' }
  return (
    <div style={{ padding: '8px 12px', background: bgs[severity], borderRadius: 8, marginBottom: 10 }}>
      <p style={{ fontSize: 12, color: colors[severity], fontWeight: 600, lineHeight: 1.5 }}>{msgs[severity]}</p>
    </div>
  )
}

// ─── Decision Card (fully upgraded) ──────────────────────────

function DecisionCard({ dec, onAction }: { dec: DecisionRec; onAction: (id: string, action: string, tasks?: ExecutionTask[]) => void }) {
  const [expanded, setExpanded] = useState(dec.urgency === 'critical')
  const [showDelegate, setShowDelegate] = useState(false)
  const [showModify, setShowModify] = useState(false)
  const [delegateName, setDelegateName] = useState('')
  const [modifiedPlan, setModifiedPlan] = useState('')
  const [acting, setActing] = useState(false)
  const [executionTasks, setExecutionTasks] = useState<ExecutionTask[] | null>(null)

  const recColor = dec.recommendation === 'approve' ? 'var(--success)' : dec.recommendation === 'reject' ? 'var(--danger)' : 'var(--warning)'
  const recLabel = dec.recommendation === 'approve' ? '✓ APPROVE' : dec.recommendation === 'reject' ? '✗ REJECT' : '⏸ DELAY'

  const urgencyStyle = dec.urgency === 'critical'
    ? { borderColor: 'rgba(255,59,48,0.4)', background: 'rgba(255,59,48,0.02)' }
    : dec.urgency === 'high'
    ? { borderColor: 'rgba(255,149,0,0.3)', background: 'transparent' }
    : { borderColor: 'var(--border)', background: 'transparent' }

  const handleApproveExecute = async () => {
    setActing(true)
    // Generate execution tasks from auto_actions or defaults
    const tasks: ExecutionTask[] = (dec.auto_actions?.length > 0 ? dec.auto_actions : [
      { title: `Confirm decision: ${dec.title}`, owner: 'You', due: 'Today', status: 'active' },
      { title: 'Brief relevant stakeholders', owner: 'You', due: 'This week', status: 'active' },
      { title: 'Set up tracking checkpoint', owner: 'You', due: 'In 7 days', status: 'active' },
    ]).map((a: any, i: number) => ({
      id: `task-${i}`,
      title: a.title || a.description || a,
      owner: a.owner || 'You',
      due: a.due || 'This week',
      status: 'active',
    }))
    setExecutionTasks(tasks)
    await onAction(dec.id, 'approved', tasks)
    setActing(false)
  }

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${urgencyStyle.borderColor}`, borderRadius: 14, overflow: 'hidden', boxShadow: dec.urgency === 'critical' ? '0 0 0 1px rgba(255,59,48,0.08), 0 4px 16px rgba(255,59,48,0.08)' : 'var(--shadow-sm)' }}>

      {/* Critical banner */}
      {dec.urgency === 'critical' && (
        <div style={{ background: 'var(--danger)', padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={11} style={{ color: 'white' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: 0.5 }}>BLOCKING EXECUTION — RESOLVE NOW</span>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              {dec.delay_count > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                  Delayed {dec.delay_count}×
                </span>
              )}
              {dec.consequence_label && (
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', borderLeft: '1px solid var(--border)', paddingLeft: 8 }}>{dec.consequence_label}</span>
              )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 4 }}>{dec.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{dec.context}</div>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: recColor, background: recColor + '18', padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap' }}>{recLabel}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{dec.confidence_score}% confidence</div>
            {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ paddingTop: 14 }}>

            {/* Consequence bar */}
            <ConsequenceBar delayCount={dec.delay_count || 0} urgency={dec.urgency} consequenceLabel={dec.consequence_label} />

            {/* Reasoning */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Why Cervio recommends this</div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{dec.reasoning}</p>
            </div>

            {/* Impact grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ padding: '10px 12px', background: 'rgba(52,199,89,0.08)', borderRadius: 10, border: '0.5px solid rgba(52,199,89,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>IF YOU APPROVE</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{dec.expected_impact_approve}</p>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,59,48,0.06)', borderRadius: 10, border: '0.5px solid rgba(255,59,48,0.15)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>IF YOU IGNORE</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{dec.expected_impact_reject}</p>
              </div>
            </div>

            {/* Execution plan */}
            {(dec.auto_actions?.length > 0 || dec.recommendation === 'approve') && (
              <div style={{ padding: '12px 14px', background: 'var(--accent-light)', borderRadius: 10, marginBottom: 14, border: '0.5px solid rgba(0,122,255,0.2)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>WHAT HAPPENS WHEN YOU APPROVE & EXECUTE</div>
                {(dec.auto_actions?.length > 0 ? dec.auto_actions : [
                  { title: `Decision confirmed and logged`, description: 'Outcome tracked for accuracy scoring' },
                  { title: 'Execution tasks created', description: 'Assigned with deadlines' },
                  { title: 'Follow-up checkpoint set', description: 'In 7 days — outcome review' },
                ]).map((a: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: 'var(--accent)', fontSize: 13, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{a.title || a}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Modify plan */}
            {showModify && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Modify the execution plan:</div>
                <textarea value={modifiedPlan} onChange={e => setModifiedPlan(e.target.value)} placeholder="Describe how you want to modify this plan..." rows={3} style={{ width: '100%', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'var(--text)', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
            )}

            {/* Delegate */}
            {showDelegate && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Delegate to:</div>
                <input value={delegateName} onChange={e => setDelegateName(e.target.value)} placeholder="Name or role..." style={{ width: '100%', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit' }} />
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <button onClick={handleApproveExecute} disabled={acting} style={{ padding: '11px 0', borderRadius: 10, background: 'var(--success)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle size={13} />
                {acting ? 'Executing...' : 'Approve & Execute'}
              </button>
              <button onClick={() => { setShowModify(!showModify); setShowDelegate(false) }} style={{ padding: '11px 0', borderRadius: 10, background: 'var(--surface2)', color: 'var(--text)', border: '0.5px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ✏️ Modify Plan
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => { setShowDelegate(!showDelegate); setShowModify(false) }} style={{ padding: '9px 0', borderRadius: 10, background: 'transparent', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                👤 Delegate
              </button>
              <button onClick={() => onAction(dec.id, 'delayed')} style={{ padding: '9px 0', borderRadius: 10, background: 'transparent', color: 'var(--danger)', border: `0.5px solid var(--danger)`, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ⏸ Delay {dec.delay_count > 0 ? `(${dec.delay_count + 1}×)` : ''}
              </button>
            </div>

            {/* Execution result */}
            {executionTasks && <ExecutionPanel tasks={executionTasks} onClose={() => setExecutionTasks(null)} />}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Decision Memory ──────────────────────────────────────────

function DecisionMemoryPanel({ decisions }: { decisions: DecisionMemory[] }) {
  const [open, setOpen] = useState(false)
  if (decisions.length === 0) return null
  const resolved = decisions.filter(d => d.action && d.action !== 'delayed')
  const accuracy = resolved.filter(d => d.matched === true).length
  const accuracyRate = resolved.length > 0 ? Math.round((accuracy / resolved.length) * 100) : null

  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={15} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Your Decision Performance</span>
          {accuracyRate !== null && (
            <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(accuracyRate), background: scoreColor(accuracyRate) + '18', padding: '2px 8px', borderRadius: 20 }}>{accuracyRate}% accuracy</span>
          )}
        </div>
        {open ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12, marginBottom: 14 }}>
            {[
              { label: 'Total Decisions', value: decisions.length },
              { label: 'Resolved', value: resolved.length },
              { label: 'Accuracy', value: accuracyRate !== null ? `${accuracyRate}%` : '—' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {decisions.slice(0, 5).map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.action === 'approved' ? 'var(--success)' : d.action === 'rejected' ? 'var(--danger)' : 'var(--text-tertiary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.action} · {d.date}</div>
                </div>
                {d.matched !== undefined && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: d.matched ? 'var(--success)' : 'var(--danger)' }}>
                    {d.matched ? '✓' : '✗'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Today's Command ──────────────────────────────────────────

function TodaysCommand({ data }: { data: any }) {
  if (!data) return null
  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1040 50%, #0a1a2f 100%)', borderRadius: 16, padding: '20px 22px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(0,122,255,0.12)', filter: 'blur(40px)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Flame size={14} style={{ color: '#FF9500' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#FF9500', letterSpacing: 1.5 }}>TODAY'S COMMAND</span>
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, color: 'white', lineHeight: 1.35, marginBottom: 10, letterSpacing: -0.3 }}>{data.title}</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: 14 }}>{data.reasoning}</p>
        <div style={{ display: 'flex', gap: 20, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>TIME REQUIRED</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{data.time_required}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>UNLOCKS</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{data.impact}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────

export default function CommandCentrePage() {
  const [profile, setProfile] = useState<any>(null)
  const [health, setHealth] = useState<BusinessHealth | null>(null)
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [pendingDecisions, setPendingDecisions] = useState<DecisionRec[]>([])
  const [resolvedDecisions, setResolvedDecisions] = useState<DecisionMemory[]>([])
  const [oneMoveData, setOneMoveData] = useState<any>(null)
  const [accountabilityData, setAccountabilityData] = useState<any>(null)
  const [pendingActions, setPendingActions] = useState<any[]>([])
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
      const [cmdRes, decHistRes] = await Promise.all([
        fetch('/api/command-centre', { headers }),
        supabase.from('decision_recommendations').select('id, title, user_action, action_taken_at, outcome_matched_recommendation').not('user_action', 'is', null).order('action_taken_at', { ascending: false }).limit(10),
      ])
      const data = await cmdRes.json()
      if (cmdRes.ok) {
        setProfile(data.profile)
        setHealth(data.businessHealth)
        setRiskAlerts(data.riskAlerts || [])
        setPendingDecisions(data.pendingDecisions || [])
        setPendingActions(data.pendingActions || [])
      }
      if (decHistRes.data) {
        setResolvedDecisions(decHistRes.data.map((d: any) => ({
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
      setRiskAlerts(prev => [...(a.risk_alerts || []).map((r: any, i: number) => ({ ...r, id: `new-${i}-${Date.now()}` })), ...prev.slice(0, 3)])
      setPendingDecisions(prev => [...(a.decision_recommendations || []).map((d: any, i: number) => ({ ...d, id: `new-dec-${i}-${Date.now()}`, delay_count: 0 })), ...prev])
      setOneMoveData(a.one_move)
      setAccountabilityData(a.accountability)
      toast.success('Analysis complete — command centre updated')
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed')
    } finally { setAnalysing(false) }
  }

  const handleDecisionAction = async (id: string, action: string, tasks?: ExecutionTask[]) => {
    try {
      const headers = await getHeaders()
      if (!id.startsWith('new-')) {
        await fetch(`/api/command-centre/decisions/${id}`, {
          method: 'PATCH', headers, body: JSON.stringify({ action }),
        })
      }
      if (action === 'delayed') {
        setPendingDecisions(prev => prev.map(d => d.id === id ? { ...d, delay_count: (d.delay_count || 0) + 1 } : d))
        toast(`Decision delayed. This is the ${(pendingDecisions.find(d => d.id === id)?.delay_count || 0) + 1}${['st','nd','rd'][(pendingDecisions.find(d => d.id === id)?.delay_count || 0)] || 'th'} delay.`, { icon: '⏸' })
      } else {
        setPendingDecisions(prev => prev.filter(d => d.id !== id))
        const dec = pendingDecisions.find(d => d.id === id)
        if (dec) {
          setResolvedDecisions(prev => [{ id, title: dec.title, action, date: new Date().toLocaleDateString('en-AU') }, ...prev])
        }
        toast.success(action === 'approved' ? '✓ Approved — execution tasks created' : '✗ Decision rejected and logged')
      }
    } catch (err: any) { toast.error(err.message) }
  }

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

  const criticalAlerts = riskAlerts.filter(a => a.severity === 'critical')
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto', paddingBottom: 120 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
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

      {/* Critical banner */}
      {criticalAlerts.length > 0 && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>
              {criticalAlerts.length} critical issue{criticalAlerts.length > 1 ? 's' : ''} blocking your business:{' '}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>{criticalAlerts.map(a => a.title).join(' · ')}</span>
          </div>
        </div>
      )}

      {/* Today's Command */}
      <TodaysCommand data={oneMoveData} />

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Decisions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>AI Decisions Required</h2>
                {pendingDecisions.length > 0 && (
                  <span style={{ background: pendingDecisions.some(d => d.urgency === 'critical') ? 'var(--danger)' : 'var(--accent)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                    {pendingDecisions.length}
                  </span>
                )}
              </div>
            </div>

            {pendingDecisions.length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '28px 20px', textAlign: 'center' }}>
                <CheckCircle size={22} style={{ color: 'var(--success)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No pending decisions. Run analysis to generate AI recommendations.</p>
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
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,149,0,0.25)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>CERVIO IS WATCHING</div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: accountabilityData.avoidance_patterns?.length > 0 ? 10 : 0 }}>{accountabilityData.pressure_message}</p>
              {accountabilityData.avoidance_patterns?.length > 0 && (
                <div style={{ paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
                  {accountabilityData.avoidance_patterns.map((p: string, i: number) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 3 }}>• {p}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Execution queue */}
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
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{action.description}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, background: 'var(--success)', color: 'white', border: 'none', cursor: 'pointer' }}>Approve</button>
                        <button style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, background: 'var(--surface2)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', cursor: 'pointer' }}>Skip</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Memory */}
          <DecisionMemoryPanel decisions={resolvedDecisions} />

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[
              { href: '/dashboard/decisions', label: 'Decisions', icon: '⚡' },
              { href: '/dashboard/goals', label: 'Goals', icon: '◎' },
              { href: '/dashboard/weekly-review', label: 'Week Review', icon: '★' },
              { href: '/dashboard/stakeholders', label: 'Stakeholders', icon: '◈' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right */}
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
                      {health.overall_score >= 70 ? 'Healthy' : health.overall_score >= 45 ? 'Needs attention' : 'Critical — act now'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Fix this → <span style={{ color: 'var(--success)', fontWeight: 600 }}>{health.projected_score_after_actions}/100</span>
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
                  <div style={{ paddingTop: 12, borderTop: '0.5px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600 }}>DRAGGING YOUR SCORE</div>
                    {health.critical_factors.slice(0, 2).map((f, i) => (
                      <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, paddingLeft: 10, borderLeft: '2px solid var(--danger)' }}>{f}</div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Run analysis to see your business health</p>
                <button onClick={runAnalysis} disabled={analysing} style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontWeight: 500 }}>
                  {analysing ? 'Analysing...' : 'Run Analysis →'}
                </button>
              </div>
            )}
          </div>

          {/* Risks */}
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
                {riskAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id} style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, borderLeft: `3px solid ${severityColor(alert.severity)}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{alert.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: alert.recommended_action ? 6 : 0 }}>{alert.description}</div>
                        {alert.recommended_action && <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>→ {alert.recommended_action}</div>}
                      </div>
                      <button onClick={() => dismissAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16, padding: 0, flexShrink: 0, lineHeight: 1 }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Presence panel */}
      <AICervioPanel pendingCount={pendingDecisions.length} analysing={analysing} onAnalyse={runAnalysis} />
    </div>
  )
}
