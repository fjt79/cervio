'use client'

import ExecutionPanel from '@/components/features/ExecutionPanel'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  RefreshCw,
  AlertTriangle,
  Zap,
  CheckCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  Flame,
  Brain,
  BarChart2,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type CardState = 'pending' | 'executing' | 'completed' | 'rejected' | 'delayed'
interface Task {
  id: string
  title: string
  owner: string
  due: string
  status: 'pending' | 'in_progress' | 'done'
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
  user_action: string | null
  auto_actions: any[]
}
interface BusinessHealth {
  overall_score: number
  revenue_score: number
  execution_score: number
  team_score: number
  risk_score: number
  critical_factors: string[]
  projected_score_after_actions: number
}
interface RiskAlert {
  id: string
  severity: string
  title: string
  description: string
  recommended_action: string
}
interface FinancialData {
  cash: number
  monthly_burn: number
  monthly_revenue: number
  runway_months: number
  status: string
}
interface OperatorScore {
  score: number
  prev_score: number
  insights: string[]
}

const T = {
  danger: '#c41e1e',
  dangerBg: 'rgba(196,30,30,0.07)',
  dangerBorder: 'rgba(196,30,30,0.22)',
  success: '#146c34',
  successBg: 'rgba(20,108,52,0.07)',
  successBorder: 'rgba(20,108,52,0.22)',
  successBtn: '#155e2f',
  successHover: '#0f4a24',
  accent: '#1d4ed8',
  accentLight: 'rgba(29,78,216,0.09)',
  accentMid: 'rgba(29,78,216,0.18)',
  warning: '#a16207',
  warningBg: 'rgba(161,98,7,0.07)',
  warningBorder: 'rgba(161,98,7,0.2)',
  purple: '#5b21b6',
  purpleBg: 'rgba(91,33,182,0.07)',
  purpleBorder: 'rgba(91,33,182,0.18)',
  shadowSm: '0 2px 6px rgba(10,10,11,0.07), 0 1px 2px rgba(10,10,11,0.05)',
  shadowMd: '0 6px 18px rgba(10,10,11,0.09), 0 2px 6px rgba(10,10,11,0.05)',
  shadowLg: '0 12px 32px rgba(10,10,11,0.11), 0 4px 10px rgba(10,10,11,0.06)',
}

function scoreColor(s: number) {
  return s >= 70 ? T.success : s >= 45 ? T.warning : T.danger
}
function getGreeting(name?: string) {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return name ? `${g}, ${name.split(' ')[0]}` : g
}
function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`
  return `$${n}`
}

function generateTasks(decision: DecisionRec): Task[] {
  if (decision.auto_actions?.length > 0) {
    return decision.auto_actions.slice(0, 4).map((a: any, i: number) => ({
      id: `auto-${i}`,
      title: a.title || String(a),
      owner: a.owner || 'You',
      due: a.due || (i === 0 ? 'Today' : 'This week'),
      status: i === 0 ? ('in_progress' as const) : ('pending' as const),
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
  return ['Downstream execution', 'Team alignment', 'Progress tracking']
}

// ── Simulation Panel ────────────────────────────────────────
function SimulationPanel({ dec }: { dec: DecisionRec }) {
  const [open, setOpen] = useState(false)

  const options = [
    { label: 'Approve Now', icon: '✓', color: T.success, goal: 'positive', risk: 'reduced', exec: 'high', time_now: 'Full impact', time_2w: 'Tracking', time_30d: 'Outcome clear' },
    { label: 'Delay', icon: '⏸', color: T.warning, goal: 'neutral', risk: 'increasing', exec: 'blocked', time_now: 'No change', time_2w: 'Risk grows', time_30d: 'Compounding' },
    { label: 'Reject', icon: '✗', color: T.danger, goal: 'negative', risk: 'unchanged', exec: 'freed', time_now: 'Closed', time_2w: 'Alternatives', time_30d: 'New path' },
  ]

  const indicatorColor = (v: string) =>
    v === 'positive' || v === 'reduced' || v === 'high' || v === 'freed'
      ? T.success
      : v === 'neutral' || v === 'unchanged' || v === 'blocked'
        ? T.warning
        : T.danger

  return (
    <div style={{ marginBottom: 14, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'var(--surface2)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          fontWeight: 700,
          color: T.purple,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        <span>🔬 Simulate Outcomes</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div style={{ padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 12 }}>
            {options.map(opt => (
              <div
                key={opt.label}
                style={{
                  background: 'var(--surface2)',
                  border: `1px solid ${opt.color}22`,
                  borderRadius: 11,
                  padding: '12px 10px',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: opt.color, marginBottom: 10 }}>
                  {opt.icon} {opt.label}
                </div>
                {[['Goals', opt.goal], ['Risk', opt.risk], ['Execution', opt.exec]].map(([k, v]) => (
                  <div
                    key={k}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}
                  >
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>{k}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: indicatorColor(v as string),
                        background: indicatorColor(v as string) + '15',
                        padding: '1px 7px',
                        borderRadius: 20,
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--surface2)', borderRadius: 11, padding: '11px 13px' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 8,
              }}
            >
              Time Impact
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['Now', options.map(o => o.time_now)], ['2 weeks', options.map(o => o.time_2w)], ['30 days', options.map(o => o.time_30d)]].map(
                ([period, vals]: any) => (
                  <div key={period}>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 5, fontWeight: 600 }}>{period}</div>
                    {vals.map((v: string, i: number) => (
                      <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>
                        {['✓', '⏸', '✗'][i]} {v}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Execution Mode Preview ──────────────────────────────────
function ExecutionPreview({ dec, executionMode }: { dec: DecisionRec; executionMode: boolean }) {
  if (!executionMode) return null

  const actions = [
    { icon: '📧', system: 'Gmail', action: 'Draft email to relevant stakeholders', status: 'ready' },
    { icon: '✅', system: 'Tasks', action: `Create task: ${dec.title}`, status: 'ready' },
    { icon: '📅', system: 'Calendar', action: 'Schedule 7-day checkpoint meeting', status: 'ready' },
  ]

  return (
    <div
      style={{
        marginBottom: 14,
        padding: '13px 14px',
        background: T.accentLight,
        borderRadius: 12,
        border: `1px solid ${T.accentMid}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.accent,
          textTransform: 'uppercase',
          letterSpacing: 0.9,
          marginBottom: 10,
        }}
      >
        ⚡ Execution Preview
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map((a, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '8px 10px',
              background: 'var(--surface)',
              borderRadius: 9,
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: 15 }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{a.system}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{a.action}</div>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.success,
                background: T.successBg,
                padding: '2px 8px',
                borderRadius: 20,
                border: `1px solid ${T.successBorder}`,
              }}
            >
              Ready
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: T.accent, marginTop: 10, fontWeight: 500 }}>
        Approving will queue these actions for execution.
      </p>
    </div>
  )
}

// ── Score Ring ──────────────────────────────────────────────
function ScoreRing({ score, size = 88, color }: { score: number; size?: number; color: string }) {
  const r = (size - 11) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.1,0.64,1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>/100</span>
      </div>
    </div>
  )
}

// ── Task Row ────────────────────────────────────────────────
function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const c = { done: T.success, in_progress: T.accent, pending: 'var(--text-tertiary)' }
  const l = { done: 'Done', in_progress: 'Active', pending: 'Pending' }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => onToggle(task.id)}
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: `1.5px solid ${c[task.status]}`,
          background: task.status === 'done' ? c[task.status] : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.15s',
        }}
      >
        {task.status === 'done' && <CheckCircle size={10} style={{ color: 'white' }} />}
        {task.status === 'in_progress' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }} />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: task.status === 'done' ? 'var(--text-tertiary)' : 'var(--text)',
            fontWeight: 500,
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
          👤 {task.owner} · 📅 {task.due}
        </div>
      </div>

      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 100,
          background: c[task.status] + '15',
          color: c[task.status],
          flexShrink: 0,
        }}
      >
        {l[task.status]}
      </span>
    </div>
  )
}

// ── AI Panel ────────────────────────────────────────────────
function AICervioPanel({
  decisions,
  analysing,
  onAnalyse,
}: {
  decisions: DecisionRec[]
  analysing: boolean
  onAnalyse: () => void
}) {
  const [open, setOpen] = useState(true)
  const [msgIdx, setMsgIdx] = useState(0)
  const delayed = decisions.filter(d => (d.delay_count || 0) >= 2)

  const messages =
    delayed.length > 0
      ? [`You have ${delayed.length} stalled decision${delayed.length > 1 ? 's' : ''}. Compounding daily. Resolve now.`]
      : decisions.length > 0
        ? [`${decisions.length} decision${decisions.length > 1 ? 's' : ''} blocking execution.`]
        : ['No pending decisions. Run analysis to stay sharp.']

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 6000)
    return () => clearInterval(t)
  }, [messages.length])

  return (
    <div style={{ position: 'fixed', bottom: 88, right: 20, width: 280, zIndex: 45 }}>
      {open ? (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 16,
            boxShadow: T.shadowLg,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              background: T.accentLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: T.success,
                  animation: 'dashPulse 2s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>Cervio — COO Mode</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 18, lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '13px 14px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.6, marginBottom: 13, minHeight: 40 }}>
              {messages[msgIdx % messages.length]}
            </p>
            <button
              onClick={onAnalyse}
              disabled={analysing}
              style={{
                width: '100%',
                padding: '9px 0',
                background: analysing ? 'var(--surface2)' : T.accent,
                color: analysing ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: analysing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Zap size={12} />
              {analysing ? 'Analysing...' : 'Run Analysis'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%',
            padding: '11px 16px',
            background: T.accent,
            color: 'white',
            border: 'none',
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'center',
            boxShadow: T.shadowLg,
          }}
        >
          <Brain size={14} />
          Cervio {decisions.length > 0 ? `· ${decisions.length} pending` : '· ready'}
        </button>
      )}
    </div>
  )
}

// ── Today's Command ─────────────────────────────────────────
function TodaysCommand({ data, onExecute }: { data: any; onExecute: () => void }) {
  if (!data) return null

  return (
    <div
      style={{
        borderRadius: 18,
        padding: '28px 30px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #040410 0%, #0a0a28 45%, #040a1a 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(29,78,216,0.15)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <Flame size={13} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', letterSpacing: 2, textTransform: 'uppercase' }}>
            Today's Command
          </span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.25, marginBottom: 10, letterSpacing: -0.5 }}>
          {data.title}
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20 }}>{data.reasoning}</p>
        <button
          onClick={onExecute}
          style={{
            padding: '11px 24px',
            background: 'rgba(29,78,216,0.9)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 11,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: '0 4px 16px rgba(29,78,216,0.35)',
          }}
        >
          <CheckCircle size={14} />
          Execute Now
        </button>
      </div>
    </div>
  )
}

// ── Decision Card ───────────────────────────────────────────
function DecisionCard({
  dec,
  health,
  onAction,
  isPrimary,
  executionMode,
  onOpenExecutionPanel,
}: {
  dec: DecisionRec
  health: BusinessHealth | null
  onAction: (id: string, action: string) => void
  isPrimary?: boolean
  executionMode: boolean
  onOpenExecutionPanel: (dec: DecisionRec) => void
}) {
  const [cardState, setCardState] = useState<CardState>('pending')
  const [expanded, setExpanded] = useState(dec.urgency === 'critical' || !!isPrimary)

  const isCritical = dec.urgency === 'critical'
  const recColor = dec.recommendation === 'approve' ? T.success : dec.recommendation === 'reject' ? T.danger : T.warning
  const recLabel = dec.recommendation === 'approve' ? '✓ Approve' : dec.recommendation === 'reject' ? '✗ Reject' : '⏸ Delay'

  const handleApprove = () => {
    onOpenExecutionPanel(dec)
  }

  const handleReject = () => {
    setCardState('rejected')
    onAction(dec.id, 'rejected')
    toast('Rejected and logged', { icon: '✗' })
  }

  const handleDelay = () => {
    onAction(dec.id, 'delayed')
    toast('Delayed — blocking execution', { icon: '⏸' })
  }

  if (cardState === 'rejected') {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', opacity: 0.4 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{dec.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Rejected · logged for accuracy tracking</div>
      </div>
    )
  }

  const leftBar = isCritical ? T.danger : isPrimary ? T.accent : 'transparent'
  const borderColor = isCritical ? T.dangerBorder : isPrimary ? 'var(--border-strong)' : 'var(--border)'
  const boxShadow = isCritical ? `0 4px 20px rgba(196,30,30,0.14), ${T.shadowSm}` : isPrimary ? T.shadowMd : T.shadowSm
  const px = isPrimary ? '26px' : '20px'
  const py = isPrimary ? '22px' : '16px'
  const leftPad = leftBar !== 'transparent' ? (isPrimary ? '28px' : '22px') : undefined

  return (
    <div
      style={{
        background: isCritical ? 'rgba(196,30,30,0.025)' : 'var(--surface)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (cardState === 'pending') {
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = T.shadowLg
        }
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = boxShadow
      }}
    >
      {leftBar !== 'transparent' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: leftBar, zIndex: 1 }} />}

      {isCritical && cardState === 'pending' && (
        <div style={{ background: T.danger, padding: '6px 20px 6px 24px', display: 'flex', alignItems: 'center', gap: 7 }}>
          <AlertTriangle size={11} style={{ color: 'white' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'white' }}>BLOCKING EXECUTION — RESOLVE NOW</span>
        </div>
      )}

      {executionMode && cardState === 'pending' && (
        <div
          style={{
            background: 'rgba(29,78,216,0.06)',
            padding: '4px 20px',
            borderBottom: '1px solid rgba(29,78,216,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Zap size={10} style={{ color: T.accent }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: T.accent }}>Execution Mode active — approve to trigger real actions</span>
        </div>
      )}

      <div style={{ padding: `${py} ${px}`, paddingLeft: leftPad ?? px, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, flexWrap: 'wrap' as const }}>
              {(dec.delay_count || 0) > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 100,
                    background: T.dangerBg,
                    color: T.danger,
                    border: `1px solid ${T.dangerBorder}`,
                  }}
                >
                  Stalled {dec.delay_count}×
                </span>
              )}
              {isPrimary && cardState === 'pending' && !isCritical && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 100,
                    background: T.accentLight,
                    color: T.accent,
                    border: `1px solid ${T.accentMid}`,
                  }}
                >
                  Priority
                </span>
              )}
            </div>

            <div style={{ fontSize: isPrimary ? 20 : 16, fontWeight: isPrimary ? 700 : 650, color: 'var(--text)', lineHeight: 1.3, marginBottom: 6, letterSpacing: -0.3 }}>
              {dec.title}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{dec.context}</div>
          </div>

          <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: recColor,
                background: recColor + '12',
                padding: '5px 12px',
                borderRadius: 100,
                marginBottom: 5,
                whiteSpace: 'nowrap' as const,
                border: `1px solid ${recColor}28`,
              }}
            >
              {recLabel}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{dec.confidence_score}% confidence</div>
            <div style={{ marginTop: 7 }}>{expanded ? <ChevronUp size={13} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} />}</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: `0 ${px} ${py}`, paddingLeft: leftPad ?? px, borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: 18 }}>
            {(dec.delay_count || 0) >= 2 && cardState === 'pending' && (
              <div
                style={{
                  padding: '11px 14px',
                  background: T.dangerBg,
                  borderRadius: 11,
                  marginBottom: 16,
                  border: `1px solid ${T.dangerBorder}`,
                }}
              >
                <p style={{ fontSize: 13, color: T.danger, fontWeight: 700, lineHeight: 1.5 }}>
                  ⛔ Stalled {dec.delay_count} times. Compounding every day. Resolve now.
                </p>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.9,
                  textTransform: 'uppercase' as const,
                  color: 'var(--text-tertiary)',
                  marginBottom: 8,
                }}
              >
                Why this is blocking you
              </div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.68 }}>{dec.reasoning}</p>
            </div>

            <ExecutionPreview dec={dec} executionMode={executionMode} />
            <SimulationPanel dec={dec} />

            <div style={{ padding: '11px 13px', background: T.purpleBg, borderRadius: 12, border: `1px solid ${T.purpleBorder}`, marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.purple,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 0.9,
                  marginBottom: 9,
                }}
              >
                🔗 This Decision Unlocks
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7 }}>
                {getUnlocks(dec.title).map((u, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: T.purple,
                      background: T.purpleBg,
                      border: `1px solid ${T.purpleBorder}`,
                      borderRadius: 100,
                      padding: '3px 10px',
                    }}
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: '12px 14px', background: T.successBg, borderRadius: 12, border: `1px solid ${T.successBorder}` }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.success,
                    marginBottom: 7,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase' as const,
                  }}
                >
                  Execute → Gain
                </div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{dec.expected_impact_approve}</p>
              </div>
              <div style={{ padding: '12px 14px', background: T.dangerBg, borderRadius: 12, border: `1px solid ${T.dangerBorder}` }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.danger,
                    marginBottom: 7,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase' as const,
                  }}
                >
                  Ignore → Cost
                </div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{dec.expected_impact_reject}</p>
              </div>
            </div>

            {cardState === 'pending' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 }}>
                  <button
                    onClick={handleApprove}
                    style={{
                      padding: isPrimary ? '13px 0' : '11px 0',
                      background: T.successBtn,
                      color: 'white',
                      border: 'none',
                      borderRadius: 11,
                      fontSize: isPrimary ? 15 : 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      boxShadow: `0 3px 10px rgba(21,128,61,0.3)`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <CheckCircle size={isPrimary ? 15 : 13} />
                    {executionMode ? '⚡ Approve & Execute' : 'Approve & Execute'}
                  </button>

                  <button
                    onClick={handleReject}
                    style={{
                      padding: isPrimary ? '13px 0' : '11px 0',
                      background: 'transparent',
                      color: T.danger,
                      border: `1.5px solid ${T.dangerBorder}`,
                      borderRadius: 11,
                      fontSize: isPrimary ? 15 : 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <button
                    style={{
                      padding: '9px 0',
                      background: 'var(--surface2)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    👤 Delegate
                  </button>

                  <button
                    onClick={handleDelay}
                    style={{
                      padding: '9px 0',
                      background: 'transparent',
                      color: T.danger,
                      border: `1px solid ${T.dangerBorder}`,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: T.shadowSm }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '15px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <BarChart2 size={15} style={{ color: T.accent }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.2 }}>Decision Performance</span>
          {rate !== null && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 100,
                background: T.accentLight,
                color: T.accent,
                border: `1px solid ${T.accentMid}`,
              }}
            >
              {rate}% accuracy
            </span>
          )}
        </div>
        {open ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
      </button>

      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16, marginBottom: 16 }}>
            {[{ l: 'Total', v: decisions.length }, { l: 'Resolved', v: resolved.length }, { l: 'Accuracy', v: rate !== null ? `${rate}%` : '—' }].map(s => (
              <div key={s.l} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', textAlign: 'center' as const, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5 }}>{s.v}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {decisions.slice(0, 5).map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', background: 'var(--surface2)', borderRadius: 10, marginBottom: 6, border: '1px solid var(--border)' }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: d.action === 'approved' ? T.success : d.action === 'rejected' ? T.danger : 'var(--text-tertiary)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{d.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {d.action} · {d.date}
                </div>
              </div>
              {d.matched !== undefined && <span style={{ fontSize: 12, fontWeight: 700, color: d.matched ? T.success : T.danger }}>{d.matched ? '✓' : '✗'}</span>}
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
  const [executionMode, setExecutionMode] = useState(false)
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [operatorScore, setOperatorScore] = useState<OperatorScore | null>(null)
  const [executionTarget, setExecutionTarget] = useState<DecisionRec | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const getHeaders = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return {
      Authorization: `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    }
  }

  const loadData = async () => {
    try {
      const headers = await getHeaders()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const [cmdRes, histRes, finRes] = await Promise.all([
        fetch('/api/command-centre', { headers }),
        supabase
          .from('decision_recommendations')
          .select('id,title,user_action,action_taken_at,outcome_matched_recommendation')
          .not('user_action', 'is', null)
          .order('action_taken_at', { ascending: false })
          .limit(10),
        user ? supabase.from('financial_data').select('*').eq('user_id', user.id).single() : Promise.resolve({ data: null }),
      ])

      const data = await cmdRes.json()

      if (cmdRes.ok) {
        setProfile(data.profile)
        setHealth(data.businessHealth)
        setRiskAlerts(data.riskAlerts || [])
        setPendingDecisions(data.pendingDecisions || [])
      }

      if (histRes.data) {
        const rd = histRes.data.map((d: any) => ({
          id: d.id,
          title: d.title,
          action: d.user_action,
          date: d.action_taken_at ? new Date(d.action_taken_at).toLocaleDateString('en-AU') : '—',
          matched: d.outcome_matched_recommendation,
        }))
        setResolvedDecisions(rd)

        const delayed = rd.filter((d: any) => d.action === 'delayed').length
        const resolved = rd.filter((d: any) => d.action && d.action !== 'delayed').length
        const accurate = rd.filter((d: any) => d.matched === true).length
        const score = Math.max(0, Math.min(100, 70 + accurate * 3 - delayed * 5 + resolved * 2))

        setOperatorScore({
          score,
          prev_score: score - 3,
          insights: [
            delayed > 2 ? `You delayed ${delayed} decisions this week` : 'Decision velocity is strong',
            resolved > 0 ? `${accurate} of ${resolved} decisions matched recommendations` : 'No decisions resolved yet',
          ],
        })
      }

      if (finRes.data) {
        const fd = finRes.data
        const net = fd.monthly_burn - fd.monthly_revenue
        const runway = net > 0 ? Math.floor(fd.cash / net) : 99
        setFinancialData({ ...fd, runway_months: runway, status: runway >= 12 ? 'stable' : runway >= 6 ? 'watch' : 'critical' })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPageLoading(false)
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
      setRiskAlerts(prev => [...(a.risk_alerts || []).map((r: any, i: number) => ({ ...r, id: `new-${i}-${Date.now()}` })), ...prev.slice(0, 2)])
      setPendingDecisions(prev => [...(a.decision_recommendations || []).map((d: any, i: number) => ({ ...d, id: `new-dec-${i}-${Date.now()}`, delay_count: 0 })), ...prev])
      setOneMoveData(a.one_move)
      setAccountabilityData(a.accountability)
      toast.success('Analysis complete')
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed')
    } finally {
      setAnalysing(false)
    }
  }

  const handleDecisionAction = useCallback(
    (id: string, action: string) => {
      getHeaders().then(headers => {
        if (!id.startsWith('new-')) {
          fetch(`/api/command-centre/decisions/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ action }),
          }).catch(() => {})
        }
      })

      if (action === 'delayed') {
        setPendingDecisions(prev => prev.map(d => (d.id === id ? { ...d, delay_count: (d.delay_count || 0) + 1 } : d)))
        return
      }

      const dec = pendingDecisions.find(d => d.id === id)
      if (dec) {
        setResolvedDecisions(prev => [{ id, title: dec.title, action, date: new Date().toLocaleDateString('en-AU') }, ...prev])
      }

      if (action === 'approved' && health) {
        setHealth(h =>
          h
            ? {
                ...h,
                overall_score: Math.min(100, h.overall_score + 5),
                execution_score: Math.min(100, h.execution_score + 8),
              }
            : h
        )
      }

      setTimeout(() => setPendingDecisions(prev => prev.filter(d => d.id !== id)), 2000)
    },
    [pendingDecisions, health]
  )

  const dismissAlert = async (id: string) => {
    if (!id.startsWith('new-')) {
      await supabase.from('risk_alerts').update({ is_dismissed: true }).eq('id', id)
    }
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
    <div style={{ padding: '28px', maxWidth: 1120, margin: '0 auto', paddingBottom: 140 }}>
      {/* Header with Execution Mode toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.9, marginBottom: 5, lineHeight: 1.05 }}>
            {getGreeting(profile?.full_name)}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            {today}
            {profile?.business_name ? ` · ${profile.business_name}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => {
              setExecutionMode(!executionMode)
              toast(executionMode ? 'Execution Mode off' : '⚡ Execution Mode on — approvals trigger real actions', {
                icon: executionMode ? '○' : '⚡',
              })
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 11,
              border: `1.5px solid ${executionMode ? T.accent : 'var(--border)'}`,
              background: executionMode ? T.accentLight : 'var(--surface)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: executionMode ? `0 0 0 3px ${T.accentLight}, ${T.shadowSm}` : T.shadowSm,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: executionMode ? T.accent : 'var(--text-tertiary)',
                animation: executionMode ? 'dashPulse 2s ease-in-out infinite' : 'none',
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: executionMode ? T.accent : 'var(--text-secondary)', letterSpacing: -0.1 }}>
              Execution Mode
            </span>
          </button>

          <button
            onClick={runAnalysis}
            disabled={analysing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: analysing ? 'var(--surface2)' : T.accent,
              color: analysing ? 'var(--text-secondary)' : 'white',
              border: analysing ? '1px solid var(--border)' : 'none',
              borderRadius: 12,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: analysing ? 'not-allowed' : 'pointer',
              boxShadow: analysing ? 'none' : `0 2px 8px ${T.accentMid}`,
              transition: 'all 0.15s',
            }}
          >
            <RefreshCw size={13} style={{ animation: analysing ? 'spin 0.65s linear infinite' : 'none' }} />
            {analysing ? 'Analysing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Critical banner */}
      {criticalAlerts.length > 0 && (
        <div
          style={{
            background: T.dangerBg,
            border: `1.5px solid ${T.dangerBorder}`,
            borderRadius: 13,
            padding: '13px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <AlertTriangle size={16} style={{ color: T.danger, flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.danger }}>
              {criticalAlerts.length} critical issue{criticalAlerts.length > 1 ? 's' : ''} blocking execution:{' '}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{criticalAlerts.map((a: any) => a.title).join(' · ')}</span>
          </div>
        </div>
      )}

      <TodaysCommand data={oneMoveData} onExecute={() => toast('Click Approve & Execute on your highest priority decision')} />

      {executionTarget && (
        <ExecutionPanel
          decision={executionTarget}
          executionMode={executionMode}
          onClose={() => setExecutionTarget(null)}
          onComplete={() => {
            const dec = pendingDecisions.find(d => d.id === executionTarget?.id)
            if (dec) {
              setResolvedDecisions(prev => [
                {
                  id: executionTarget.id,
                  title: dec.title,
                  action: 'approved',
                  date: new Date().toLocaleDateString('en-AU'),
                },
                ...prev,
              ])
            }

            if (health) {
              setHealth(h =>
                h
                  ? {
                      ...h,
                      overall_score: Math.min(100, h.overall_score + 5),
                      execution_score: Math.min(100, h.execution_score + 8),
                    }
                  : h
              )
            }

            setTimeout(() => setPendingDecisions(prev => prev.filter(d => d.id !== executionTarget?.id)), 2000)
            setExecutionTarget(null)
            toast.success('✓ Execution complete — decision logged')
          }}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 356px', gap: 24 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Zap size={17} style={{ color: T.accent }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.3 }}>AI Decisions Required</h2>
              {pendingDecisions.length > 0 && (
                <span
                  style={{
                    background: pendingDecisions.some(d => d.urgency === 'critical') ? T.danger : T.accent,
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 100,
                  }}
                >
                  {pendingDecisions.length}
                </span>
              )}
            </div>

            {pendingDecisions.length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 24px', textAlign: 'center', boxShadow: T.shadowSm }}>
                <CheckCircle size={24} style={{ color: T.success, margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>No execution blocked. Run analysis to surface decisions.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingDecisions.map((dec, i) => (
                  <DecisionCard
                    key={`card-${dec.id}`}
                    dec={dec}
                    health={health}
                    onAction={handleDecisionAction}
                    isPrimary={i === 0}
                    executionMode={executionMode}
                    onOpenExecutionPanel={(decision) => setExecutionTarget(decision)}
                  />
                ))}
              </div>
            )}
          </div>

          {accountabilityData?.pressure_message && (
            <div style={{ background: 'var(--surface)', border: `1.5px solid ${T.warningBorder}`, borderRadius: 14, padding: '18px 22px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.warning, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
                Cervio is watching
              </div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.68, fontWeight: 500 }}>{accountabilityData.pressure_message}</p>
              {accountabilityData.avoidance_patterns?.map((p: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  • {p}
                </div>
              ))}
            </div>
          )}

          <DecisionMemory decisions={resolvedDecisions} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
            {[
              { href: '/dashboard/decisions', label: 'Decisions', icon: '⚡' },
              { href: '/dashboard/goals', label: 'Goals', icon: '◎' },
              { href: '/dashboard/financial-command', label: 'Financial', icon: '💰' },
              { href: '/dashboard/stakeholders', label: 'Stakeholders', icon: '◈' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 13,
                  padding: '13px 14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                  boxShadow: T.shadowSm,
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = T.shadowMd
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = T.shadowSm
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Business Health */}
          <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', padding: '22px', boxShadow: T.shadowMd }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>
              Business Health
            </div>

            {health ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <ScoreRing score={health.overall_score} color={scoreColor(health.overall_score)} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(health.overall_score), marginBottom: 4, letterSpacing: -0.3 }}>
                      {health.overall_score >= 70 ? 'Healthy' : health.overall_score >= 45 ? 'Needs attention' : 'Critical — act now'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                      With fixes → <span style={{ color: T.success, fontWeight: 800 }}>{health.projected_score_after_actions}</span>
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
                    <div key={label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor(score) }}>{score}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${score}%`,
                            background: scoreColor(score),
                            borderRadius: 3,
                            transition: 'width 0.8s cubic-bezier(0.34,1.1,0.64,1)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {health.critical_factors?.slice(0, 2).map((f, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      marginBottom: 5,
                      paddingLeft: 12,
                      borderLeft: `2.5px solid ${T.danger}`,
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {f}
                  </div>
                ))}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Run analysis to score your business.</p>
                <button
                  onClick={runAnalysis}
                  disabled={analysing}
                  style={{
                    fontSize: 13,
                    color: T.accent,
                    background: T.accentLight,
                    border: `1px solid ${T.accentMid}`,
                    borderRadius: 9,
                    padding: '8px 18px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {analysing ? 'Analysing...' : 'Run Analysis →'}
                </button>
              </div>
            )}
          </div>

          {/* Operator Score */}
          {operatorScore && (
            <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: '18px 20px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                Operator Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: scoreColor(operatorScore.score), letterSpacing: -1, lineHeight: 1 }}>{operatorScore.score}</div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>This week</div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 13,
                      fontWeight: 600,
                      color: operatorScore.score >= operatorScore.prev_score ? T.success : T.danger,
                    }}
                  >
                    {operatorScore.score >= operatorScore.prev_score ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {operatorScore.score >= operatorScore.prev_score ? '+' : ''}
                    {operatorScore.score - operatorScore.prev_score} vs last week
                  </div>
                </div>
              </div>
              {operatorScore.insights.map((insight, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    padding: '7px 10px',
                    background: 'var(--surface2)',
                    borderRadius: 9,
                    marginBottom: 6,
                    border: '1px solid var(--border)',
                    fontWeight: 500,
                  }}
                >
                  • {insight}
                </div>
              ))}
            </div>
          )}

          {/* Financial widget */}
          {financialData ? (
            <Link
              href="/dashboard/financial-command"
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                border: '1px solid var(--border)',
                padding: '18px 20px',
                boxShadow: T.shadowSm,
                textDecoration: 'none',
                display: 'block',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = T.shadowMd
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = T.shadowSm
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>Financial Command</div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 100,
                    background: financialData.status === 'stable' ? T.successBg : financialData.status === 'watch' ? T.warningBg : T.dangerBg,
                    color: financialData.status === 'stable' ? T.success : financialData.status === 'watch' ? T.warning : T.danger,
                    border: `1px solid ${
                      financialData.status === 'stable' ? T.successBorder : financialData.status === 'watch' ? T.warningBorder : T.dangerBorder
                    }`,
                    textTransform: 'capitalize' as const,
                  }}
                >
                  {financialData.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { l: 'Cash', v: fmt(financialData.cash), c: 'var(--text)' },
                  { l: 'Runway', v: `${financialData.runway_months}mo`, c: financialData.runway_months >= 12 ? T.success : financialData.runway_months >= 6 ? T.warning : T.danger },
                  { l: 'Burn', v: fmt(financialData.monthly_burn), c: T.danger },
                  { l: 'Revenue', v: fmt(financialData.monthly_revenue), c: T.success },
                ].map(s => (
                  <div key={s.l} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600 }}>{s.l}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.c, letterSpacing: -0.4 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </Link>
          ) : (
            <Link
              href="/dashboard/financial-command"
              style={{
                background: 'var(--surface)',
                borderRadius: 16,
                border: '1px dashed var(--border)',
                padding: '18px 20px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.15s',
              }}
            >
              <DollarSign size={20} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Add financial data</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Track runway, burn rate, and scenarios</div>
              </div>
            </Link>
          )}

          {/* Risks */}
          <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', padding: '22px', boxShadow: T.shadowSm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <Shield size={15} style={{ color: T.danger }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>Immediate Risks</div>
              {riskAlerts.length > 0 && (
                <span
                  style={{
                    background: T.danger,
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 100,
                    marginLeft: 'auto',
                  }}
                >
                  {riskAlerts.length}
                </span>
              )}
            </div>

            {riskAlerts.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: '8px 0', fontWeight: 500 }}>
                No active risks. Run analysis to check.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {riskAlerts.slice(0, 4).map((alert: any) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: '11px 13px',
                      background: 'var(--surface2)',
                      borderRadius: 11,
                      borderLeft: `3px solid ${alert.severity === 'critical' ? T.danger : alert.severity === 'high' ? T.warning : T.accent}`,
                      border: '1px solid var(--border)',
                      borderLeftWidth: '3px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{alert.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{alert.description}</div>
                        {alert.recommended_action && <div style={{ fontSize: 12, color: T.accent, fontWeight: 700, marginTop: 5 }}>→ {alert.recommended_action}</div>}
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}
                      >
                        ×
                      </button>
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
        @keyframes dashPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(0.65)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}